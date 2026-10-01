/* =========================================================
   RÉSERVATIONS — accès aux données
   ========================================================= */
import { randomBytes } from "node:crypto";
import { booking, services } from "@/lib/data";
import { db, type Row } from "@/lib/db";
import { daySlots, serviceById, type Span } from "./slots";
import { addDays, parisOf, parisToDate } from "./time";

export type Status = "confirmed" | "done" | "no_show" | "cancelled";
export const STATUSES: Status[] = ["confirmed", "done", "no_show", "cancelled"];
/** Statuts qui occupent un fauteuil. */
const BUSY = `('confirmed', 'done')`;
const ms = (col: string) => `floor(extract(epoch from ${col}) * 1000)::float8`;

export type Appointment = {
  id: string; serviceId: string; serviceName: string; minutes: number; priceCents: number;
  start: number; end: number; status: Status; source: string; note: string; createdAt: number;
  client: { id: string; firstName: string; lastName: string; phone: string; email: string; visits: number; noShows: number };
};

const toAppt = (r: Row): Appointment => ({
  id: String(r.id), serviceId: String(r.service_id), serviceName: String(r.service_name), minutes: Number(r.duration_min), priceCents: Number(r.price_cents),
  start: Number(r.start_ms), end: Number(r.end_ms), status: r.status as Status, source: String(r.source), note: String(r.note ?? ""), createdAt: Number(r.created_ms),
  client: { id: String(r.client_id), firstName: String(r.first_name), lastName: String(r.last_name), phone: String(r.phone), email: String(r.email ?? ""), visits: Number(r.visits ?? 0), noShows: Number(r.no_shows ?? 0) }
});

const SELECT_APPT = `SELECT a.id, a.service_id, a.service_name, a.duration_min, a.price_cents, a.status, a.source, a.note,
  ${ms("a.starts_at")} AS start_ms, ${ms("a.ends_at")} AS end_ms, ${ms("a.created_at")} AS created_ms,
  c.id AS client_id, c.first_name, c.last_name, c.phone, c.email,
  (SELECT count(*)::int FROM appointments x WHERE x.client_id = c.id AND x.status = 'done') AS visits,
  (SELECT count(*)::int FROM appointments x WHERE x.client_id = c.id AND x.status = 'no_show') AS no_shows
  FROM appointments a JOIN clients c ON c.id = a.client_id`;

