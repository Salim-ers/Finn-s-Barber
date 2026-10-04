/* =========================================================
   RÉSERVATIONS — accès aux données
   Chaque rendez-vous est attribué à un coiffeur. La disponibilité tient compte
   de ses horaires, de ses absences, de ses rendez-vous et des fermetures du salon.
   ========================================================= */
import { randomBytes } from "node:crypto";
import { booking, services } from "@/lib/data";
import { db, salonSchedule, type Row } from "@/lib/db";
import { daySlots, freeBarbers, serviceById, workWindow, type BarberDay, type Schedule, type Span } from "./slots";
import { addDays, parisOf, parisToDate } from "./time";

export type Status = "confirmed" | "done" | "no_show" | "cancelled";
export const STATUSES: Status[] = ["confirmed", "done", "no_show", "cancelled"];
/** Statuts qui occupent un fauteuil. */
const BUSY = `('confirmed', 'done')`;
const ms = (col: string) => `floor(extract(epoch from ${col}) * 1000)::float8`;
const iso = (t: number) => new Date(t).toISOString();

export type Appointment = {
  id: string; serviceId: string; serviceName: string; minutes: number; priceCents: number;
  start: number; end: number; status: Status; source: string; note: string; createdAt: number;
  barber: { id: string; name: string } | null;
  client: { id: string; firstName: string; lastName: string; phone: string; email: string; visits: number; noShows: number };
};

const toAppt = (r: Row): Appointment => ({
  id: String(r.id), serviceId: String(r.service_id), serviceName: String(r.service_name), minutes: Number(r.duration_min), priceCents: Number(r.price_cents),
  start: Number(r.start_ms), end: Number(r.end_ms), status: r.status as Status, source: String(r.source), note: String(r.note ?? ""), createdAt: Number(r.created_ms),
  barber: r.barber_id ? { id: String(r.barber_id), name: String(r.barber_name) } : null,
  client: { id: String(r.client_id), firstName: String(r.first_name), lastName: String(r.last_name), phone: String(r.phone), email: String(r.email ?? ""), visits: Number(r.visits ?? 0), noShows: Number(r.no_shows ?? 0) }
});

const SELECT_APPT = `SELECT a.id, a.service_id, a.service_name, a.duration_min, a.price_cents, a.status, a.source, a.note,
  ${ms("a.starts_at")} AS start_ms, ${ms("a.ends_at")} AS end_ms, ${ms("a.created_at")} AS created_ms,
  a.barber_id, b.name AS barber_name,
  c.id AS client_id, c.first_name, c.last_name, c.phone, c.email,
  (SELECT count(*)::int FROM appointments x WHERE x.client_id = c.id AND x.status = 'done') AS visits,
  (SELECT count(*)::int FROM appointments x WHERE x.client_id = c.id AND x.status = 'no_show') AS no_shows
  FROM appointments a JOIN clients c ON c.id = a.client_id LEFT JOIN barbers b ON b.id = a.barber_id`;

export const today = () => parisOf(Date.now()).date;

/* ---------- Équipe ---------- */
export type Barber = { id: string; name: string; position: number; active: boolean; schedule: Schedule };
const toBarber = (r: Row): Barber => ({ id: String(r.id), name: String(r.name), position: Number(r.position), active: !!r.active, schedule: (r.schedule || {}) as Schedule });

export async function listBarbers(activeOnly = false): Promise<Barber[]> {
  const rows = await (await db()).query(`SELECT id, name, position, active, schedule FROM barbers ${activeOnly ? "WHERE active" : ""} ORDER BY position, created_at`);
  return rows.map(toBarber);
}
export async function addBarber(name: string) {
  const rows = await (await db()).query(
    `INSERT INTO barbers (name, position, schedule) VALUES ($1, (SELECT COALESCE(max(position), 0) + 1 FROM barbers), $2::jsonb) RETURNING id`, [name, JSON.stringify(salonSchedule())]);
  return String(rows[0].id);
}
export async function updateBarber(id: string, p: { name?: string; active?: boolean; schedule?: Schedule }) {
  const rows = await (await db()).query(
    `UPDATE barbers SET name = COALESCE($2, name), active = COALESCE($3, active), schedule = COALESCE($4::jsonb, schedule) WHERE id = $1::uuid RETURNING id`,
    [id, p.name ?? null, p.active ?? null, p.schedule ? JSON.stringify(p.schedule) : null]);
  return rows.length > 0;
}

/* ---------- Absences (congés, maladie, formation…) ---------- */
export type Absence = { id: string; barberId: string; barberName: string; start: number; end: number; reason: string };
const toAbsence = (r: Row): Absence => ({ id: String(r.id), barberId: String(r.barber_id), barberName: String(r.barber_name ?? ""), start: Number(r.s), end: Number(r.e), reason: String(r.reason ?? "") });
const SELECT_ABS = `SELECT ab.id, ab.barber_id, b.name AS barber_name, ab.reason, ${ms("ab.starts_at")} AS s, ${ms("ab.ends_at")} AS e FROM absences ab JOIN barbers b ON b.id = ab.barber_id`;

export async function listAbsences(from: number, to?: number): Promise<Absence[]> {
  const rows = await (await db()).query(`${SELECT_ABS} WHERE ab.ends_at > $1::timestamptz ${to ? "AND ab.starts_at < $2::timestamptz" : ""} ORDER BY ab.starts_at`, to ? [iso(from), iso(to)] : [iso(from)]);
  return rows.map(toAbsence);
}
export async function addAbsence(barberId: string, start: number, end: number, reason: string) {
  await (await db()).query(`INSERT INTO absences (barber_id, starts_at, ends_at, reason) VALUES ($1::uuid, $2::timestamptz, $3::timestamptz, $4)`, [barberId, iso(start), iso(end), reason]);
}
export async function deleteAbsence(id: string) {
  await (await db()).query(`DELETE FROM absences WHERE id = $1::uuid`, [id]);
}

/* ---------- Disponibilités ---------- */
type Busy = Span & { barberId: string | null };
async function context(from: number, to: number) {
  const d = await db();
  const [barbers, absences, appts, blocks] = await Promise.all([
    listBarbers(true),
    listAbsences(from, to),
    d.query(`SELECT barber_id, ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM appointments WHERE status IN ${BUSY} AND starts_at < $2::timestamptz AND ends_at > $1::timestamptz`, [iso(from), iso(to)]),
    d.query(`SELECT ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM blocks WHERE starts_at < $2::timestamptz AND ends_at > $1::timestamptz`, [iso(from), iso(to)])
  ]);
  return {
    barbers, absences,
    busy: appts.map((r): Busy => ({ start: Number(r.s), end: Number(r.e), barberId: r.barber_id ? String(r.barber_id) : null })),
    blocks: blocks.map((r): Span => ({ start: Number(r.s), end: Number(r.e) }))
  };
}
type Ctx = Awaited<ReturnType<typeof context>>;

function barberDays(ctx: Ctx, date: string): BarberDay[] {
  return ctx.barbers.map(b => ({
    id: b.id,
    window: workWindow(b.schedule, date),
    off: ctx.absences.filter(a => a.barberId === b.id),
    busy: ctx.busy.filter(x => x.barberId === b.id)
  }));
}
const unassigned = (ctx: Ctx) => ctx.busy.filter(x => !x.barberId);