/* ---------- Réglages ---------- */
export async function getCapacity(): Promise<number> {
  const rows = await (await db()).query(`SELECT value FROM settings WHERE key = 'capacity'`);
  const n = Number(rows[0]?.value);
  return Number.isInteger(n) && n >= 0 ? n : booking.defaultCapacity;
}
export async function setCapacity(n: number) {
  await (await db()).query(`INSERT INTO settings (key, value) VALUES ('capacity', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(n)]);
}

/* ---------- Disponibilités ---------- */
async function occupancy(from: number, to: number) {
  const d = await db();
  const [busy, blocks] = await Promise.all([
    d.query(`SELECT ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM appointments WHERE status IN ${BUSY} AND starts_at < $2::timestamptz AND ends_at > $1::timestamptz`, [new Date(from).toISOString(), new Date(to).toISOString()]),
    d.query(`SELECT ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM blocks WHERE starts_at < $2::timestamptz AND ends_at > $1::timestamptz`, [new Date(from).toISOString(), new Date(to).toISOString()])
  ]);
  const span = (r: Row): Span => ({ start: Number(r.s), end: Number(r.e) });
  return { busy: busy.map(span), blocks: blocks.map(span) };
}

export const today = () => parisOf(Date.now()).date;

/** Créneaux libres jour par jour, sur l’horizon de réservation. */
export async function availability(serviceId: string, opts: { from?: string; days?: number; notBefore?: number } = {}) {
  const svc = serviceById(serviceId);
  if (!svc) return [];
  const from = opts.from ?? today(), n = opts.days ?? booking.horizonDays;
  const start = +parisToDate(from, 0), end = +parisToDate(addDays(from, n), 0);
  const [{ busy, blocks }, capacity] = await Promise.all([occupancy(start, end), getCapacity()]);
  const notBefore = opts.notBefore ?? Date.now() + booking.leadMinutes * 60000;
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(from, i);
    return { date, slots: daySlots({ date, minutes: svc.minutes, busy, blocks, capacity, notBefore }) };
  });
}

/* ---------- Création ---------- */
export type NewBooking = { serviceId: string; date: string; time: string; firstName: string; lastName: string; phone: string; email: string; note: string };
export type CreateResult =
  | { ok: true; id: string; token: string; start: number; end: number }
  | { ok: false; reason: "service" | "slot" | "full" | "limit" | "rate" };

export async function createAppointment(b: NewBooking, o: { source: "site" | "salon"; ipHash?: string; force?: boolean }): Promise<CreateResult> {
  const svc = serviceById(b.serviceId);
  if (!svc) return { ok: false, reason: "service" };
  const d = await db();

  if (o.source === "site") {
    // Le créneau doit faire partie des créneaux proposés (horaires, pas de 15 min, délai minimum)
    const [day] = await availability(svc.id, { from: b.date, days: 1 });
    if (!day?.slots.includes(b.time)) return { ok: false, reason: "slot" };
    const [lim] = await d.query(
      `SELECT (SELECT count(*)::int FROM appointments a JOIN clients c ON c.id = a.client_id WHERE c.phone = $1 AND a.status = 'confirmed' AND a.starts_at > now()) AS active,
              (SELECT count(*)::int FROM appointments WHERE ip_hash = $2 AND created_at > now() - interval '1 hour') AS recent`, [b.phone, o.ipHash ?? ""]);
    if (Number(lim.active) >= booking.maxActivePerClient) return { ok: false, reason: "limit" };
    if (o.ipHash && Number(lim.recent) >= 6) return { ok: false, reason: "rate" };
  }

  const [h, m] = b.time.split(":").map(Number);
  const start = +parisToDate(b.date, h * 60 + m), end = start + svc.minutes * 60000;
  const token = randomBytes(18).toString("base64url");
  const capacity = await getCapacity();
  const s = new Date(start).toISOString(), e = new Date(end).toISOString();

  // Verrou + insertion conditionnelle dans une même transaction : deux réservations simultanées
  // ne peuvent pas prendre la dernière place.
  const [, rows] = await d.tx([
    { text: `SELECT pg_advisory_xact_lock(hashtext('finns-booking'))` },
    { text: `WITH c AS (
        INSERT INTO clients (first_name, last_name, phone, email) VALUES ($1, $2, $3, NULLIF($4, ''))
        ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = COALESCE(EXCLUDED.email, clients.email)
        RETURNING id
      )
      INSERT INTO appointments (client_id, service_id, service_name, duration_min, price_cents, starts_at, ends_at, source, note, token, ip_hash)
      SELECT c.id, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz, $11, $12, $13, NULLIF($14, '') FROM c
      WHERE $15::boolean OR (
        NOT EXISTS (SELECT 1 FROM blocks bl WHERE bl.starts_at < $10::timestamptz AND bl.ends_at > $9::timestamptz)
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT $9::timestamptz AS p
            UNION SELECT a.starts_at FROM appointments a WHERE a.status IN ${BUSY} AND a.starts_at > $9::timestamptz AND a.starts_at < $10::timestamptz
          ) pts
          WHERE (SELECT count(*) FROM appointments a2 WHERE a2.status IN ${BUSY} AND a2.starts_at <= pts.p AND a2.ends_at > pts.p) >= $16::int
        )
      )
      RETURNING id`,
      params: [b.firstName, b.lastName, b.phone, b.email, svc.id, svc.name, svc.minutes, svc.priceCents, s, e, o.source, b.note, token, o.ipHash ?? "", !!o.force, capacity] }
  ]);
  if (!rows.length) return { ok: false, reason: "full" };
  return { ok: true, id: String(rows[0].id), token, start, end };
}

/* ---------- Côté client (lien personnel) ---------- */
export async function findByToken(token: string): Promise<Appointment | null> {
  if (!/^[\w-]{20,40}$/.test(token)) return null;
  const rows = await (await db()).query(`${SELECT_APPT} WHERE a.token = $1`, [token]);
  return rows[0] ? toAppt(rows[0]) : null;
}

export async function cancelByToken(token: string): Promise<{ ok: true; appt: Appointment } | { ok: false; reason: "notfound" | "late" | "state" }> {
  const appt = await findByToken(token);
  if (!appt) return { ok: false, reason: "notfound" };
  if (appt.status !== "confirmed") return { ok: false, reason: "state" };
  if (appt.start - Date.now() < booking.cancelUntilHours * 3600000) return { ok: false, reason: "late" };
  await (await db()).query(`UPDATE appointments SET status = 'cancelled', cancelled_at = now() WHERE id = $1`, [appt.id]);
  return { ok: true, appt: { ...appt, status: "cancelled" } };
}

/* ---------- Tableau de bord ---------- */
export async function dayView(date: string) {
  const d = await db();
  const from = parisToDate(date, 0).toISOString(), to = parisToDate(addDays(date, 1), 0).toISOString();
  const weekFrom = parisToDate(date, 0).toISOString(), weekTo = parisToDate(addDays(date, 7), 0).toISOString();
  const [appts, blocks, week, capacity] = await Promise.all([
    d.query(`${SELECT_APPT} WHERE a.starts_at >= $1::timestamptz AND a.starts_at < $2::timestamptz ORDER BY a.starts_at, a.created_at`, [from, to]),
    d.query(`SELECT id, reason, ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM blocks WHERE starts_at < $2::timestamptz AND ends_at > $1::timestamptz ORDER BY starts_at`, [from, to]),
    d.query(`SELECT ${ms("starts_at")} AS s FROM appointments WHERE status IN ${BUSY} AND starts_at >= $1::timestamptz AND starts_at < $2::timestamptz`, [weekFrom, weekTo]),
    getCapacity()
  ]);
  const counts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) counts[addDays(date, i)] = 0;
  for (const r of week) { const k = parisOf(Number(r.s)).date; if (k in counts) counts[k]++; }
  return {
    date, capacity,
    appointments: appts.map(toAppt),
    blocks: blocks.map(r => ({ id: String(r.id), reason: String(r.reason), start: Number(r.s), end: Number(r.e) })),
    week: Object.entries(counts).map(([day, count]) => ({ date: day, count }))
  };
}

export async function setStatus(id: string, status: Status) {
  const rows = await (await db()).query(
    `UPDATE appointments SET status = $2, cancelled_at = CASE WHEN $2 = 'cancelled' THEN now() ELSE NULL END WHERE id = $1::uuid RETURNING id`, [id, status]);
  return rows.length > 0;
}
export async function setNote(id: string, note: string) {
  const rows = await (await db()).query(`UPDATE appointments SET note = $2 WHERE id = $1::uuid RETURNING id`, [id, note]);
  return rows.length > 0;
}

export async function addBlock(start: number, end: number, reason: string) {
  await (await db()).query(`INSERT INTO blocks (starts_at, ends_at, reason) VALUES ($1::timestamptz, $2::timestamptz, $3)`, [new Date(start).toISOString(), new Date(end).toISOString(), reason]);
}
export async function deleteBlock(id: string) {
  await (await db()).query(`DELETE FROM blocks WHERE id = $1::uuid`, [id]);
}

/* ---------- Fichier clients ---------- */
export type ClientRow = { id: string; firstName: string; lastName: string; phone: string; email: string; notes: string; visits: number; noShows: number; upcoming: number; spentCents: number; last: number | null; next: number | null };

export async function listClients(q: string): Promise<ClientRow[]> {
  const term = q.replace(/[%_\\]/g, "").trim();
  const digits = term.replace(/\D/g, "");
  const rows = await (await db()).query(
    `SELECT c.id, c.first_name, c.last_name, c.phone, c.email, c.notes,
       count(a.id) FILTER (WHERE a.status = 'done')::int AS visits,
       count(a.id) FILTER (WHERE a.status = 'no_show')::int AS no_shows,
       count(a.id) FILTER (WHERE a.status = 'confirmed' AND a.starts_at > now())::int AS upcoming,
       COALESCE(sum(a.price_cents) FILTER (WHERE a.status = 'done'), 0)::int AS spent,
       ${ms("max(a.starts_at) FILTER (WHERE a.status IN ('done', 'confirmed') AND a.starts_at <= now())")} AS last_ms,
       ${ms("min(a.starts_at) FILTER (WHERE a.status = 'confirmed' AND a.starts_at > now())")} AS next_ms
     FROM clients c LEFT JOIN appointments a ON a.client_id = c.id
     WHERE $1 = '' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $1 || '%' OR ($2 <> '' AND c.phone LIKE '%' || $2 || '%')
     GROUP BY c.id
     ORDER BY max(a.starts_at) DESC NULLS LAST, c.created_at DESC
     LIMIT 300`, [term, digits]);
  return rows.map(r => ({
    id: String(r.id), firstName: String(r.first_name), lastName: String(r.last_name), phone: String(r.phone), email: String(r.email ?? ""), notes: String(r.notes ?? ""),
    visits: Number(r.visits), noShows: Number(r.no_shows), upcoming: Number(r.upcoming), spentCents: Number(r.spent),
    last: r.last_ms == null ? null : Number(r.last_ms), next: r.next_ms == null ? null : Number(r.next_ms)
  }));
}

export async function clientHistory(id: string) {
  const rows = await (await db()).query(`${SELECT_APPT} WHERE c.id = $1::uuid ORDER BY a.starts_at DESC LIMIT 100`, [id]);
  return rows.map(toAppt);
}
export async function setClientNotes(id: string, notes: string) {
  const rows = await (await db()).query(`UPDATE clients SET notes = $2 WHERE id = $1::uuid RETURNING id`, [id, notes]);
  return rows.length > 0;
}

export const serviceList = services.map(s => ({ id: s.id, name: s.name, minutes: s.minutes, price: s.price }));