/** Créneaux libres jour par jour, pour un coiffeur précis ou sans préférence (barberId absent ou "any"). */
export async function availability(serviceId: string, barberId?: string, opts: { from?: string; days?: number; notBefore?: number } = {}) {
  const svc = serviceById(serviceId);
  if (!svc) return null;
  const from = opts.from ?? today(), n = opts.days ?? booking.horizonDays;
  const ctx = await context(+parisToDate(from, 0), +parisToDate(addDays(from, n), 0));
  const who = barberId && barberId !== "any" ? barberId : undefined;
  if (who && !ctx.barbers.some(b => b.id === who)) return null;
  const notBefore = opts.notBefore ?? Date.now() + booking.leadMinutes * 60000;
  return {
    barbers: ctx.barbers.map(b => ({ id: b.id, name: b.name })),
    days: Array.from({ length: n }, (_, i) => {
      const date = addDays(from, i);
      return { date, slots: daySlots({ date, minutes: svc.minutes, barbers: barberDays(ctx, date), unassigned: unassigned(ctx), blocks: ctx.blocks, notBefore, barberId: who }) };
    })
  };
}

/* ---------- Création ---------- */
export type NewBooking = { serviceId: string; date: string; time: string; barberId?: string; firstName: string; lastName: string; phone: string; email: string; note: string };
export type CreateResult =
  | { ok: true; id: string; token: string; start: number; end: number; barber: string | null }
  | { ok: false; reason: "service" | "slot" | "full" | "barber" | "limit" | "rate" };

export async function createAppointment(b: NewBooking, o: { source: "site" | "salon"; ipHash?: string; force?: boolean }): Promise<CreateResult> {
  const svc = serviceById(b.serviceId);
  if (!svc) return { ok: false, reason: "service" };
  const d = await db();
  const [h, m] = b.time.split(":").map(Number);
  const start = +parisToDate(b.date, h * 60 + m), end = start + svc.minutes * 60000;
  const ctx = await context(+parisToDate(b.date, 0), +parisToDate(addDays(b.date, 1), 0));
  const days = barberDays(ctx, b.date);
  const wanted = b.barberId && b.barberId !== "any" ? b.barberId : undefined;
  if (wanted && !ctx.barbers.some(x => x.id === wanted)) return { ok: false, reason: "barber" };

  if (o.source === "site") {
    // Le créneau doit faire partie des créneaux proposés (horaires, pas de 15 min, délai, coiffeur choisi)
    const slots = daySlots({ date: b.date, minutes: svc.minutes, barbers: days, unassigned: unassigned(ctx), blocks: ctx.blocks, notBefore: Date.now() + booking.leadMinutes * 60000, barberId: wanted });
    if (!slots.includes(b.time)) return { ok: false, reason: "slot" };
    const [lim] = await d.query(
      `SELECT (SELECT count(*)::int FROM appointments a JOIN clients c ON c.id = a.client_id WHERE c.phone = $1 AND a.status = 'confirmed' AND a.starts_at > now()) AS active,
              (SELECT count(*)::int FROM appointments WHERE ip_hash = $2 AND created_at > now() - interval '1 hour') AS recent`, [b.phone, o.ipHash ?? ""]);
    if (Number(lim.active) >= booking.maxActivePerClient) return { ok: false, reason: "limit" };
    if (o.ipHash && Number(lim.recent) >= 6) return { ok: false, reason: "rate" };
  }

  // Attribution : le coiffeur choisi, sinon le coiffeur libre le moins chargé de la journée
  const free = freeBarbers(days, start, end);
  let barberId: string | null = null;
  if (wanted) {
    if (!o.force && !free.some(x => x.id === wanted)) return { ok: false, reason: "barber" };
    barberId = wanted;
  } else if (free.length) {
    const order = new Map(ctx.barbers.map((x, i) => [x.id, i]));
    barberId = [...free].sort((x, y) => x.busy.length - y.busy.length || order.get(x.id)! - order.get(y.id)!)[0].id;
  } else if (!o.force) return { ok: false, reason: "full" };

  const token = randomBytes(18).toString("base64url");
  // Verrou + insertion conditionnelle dans une même transaction : deux réservations simultanées
  // ne peuvent pas prendre le même coiffeur au même moment.
  const [, rows] = await d.tx([
    { text: `SELECT pg_advisory_xact_lock(hashtext('finns-booking'))` },
    { text: `WITH c AS (
        INSERT INTO clients (first_name, last_name, phone, email) VALUES ($1, $2, $3, NULLIF($4, ''))
        ON CONFLICT (phone) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = COALESCE(EXCLUDED.email, clients.email)
        RETURNING id
      )
      INSERT INTO appointments (client_id, service_id, service_name, duration_min, price_cents, starts_at, ends_at, source, note, token, ip_hash, barber_id)
      SELECT c.id, $5, $6, $7, $8, $9::timestamptz, $10::timestamptz, $11, $12, $13, NULLIF($14, ''), $16::uuid FROM c
      WHERE $15::boolean OR (
        NOT EXISTS (SELECT 1 FROM blocks bl WHERE bl.starts_at < $10::timestamptz AND bl.ends_at > $9::timestamptz)
        AND ($16::uuid IS NULL OR NOT EXISTS (
          SELECT 1 FROM appointments a WHERE a.barber_id = $16::uuid AND a.status IN ${BUSY} AND a.starts_at < $10::timestamptz AND a.ends_at > $9::timestamptz
        ))
      )
      RETURNING id`,
      params: [b.firstName, b.lastName, b.phone, b.email, svc.id, svc.name, svc.minutes, svc.priceCents, iso(start), iso(end), o.source, b.note, token, o.ipHash ?? "", !!o.force, barberId] }
  ]);
  if (!rows.length) return { ok: false, reason: "full" };
  return { ok: true, id: String(rows[0].id), token, start, end, barber: barberId ? ctx.barbers.find(x => x.id === barberId)?.name ?? null : null };
}

/* ---------- Côté client (lien personnel) ---------- */
export async function findByToken(token: string): Promise<Appointment | null> {
  if (!/^[\w-]{20,40}$/.test(token)) return null;
  const rows = await (await db()).query(`${SELECT_APPT} WHERE a.token = $1`, [token]);
  return rows[0] ? toAppt(rows[0]) : null;
}

/** Réserve les rappels à envoyer : rendez-vous de demain, avec e-mail, pas encore rappelés.
 *  Ceux pris il y a moins de 12 h sont laissés de côté : la confirmation vient de partir. */
export async function claimReminders(): Promise<string[]> {
  const day = addDays(today(), 1);
  const rows = await (await db()).query(
    `UPDATE appointments a SET reminded_at = now() FROM clients c
     WHERE c.id = a.client_id AND a.status = 'confirmed' AND a.reminded_at IS NULL AND COALESCE(c.email, '') <> ''
       AND a.starts_at >= $1::timestamptz AND a.starts_at < $2::timestamptz AND a.created_at < now() - interval '12 hours'
     RETURNING a.token`,
    [parisToDate(day, 0).toISOString(), parisToDate(addDays(day, 1), 0).toISOString()]);
  return rows.map(r => String(r.token));
}
/** Remet un rappel en attente quand l’envoi a échoué (un nouvel appel le retentera). */
export async function releaseReminder(token: string) {
  await (await db()).query(`UPDATE appointments SET reminded_at = NULL WHERE token = $1`, [token]);
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
  const from = +parisToDate(date, 0), to = +parisToDate(addDays(date, 1), 0), weekTo = +parisToDate(addDays(date, 7), 0);
  const [appts, blocks, week, barbers, absences] = await Promise.all([
    d.query(`${SELECT_APPT} WHERE a.starts_at >= $1::timestamptz AND a.starts_at < $2::timestamptz ORDER BY a.starts_at, a.created_at`, [iso(from), iso(to)]),
    d.query(`SELECT id, reason, ${ms("starts_at")} AS s, ${ms("ends_at")} AS e FROM blocks WHERE starts_at < $2::timestamptz AND ends_at > $1::timestamptz ORDER BY starts_at`, [iso(from), iso(to)]),
    d.query(`SELECT ${ms("starts_at")} AS s FROM appointments WHERE status IN ${BUSY} AND starts_at >= $1::timestamptz AND starts_at < $2::timestamptz`, [iso(from), iso(weekTo)]),
    listBarbers(),
    listAbsences(from, to)
  ]);
  const counts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) counts[addDays(date, i)] = 0;
  for (const r of week) { const k = parisOf(Number(r.s)).date; if (k in counts) counts[k]++; }
  return {
    date,
    appointments: appts.map(toAppt),
    blocks: blocks.map(r => ({ id: String(r.id), reason: String(r.reason), start: Number(r.s), end: Number(r.e) })),
    barbers: barbers.map(b => ({ id: b.id, name: b.name, active: b.active, working: b.active && !!workWindow(b.schedule, date) })),
    absences,
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
export async function setAppointmentBarber(id: string, barberId: string | null) {
  const rows = await (await db()).query(`UPDATE appointments SET barber_id = $2::uuid WHERE id = $1::uuid RETURNING id`, [id, barberId]);
  return rows.length > 0;
}

export async function addBlock(start: number, end: number, reason: string) {
  await (await db()).query(`INSERT INTO blocks (starts_at, ends_at, reason) VALUES ($1::timestamptz, $2::timestamptz, $3)`, [iso(start), iso(end), reason]);
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
/** Supprime un client et tout son historique de rendez-vous (droit à l’effacement). */
export async function deleteClient(id: string) {
  const rows = await (await db()).query(`DELETE FROM clients WHERE id = $1::uuid RETURNING id`, [id]);
  return rows.length > 0;
}
export async function setClientNotes(id: string, notes: string) {
  const rows = await (await db()).query(`UPDATE clients SET notes = $2 WHERE id = $1::uuid RETURNING id`, [id, notes]);
  return rows.length > 0;
}

/* ---------- Messages du formulaire de contact ---------- */
export type Message = { id: string; name: string; phone: string; email: string; body: string; read: boolean; createdAt: number };

export async function addMessage(m: { name: string; phone: string; email: string; body: string; ipHash: string }): Promise<{ ok: true; id: string } | { ok: false; reason: "rate" }> {
  const d = await db();
  if (m.ipHash) {
    const [r] = await d.query(`SELECT count(*)::int AS n FROM messages WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`, [m.ipHash]);
    if (Number(r.n) >= 5) return { ok: false, reason: "rate" };
  }
  const rows = await d.query(`INSERT INTO messages (name, phone, email, body, ip_hash) VALUES ($1, $2, $3, $4, NULLIF($5, '')) RETURNING id`, [m.name, m.phone, m.email, m.body, m.ipHash]);
  return { ok: true, id: String(rows[0].id) };
}
export async function listMessages(): Promise<Message[]> {
  const rows = await (await db()).query(`SELECT id, name, phone, email, body, read, ${ms("created_at")} AS t FROM messages ORDER BY created_at DESC LIMIT 200`);
  return rows.map(r => ({ id: String(r.id), name: String(r.name), phone: String(r.phone), email: String(r.email), body: String(r.body), read: !!r.read, createdAt: Number(r.t) }));
}
export async function unreadMessages() {
  const [r] = await (await db()).query(`SELECT count(*)::int AS n FROM messages WHERE NOT read`);
  return Number(r.n);
}
export async function setMessageRead(id: string, read: boolean) {
  const rows = await (await db()).query(`UPDATE messages SET read = $2 WHERE id = $1::uuid RETURNING id`, [id, read]);
  return rows.length > 0;
}
export async function deleteMessage(id: string) {
  await (await db()).query(`DELETE FROM messages WHERE id = $1::uuid`, [id]);
}

export const serviceList = services.map(s => ({ id: s.id, name: s.name, minutes: s.minutes, price: s.price }));
