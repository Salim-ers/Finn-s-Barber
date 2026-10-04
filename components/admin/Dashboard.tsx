"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { addDays, fmtDay, hhmm, parisOf } from "@/lib/booking/time";

/* =========================================================
   TABLEAU DE BORD DU SALON — agenda, clients, messages, équipe
   ========================================================= */
type Svc = { id: string; name: string; minutes: number; price: string };
type Rules = { slotStep: number; leadMinutes: number; horizonDays: number; cancelUntilHours: number; maxActivePerClient: number };
type Status = "confirmed" | "done" | "no_show" | "cancelled";
type Appt = {
  id: string; serviceId: string; serviceName: string; minutes: number; priceCents: number; start: number; end: number; status: Status; source: string; note: string; createdAt: number;
  barber: { id: string; name: string } | null;
  client: { id: string; firstName: string; lastName: string; phone: string; email: string; visits: number; noShows: number };
};
type Block = { id: string; reason: string; start: number; end: number };
type Absence = { id: string; barberId: string; barberName: string; start: number; end: number; reason: string };
type DayBarber = { id: string; name: string; active: boolean; working: boolean };
type DayData = { date: string; appointments: Appt[]; blocks: Block[]; barbers: DayBarber[]; absences: Absence[]; week: { date: string; count: number }[] };
type Client = { id: string; firstName: string; lastName: string; phone: string; email: string; notes: string; visits: number; noShows: number; upcoming: number; spentCents: number; last: number | null; next: number | null };
type Schedule = Record<string, [string, string] | null>;
type Barber = { id: string; name: string; position: number; active: boolean; schedule: Schedule };
type Message = { id: string; name: string; phone: string; email: string; body: string; read: boolean; createdAt: number };

const STATUS: Record<Status, string> = { confirmed: "Confirmé", done: "Venu", no_show: "Absent", cancelled: "Annulé" };
const DAYS: [string, string][] = [["monday", "Lundi"], ["tuesday", "Mardi"], ["wednesday", "Mercredi"], ["thursday", "Jeudi"], ["friday", "Vendredi"], ["saturday", "Samedi"], ["sunday", "Dimanche"]];
const REASONS = ["Congés", "Maladie", "Formation", "Rendez-vous", "Autre"];
const time = (t: number) => hhmm(parisOf(t).min);
const euros = (c: number) => `${(c / 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;
const phoneFmt = (p: string) => (/^0\d{9}$/.test(p) ? p.replace(/(\d{2})(?=\d)/g, "$1 ") : p);
const todayParis = () => parisOf(Date.now()).date;
const shortDate = (t: number) => { const { date } = parisOf(t); return fmtDay(date, { day: "numeric", month: "short", year: "numeric" }); };
/** « 12 oct. → 18 oct. », « toute la journée » ou « 14:00 – 16:00 » */
function absText(a: Absence) {
  const s = parisOf(a.start), e = parisOf(a.end - 1);
  if (s.min === 0 && parisOf(a.end).min === 0) return s.date === e.date ? `${shortDate(a.start)}, toute la journée` : `du ${shortDate(a.start)} au ${shortDate(a.end - 1)}`;
  return `${shortDate(a.start)}, ${time(a.start)} – ${time(a.end)}`;
}

async function api<T = Record<string, unknown>>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const r = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  if (r.status === 401) { window.location.reload(); }
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: data as T };
}

export default function Dashboard({ services, rules, mailOn }: { services: Svc[]; rules: Rules; mailOn: boolean }) {
  const [tab, setTab] = useState<"agenda" | "clients" | "messages" | "team">("agenda");
  const [unread, setUnread] = useState(0);
  const refreshUnread = useCallback(() => { api<{ unread: number }>("/api/admin/messages").then(r => r.ok && setUnread(r.data.unread)).catch(() => {}); }, []);
  useEffect(() => { refreshUnread(); const t = setInterval(refreshUnread, 120000); return () => clearInterval(t); }, [refreshUnread]);
  const logout = async () => { await api("/api/admin/session", { method: "DELETE" }); window.location.reload(); };
  const tabs = [["agenda", "Agenda"], ["clients", "Clients"], ["messages", "Messages"], ["team", "Équipe"]] as const;
  return (
    <div className="dsh-app">
      <header className="dsh-top">
        <p className="dsh-brand">Finn’s<span>Tableau de bord</span></p>
        <nav className="dsh-tabs" aria-label="Sections">
          {tabs.map(([k, l]) => (
            <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}>
              {l}{k === "messages" && unread > 0 && <span className="dsh-count" aria-label={`${unread} non lus`}>{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="dsh-top-r">
          <a className="dsh-link" href="/" target="_blank" rel="noopener">Voir le site</a>
          <button className="dsh-link" type="button" onClick={logout}>Déconnexion</button>
        </div>
      </header>
      <main className="dsh-main">
        {tab === "agenda" && <Agenda services={services} />}
        {tab === "clients" && <Clients />}
        {tab === "messages" && <Messages onChange={refreshUnread} />}
        {tab === "team" && <Team rules={rules} mailOn={mailOn} />}
      </main>
    </div>
  );
}

/* ---------------- Agenda ---------------- */
function Agenda({ services }: { services: Svc[] }) {
  const [date, setDate] = useState(todayParis);
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState("");
  const [who, setWho] = useState("all");

  const load = useCallback(async (d: string, silent = false) => {
    if (!silent) setErr("");
    const r = await api<DayData & { error?: string }>(`/api/admin/day?date=${d}`).catch(() => null);
    if (!r) { setErr("Connexion impossible. Vérifiez le réseau."); return; }
    if (!r.ok) { setErr(r.status === 503 ? "La base de données n’est pas configurée (DATABASE_URL)." : "Chargement impossible."); return; }
    setData(r.data);
  }, []);

  useEffect(() => { load(date); const t = setInterval(() => load(date, true), 60000); return () => clearInterval(t); }, [date, load]);

  const all = data?.appointments ?? [];
  const appts = who === "all" ? all : who === "none" ? all.filter(a => !a.barber) : all.filter(a => a.barber?.id === who);
  const live = (list: Appt[]) => list.filter(a => a.status === "confirmed" || a.status === "done");
  const stats = {
    count: live(appts).length, revenue: live(appts).reduce((s, a) => s + a.priceCents, 0),
    done: appts.filter(a => a.status === "done").length, noShow: appts.filter(a => a.status === "no_show").length, cancelled: appts.filter(a => a.status === "cancelled").length
  };
  const barbers = data?.barbers.filter(b => b.active) ?? [];
  const resting = barbers.filter(b => !b.working && !data?.absences.some(a => a.barberId === b.id));
  // Un même coiffeur sur deux rendez-vous qui se chevauchent (après une réattribution ou un ajout forcé)
  const active = all.filter(a => a.barber && a.status !== "cancelled" && a.status !== "no_show");
  const conflicts = new Set(active.filter(a => active.some(o => o.id !== a.id && o.barber!.id === a.barber!.id && o.start < a.end && o.end > a.start)).map(a => a.id));

  async function patch(id: string, body: object) {
    const r = await api(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (!r.ok) window.alert("La modification n’a pas pu être enregistrée.");
    load(date, true);
  }

  return (
    <div className="dsh-agenda">
      <div className="dsh-daybar">
        <div className="dsh-daynav">
          <button type="button" className="dsh-icon" aria-label="Jour précédent" onClick={() => setDate(d => addDays(d, -1))}>←</button>
          <h1 className="dsh-day">{fmtDay(date)}</h1>
          <button type="button" className="dsh-icon" aria-label="Jour suivant" onClick={() => setDate(d => addDays(d, 1))}>→</button>
        </div>
        <div className="dsh-daynav">
          {date !== todayParis() && <button type="button" className="dsh-chip" onClick={() => setDate(todayParis())}>Aujourd’hui</button>}
          <input className="dsh-input dsh-input--date" type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)} aria-label="Choisir une date" />
        </div>
      </div>

      {data && (
        <div className="dsh-week" role="list">
          {data.week.map(w => (
            <button key={w.date} role="listitem" type="button" className={`dsh-wd ${w.date === date ? "is-on" : ""}`} onClick={() => setDate(w.date)}>
              <span>{fmtDay(w.date, { weekday: "short" })}</span><strong>{fmtDay(w.date, { day: "numeric" })}</strong><em>{w.count} RDV</em>
            </button>
          ))}
        </div>
      )}

      {data && barbers.length > 0 && (
        <div className="dsh-chips" role="group" aria-label="Filtrer par coiffeur">
          <button type="button" aria-pressed={who === "all"} onClick={() => setWho("all")}>Tous <em>{live(all).length}</em></button>
          {barbers.map(b => <button key={b.id} type="button" aria-pressed={who === b.id} onClick={() => setWho(b.id)}>{b.name} <em>{live(all.filter(a => a.barber?.id === b.id)).length}</em></button>)}
          {all.some(a => !a.barber) && <button type="button" aria-pressed={who === "none"} onClick={() => setWho("none")}>Sans coiffeur <em>{live(all.filter(a => !a.barber)).length}</em></button>}
        </div>
      )}

      {data && (data.absences.length > 0 || resting.length > 0) && (
        <div className="dsh-absent">
          {data.absences.map(a => <p key={a.id}><strong>{a.barberName}</strong> absent · {a.reason || "Absence"} ({absText(a)})</p>)}
          {resting.length > 0 && <p><strong>{resting.map(b => b.name).join(", ")}</strong> {resting.length > 1 ? "ne travaillent pas" : "ne travaille pas"} ce jour-là</p>}
        </div>
      )}

      <div className="dsh-stats">
        <Stat k="Rendez-vous" v={String(stats.count)} />
        <Stat k="Chiffre prévu" v={euros(stats.revenue)} />
        <Stat k="Venus" v={String(stats.done)} />
        <Stat k="Absents" v={String(stats.noShow)} />
        <Stat k="Annulés" v={String(stats.cancelled)} />
      </div>

      {err && <p className="dsh-err" role="alert">{err}</p>}

      <div className="dsh-grid">
        <section className="dsh-card dsh-list" aria-label="Rendez-vous du jour">
          <div className="dsh-card-h"><h2>Rendez-vous</h2>{data && <span className="dsh-muted">{barbers.filter(b => b.working).length} coiffeur(s) au planning</span>}</div>
          {!data && !err && <p className="dsh-muted">Chargement…</p>}
          {data && !appts.length && <p className="dsh-empty">Aucun rendez-vous{who !== "all" ? " pour ce coiffeur" : ""} ce jour-là.</p>}
          {data?.blocks.map(b => (
            <div className="dsh-block" key={b.id}>
              <span className="dsh-time">{time(b.start)}<br />{time(b.end)}</span>
              <span>Salon fermé{b.reason ? ` — ${b.reason}` : ""}</span>
              <button type="button" className="dsh-link" onClick={async () => { await api(`/api/admin/blocks/${b.id}`, { method: "DELETE" }); load(date, true); }}>Rouvrir</button>
            </div>
          ))}
          <ul className="dsh-appts">
            {appts.map(a => <ApptRow key={a.id} a={a} barbers={barbers} conflict={conflicts.has(a.id)} onPatch={patch} />)}
          </ul>
          {appts.length > 0 && <p className="dsh-muted dsh-foot">Pointez chaque client après son passage : les visites et absences alimentent le fichier clients.</p>}
        </section>

        <div className="dsh-side">
          <NewAppt services={services} barbers={barbers} date={date} onDone={() => load(date, true)} />
          <BlockForm date={date} onDone={() => load(date, true)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="dsh-stat"><span>{k}</span><strong>{v}</strong></div>;
}

function ApptRow({ a, barbers, conflict, onPatch }: { a: Appt; barbers: DayBarber[]; conflict: boolean; onPatch: (id: string, body: object) => void }) {
  const past = a.end < Date.now();
  const toCheck = past && a.status === "confirmed";
  const editNote = () => { const n = window.prompt("Note interne pour ce rendez-vous :", a.note); if (n !== null) onPatch(a.id, { note: n }); };
  return (
    <li className={`dsh-appt is-${a.status} ${toCheck ? "is-check" : ""}`}>
      <span className="dsh-time">{time(a.start)}<br /><em>{time(a.end)}</em></span>
      <div className="dsh-appt-main">
        <p className="dsh-name">{a.client.firstName} {a.client.lastName !== "-" ? a.client.lastName : ""}
          {a.client.visits > 0 && <span className="dsh-badge">{a.client.visits} visite{a.client.visits > 1 ? "s" : ""}</span>}
          {a.client.noShows > 0 && <span className="dsh-badge dsh-badge--warn">{a.client.noShows} absence{a.client.noShows > 1 ? "s" : ""}</span>}
          {a.client.visits === 0 && a.client.noShows === 0 && <span className="dsh-badge dsh-badge--new">Nouveau</span>}
        </p>
        <p className="dsh-svc">{a.serviceName} · {euros(a.priceCents)} · <span className="dsh-muted">{a.source === "site" ? "Réservé en ligne" : "Saisi au salon"}</span></p>
        <p className="dsh-contact"><a href={`tel:${a.client.phone}`}>{phoneFmt(a.client.phone)}</a>{a.client.email && <> · <a href={`mailto:${a.client.email}`}>{a.client.email}</a></>}</p>
        <label className="dsh-who">Coiffeur
          <select className="dsh-input dsh-input--sm" value={a.barber?.id ?? ""} onChange={e => onPatch(a.id, { barberId: e.target.value || null })}>
            <option value="">—</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            {a.barber && !barbers.some(b => b.id === a.barber!.id) && <option value={a.barber.id}>{a.barber.name}</option>}
          </select>
        </label>
        {conflict && <p className="dsh-conflict">Double réservation : {a.barber?.name} a un autre client sur ce créneau.</p>}
        {a.note && <p className="dsh-note">« {a.note} »</p>}
        <button type="button" className="dsh-link dsh-small" onClick={editNote}>{a.note ? "Modifier la note" : "Ajouter une note"}</button>
      </div>
      <div className="dsh-actions">
        {toCheck && <span className="dsh-flag">À pointer</span>}
        {a.status === "confirmed" ? (
          <>
            <button type="button" className="dsh-btn dsh-btn--ok" onClick={() => onPatch(a.id, { status: "done" })}>Venu</button>
            <button type="button" className="dsh-btn" onClick={() => onPatch(a.id, { status: "no_show" })}>Absent</button>
            <button type="button" className="dsh-btn dsh-btn--ghost" onClick={() => window.confirm("Annuler ce rendez-vous ?") && onPatch(a.id, { status: "cancelled" })}>Annuler</button>
          </>
        ) : (
          <>
            <span className={`dsh-pill is-${a.status}`}>{STATUS[a.status]}</span>
            <button type="button" className="dsh-link dsh-small" onClick={() => onPatch(a.id, { status: "confirmed" })}>Rétablir</button>
          </>
        )}
      </div>
    </li>
  );
}

const ERR: Record<string, string> = {
  full: "Aucun coiffeur n’est libre à cette heure. Cochez « Ajouter même si complet » pour l’enregistrer quand même.",
  barber: "Ce coiffeur n’est pas disponible à cette heure (absent, en repos ou déjà pris). Choisissez-en un autre, ou cochez « Ajouter même si complet ».",
  invalid: "Vérifiez le prénom, le téléphone, la date et l’heure.",
  service: "Prestation inconnue."
};

function NewAppt({ services, barbers, date, onDone }: { services: Svc[]; barbers: DayBarber[]; date: string; onDone: () => void }) {
  const blank = { serviceId: services[0]?.id ?? "", barberId: "any", date, time: "", firstName: "", lastName: "", phone: "", email: "", note: "", force: false };
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState(""), [ok, setOk] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => setF(x => ({ ...x, date })), [date]);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF(x => ({ ...x, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(""); setOk("");
    const r = await api<{ error?: string }>("/api/admin/appointments", { method: "POST", body: JSON.stringify(f) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setOk(`Rendez-vous ajouté : ${f.firstName}, ${f.time}.`); setF({ ...blank, date: f.date, serviceId: f.serviceId, barberId: f.barberId }); onDone(); return; }
    setMsg(ERR[r?.data.error ?? ""] || "L’ajout a échoué.");
  }

  return (
    <form className="dsh-card" onSubmit={submit}>
      <div className="dsh-card-h"><h2>Nouveau rendez-vous</h2></div>
      <div className="dsh-form">
        <label className="dsh-lbl">Prestation
          <select className="dsh-input" value={f.serviceId} onChange={set("serviceId")}>{services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.minutes} min · {s.price}</option>)}</select>
        </label>
        <label className="dsh-lbl">Coiffeur
          <select className="dsh-input" value={f.barberId} onChange={set("barberId")}>
            <option value="any">Sans préférence (premier libre)</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <div className="dsh-row">
          <label className="dsh-lbl">Date<input className="dsh-input" type="date" value={f.date} onChange={set("date")} required /></label>
          <label className="dsh-lbl">Heure<input className="dsh-input" type="time" step={300} value={f.time} onChange={set("time")} required /></label>
        </div>
        <div className="dsh-row">
          <label className="dsh-lbl">Prénom<input className="dsh-input" value={f.firstName} onChange={set("firstName")} required /></label>
          <label className="dsh-lbl">Nom<input className="dsh-input" value={f.lastName} onChange={set("lastName")} /></label>
        </div>
        <label className="dsh-lbl">Téléphone<input className="dsh-input" type="tel" value={f.phone} onChange={set("phone")} required /></label>
        <label className="dsh-lbl">E-mail (facultatif)<input className="dsh-input" type="email" value={f.email} onChange={set("email")} /></label>
        <label className="dsh-lbl">Note (facultatif)<input className="dsh-input" value={f.note} onChange={set("note")} /></label>
        <label className="dsh-check"><input type="checkbox" checked={f.force} onChange={e => setF(x => ({ ...x, force: e.target.checked }))} /> Ajouter même si complet</label>
        {msg && <p className="dsh-err" role="alert">{msg}</p>}
        {ok && <p className="dsh-ok" role="status">{ok}</p>}
        <button className="btn dsh-full" type="submit" disabled={busy}>{busy ? "Ajout…" : "Ajouter le rendez-vous"}</button>
      </div>
    </form>
  );
}

function BlockForm({ date, onDone }: { date: string; onDone: () => void }) {
  const [f, setF] = useState({ date, from: "12:00", to: "13:00", reason: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => setF(x => ({ ...x, date })), [date]);
  const send = async (body: typeof f) => {
    setMsg("");
    const r = await api("/api/admin/blocks", { method: "POST", body: JSON.stringify(body) }).catch(() => null);
    if (r?.ok) { setMsg("Créneau fermé : il n’est plus proposé en ligne."); onDone(); } else setMsg("Vérifiez les heures (début avant fin).");
  };
  return (
    <form className="dsh-card" onSubmit={e => { e.preventDefault(); send(f); }}>
      <div className="dsh-card-h"><h2>Fermer le salon</h2></div>
      <div className="dsh-form">
        <p className="dsh-muted">Fermeture pour tout le salon (jour férié, travaux…). Pour l’absence d’un seul coiffeur, utilisez l’onglet Équipe.</p>
        <label className="dsh-lbl">Date<input className="dsh-input" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
        <div className="dsh-row">
          <label className="dsh-lbl">De<input className="dsh-input" type="time" step={300} value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></label>
          <label className="dsh-lbl">À<input className="dsh-input" type="time" step={300} value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></label>
        </div>
        <label className="dsh-lbl">Motif (facultatif)<input className="dsh-input" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} placeholder="Ex. jour férié" /></label>
        <div className="dsh-row">
          <button className="btn dsh-full" type="submit">Fermer ce créneau</button>
          <button className="btn btn--ghost dsh-full" type="button" onClick={() => window.confirm(`Fermer toute la journée du ${fmtDay(f.date)} ?`) && send({ ...f, from: "00:00", to: "23:59", reason: f.reason || "Fermeture exceptionnelle" })}>Toute la journée</button>
        </div>
        {msg && <p className="dsh-muted" role="status">{msg}</p>}
      </div>
    </form>
  );
}

/* ---------------- Clients ---------------- */
function Clients() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<Client[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const r = await api<{ clients: Client[] }>(`/api/admin/clients?q=${encodeURIComponent(q)}`).catch(() => null);
      setList(r?.ok ? r.data.clients : []);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const totals = useMemo(() => ({ clients: list?.length ?? 0, visits: list?.reduce((s, c) => s + c.visits, 0) ?? 0 }), [list]);

  return (
    <div className="dsh-clients">
      <div className="dsh-daybar">
        <h1 className="dsh-day">Clients</h1>
        <input className="dsh-input dsh-search" type="search" placeholder="Rechercher un nom ou un numéro…" value={q} onChange={e => setQ(e.target.value)} aria-label="Rechercher un client" />
      </div>
      <div className="dsh-stats">
        <Stat k="Clients" v={String(totals.clients)} />
        <Stat k="Visites pointées" v={String(totals.visits)} />
      </div>
      <section className="dsh-card">
        {!list && <p className="dsh-muted">Chargement…</p>}
        {list && !list.length && <p className="dsh-empty">{q ? "Aucun client ne correspond." : "Les clients apparaîtront ici après leur première réservation."}</p>}
        {list && list.length > 0 && (
          <div className="dsh-table" role="table">
            <div className="dsh-tr dsh-th" role="row"><span role="columnheader">Client</span><span role="columnheader">Téléphone</span><span role="columnheader">Visites</span><span role="columnheader">Absences</span><span role="columnheader">Dernier passage</span><span role="columnheader">Prochain RDV</span><span role="columnheader">Total</span></div>
            {list.map(c => (
              <div key={c.id} className="dsh-tgroup">
                <button type="button" className={`dsh-tr ${open === c.id ? "is-open" : ""}`} role="row" onClick={() => setOpen(o => (o === c.id ? null : c.id))} aria-expanded={open === c.id}>
                  <span role="cell" className="dsh-name">{c.firstName} {c.lastName !== "-" ? c.lastName : ""}</span>
                  <span role="cell">{phoneFmt(c.phone)}</span>
                  <span role="cell">{c.visits}</span>
                  <span role="cell" className={c.noShows ? "dsh-warn" : ""}>{c.noShows}</span>
                  <span role="cell">{c.last ? shortDate(c.last) : "—"}</span>
                  <span role="cell">{c.next ? `${shortDate(c.next)}, ${time(c.next)}` : "—"}</span>
                  <span role="cell">{euros(c.spentCents)}</span>
                </button>
                {open === c.id && <ClientDetail c={c} onDeleted={() => { setOpen(null); setList(l => l?.filter(x => x.id !== c.id) ?? null); }} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClientDetail({ c, onDeleted }: { c: Client; onDeleted: () => void }) {
  const [hist, setHist] = useState<Appt[] | null>(null);
  const [notes, setNotes] = useState(c.notes);
  const [saved, setSaved] = useState("");
  useEffect(() => { api<{ history: Appt[] }>(`/api/admin/clients/${c.id}`).then(r => setHist(r.ok ? r.data.history : [])).catch(() => setHist([])); }, [c.id]);
  const save = async () => { const r = await api(`/api/admin/clients/${c.id}`, { method: "PATCH", body: JSON.stringify({ notes }) }); setSaved(r.ok ? "Enregistré." : "Échec de l’enregistrement."); };
  const remove = async () => {
    if (!window.confirm(`Supprimer définitivement ${c.firstName}${c.lastName !== "-" ? " " + c.lastName : ""} et tout son historique de rendez-vous ?`)) return;
    const r = await api(`/api/admin/clients/${c.id}`, { method: "DELETE" });
    if (r.ok) onDeleted(); else window.alert("La suppression a échoué.");
  };
  return (
    <div className="dsh-detail">
      <div>
        <p className="dsh-lbl">Coordonnées</p>
        <p><a href={`tel:${c.phone}`}>{phoneFmt(c.phone)}</a>{c.email && <><br /><a href={`mailto:${c.email}`}>{c.email}</a></>}</p>
        <label className="dsh-lbl" htmlFor={`n-${c.id}`}>Fiche (coupe habituelle, préférences…)</label>
        <textarea id={`n-${c.id}`} className="dsh-input" rows={4} value={notes} onChange={e => { setNotes(e.target.value); setSaved(""); }} />
        <div className="dsh-row dsh-row--end"><span className="dsh-muted">{saved}</span><button type="button" className="btn" onClick={save}>Enregistrer</button></div>
        <button type="button" className="dsh-btn dsh-btn--danger" onClick={remove}>Supprimer ce client</button>
      </div>
      <div>
        <p className="dsh-lbl">Historique</p>
        {!hist ? <p className="dsh-muted">Chargement…</p> : (
          <ul className="dsh-hist">
            {hist.map(h => <li key={h.id}><span>{shortDate(h.start)}, {time(h.start)}</span><span>{h.serviceName}{h.barber ? ` · ${h.barber.name}` : ""}</span><span className={`dsh-pill is-${h.status}`}>{STATUS[h.status]}</span></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */
function Messages({ onChange }: { onChange: () => void }) {
  const [list, setList] = useState<Message[] | null>(null);
  const load = useCallback(async () => {
    const r = await api<{ messages: Message[] }>("/api/admin/messages").catch(() => null);
    setList(r?.ok ? r.data.messages : []);
    onChange();
  }, [onChange]);
  useEffect(() => { load(); }, [load]);
  const patch = async (id: string, read: boolean) => { await api(`/api/admin/messages/${id}`, { method: "PATCH", body: JSON.stringify({ read }) }); load(); };
  const del = async (id: string) => { if (!window.confirm("Supprimer ce message ?")) return; await api(`/api/admin/messages/${id}`, { method: "DELETE" }); load(); };
  return (
    <div className="dsh-messages">
      <div className="dsh-daybar"><h1 className="dsh-day">Messages</h1></div>
      {!list && <p className="dsh-muted">Chargement…</p>}
      {list && !list.length && <section className="dsh-card"><p className="dsh-empty">Aucun message pour l’instant. Ils arrivent ici depuis le formulaire de la page Contact.</p></section>}
      <div className="dsh-msgs">
        {list?.map(m => (
          <article key={m.id} className={`dsh-card dsh-msg ${m.read ? "" : "is-unread"}`}>
            <div className="dsh-card-h">
              <h2>{m.name}</h2>
              <span className="dsh-muted">{shortDate(m.createdAt)}, {time(m.createdAt)}</span>
            </div>
            <p className="dsh-contact">
              {m.phone && <a href={`tel:${m.phone}`}>{phoneFmt(m.phone)}</a>}
              {m.phone && m.email && " · "}
              {m.email && <a href={`mailto:${m.email}?subject=${encodeURIComponent("Votre message à Finn’s Barber")}`}>{m.email}</a>}
            </p>
            <p className="dsh-msg-body">{m.body}</p>
            <div className="dsh-row dsh-row--start">
              <button type="button" className="dsh-btn" onClick={() => patch(m.id, !m.read)}>{m.read ? "Marquer non lu" : "Marquer comme lu"}</button>
              <button type="button" className="dsh-btn dsh-btn--ghost" onClick={() => del(m.id)}>Supprimer</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Équipe : coiffeurs, horaires, absences ---------------- */
function Team({ rules, mailOn }: { rules: Rules; mailOn: boolean }) {
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [newName, setNewName] = useState("");
  const load = useCallback(async () => {
    const r = await api<{ barbers: Barber[]; absences: Absence[] }>("/api/admin/barbers").catch(() => null);
    if (r?.ok) { setBarbers(r.data.barbers); setAbsences(r.data.absences); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    const r = await api("/api/admin/barbers", { method: "POST", body: JSON.stringify({ name: newName }) });
    if (r.ok) { setNewName(""); load(); } else window.alert("Nom invalide.");
  };

  return (
    <div className="dsh-team">
      <div className="dsh-daybar"><h1 className="dsh-day">Équipe</h1></div>
      <p className="dsh-muted dsh-intro">Chaque coiffeur est réservable en ligne selon ses horaires, sauf pendant ses absences. En « sans préférence », le site attribue le coiffeur libre le moins chargé de la journée.</p>

      <div className="dsh-team-grid">
        <div className="dsh-barbers">
          {!barbers && <p className="dsh-muted">Chargement…</p>}
          {barbers?.map(b => <BarberCard key={b.id} b={b} onSaved={load} />)}
          <form className="dsh-card dsh-add" onSubmit={add}>
            <div className="dsh-card-h"><h2>Ajouter un coiffeur</h2></div>
            <div className="dsh-row dsh-row--start">
              <input className="dsh-input" placeholder="Prénom" value={newName} onChange={e => setNewName(e.target.value)} aria-label="Prénom du coiffeur" />
              <button className="btn" type="submit">Ajouter</button>
            </div>
          </form>
        </div>

        <div className="dsh-side">
          {barbers && <AbsenceForm barbers={barbers.filter(b => b.active)} onDone={load} />}
          <section className="dsh-card">
            <div className="dsh-card-h"><h2>Absences à venir</h2></div>
            {!absences.length && <p className="dsh-muted">Aucune absence prévue.</p>}
            <ul className="dsh-abs-list">
              {absences.map(a => (
                <li key={a.id}>
                  <div><strong>{a.barberName}</strong> · {a.reason || "Absence"}<br /><span className="dsh-muted">{absText(a)}</span></div>
                  <button type="button" className="dsh-link dsh-small" onClick={async () => { if (window.confirm("Supprimer cette absence ?")) { await api(`/api/admin/absences/${a.id}`, { method: "DELETE" }); load(); } }}>Supprimer</button>
                </li>
              ))}
            </ul>
          </section>
          <section className="dsh-card">
            <div className="dsh-card-h"><h2>Règles de réservation</h2></div>
            <ul className="dsh-rules">
              <li>Un créneau toutes les <strong>{rules.slotStep} minutes</strong>, dans les horaires du salon et du coiffeur.</li>
              <li>Au plus tôt <strong>{rules.leadMinutes} minutes</strong> à l’avance, au plus tard <strong>{rules.horizonDays} jours</strong> à l’avance.</li>
              <li>Annulation en ligne jusqu’à <strong>{rules.cancelUntilHours} h</strong> avant.</li>
              <li>Au maximum <strong>{rules.maxActivePerClient} rendez-vous à venir</strong> par numéro.</li>
            </ul>
            <p className={mailOn ? "dsh-ok" : "dsh-err"}>{mailOn ? "E-mails de confirmation activés : chaque client reçoit sa confirmation." : "E-mails de confirmation non configurés : ajoutez les variables SMTP dans Vercel (voir le README)."}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function BarberCard({ b, onSaved }: { b: Barber; onSaved: () => void }) {
  const [name, setName] = useState(b.name);
  const [active, setActive] = useState(b.active);
  const [sched, setSched] = useState<Schedule>(() => Object.fromEntries(DAYS.map(([k]) => [k, b.schedule[k] ?? null])));
  const [msg, setMsg] = useState("");
  const toggleDay = (k: string, on: boolean) => setSched(s => ({ ...s, [k]: on ? (s[k] ?? ["10:00", "19:00"]) : null }));
  const setHour = (k: string, i: 0 | 1, v: string) => setSched(s => { const d = [...(s[k] ?? ["10:00", "19:00"])] as [string, string]; d[i] = v; return { ...s, [k]: d }; });
  const save = async () => {
    const r = await api(`/api/admin/barbers/${b.id}`, { method: "PATCH", body: JSON.stringify({ name, active, schedule: sched }) });
    setMsg(r.ok ? "Enregistré." : "Vérifiez le prénom et les horaires (début avant fin).");
    if (r.ok) onSaved();
  };
  return (
    <section className={`dsh-card dsh-barber ${active ? "" : "is-off"}`}>
      <div className="dsh-card-h">
        <div className="dsh-barber-id"><span className="dsh-av" aria-hidden="true">{name[0] || "?"}</span><input className="dsh-input dsh-input--name" value={name} onChange={e => { setName(e.target.value); setMsg(""); }} aria-label="Prénom" /></div>
        <label className="dsh-check"><input type="checkbox" checked={active} onChange={e => { setActive(e.target.checked); setMsg(""); }} /> Réservable en ligne</label>
      </div>
      <div className="dsh-sched">
        {DAYS.map(([k, l]) => {
          const d = sched[k];
          return (
            <div key={k} className={`dsh-sched-row ${d ? "" : "is-off"}`}>
              <label className="dsh-check"><input type="checkbox" checked={!!d} onChange={e => toggleDay(k, e.target.checked)} /> {l}</label>
              {d ? (
                <span className="dsh-sched-h">
                  <input className="dsh-input dsh-input--sm" type="time" step={900} value={d[0]} onChange={e => setHour(k, 0, e.target.value)} aria-label={`${l}, début`} />
                  <span>–</span>
                  <input className="dsh-input dsh-input--sm" type="time" step={900} value={d[1]} onChange={e => setHour(k, 1, e.target.value)} aria-label={`${l}, fin`} />
                </span>
              ) : <span className="dsh-muted">Repos</span>}
            </div>
          );
        })}
      </div>
      <div className="dsh-row dsh-row--end"><span className="dsh-muted">{msg}</span><button type="button" className="btn" onClick={save}>Enregistrer</button></div>
    </section>
  );
}

function AbsenceForm({ barbers, onDone }: { barbers: Barber[]; onDone: () => void }) {
  const today = todayParis();
  const [f, setF] = useState({ barberId: barbers[0]?.id ?? "", from: today, to: today, partial: false, fromTime: "14:00", toTime: "16:00", reason: "Congés" });
  const [msg, setMsg] = useState("");
  useEffect(() => { if (!f.barberId && barbers[0]) setF(x => ({ ...x, barberId: barbers[0].id })); }, [barbers, f.barberId]);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setMsg("");
    const body = f.partial ? { barberId: f.barberId, from: f.from, to: f.from, fromTime: f.fromTime, toTime: f.toTime, reason: f.reason } : { barberId: f.barberId, from: f.from, to: f.to, reason: f.reason };
    const r = await api("/api/admin/absences", { method: "POST", body: JSON.stringify(body) });
    if (r.ok) { setMsg("Absence enregistrée : le coiffeur n’est plus proposé sur cette période."); onDone(); } else setMsg("Vérifiez les dates (la fin après le début).");
  };
  return (
    <form className="dsh-card" onSubmit={submit}>
      <div className="dsh-card-h"><h2>Ajouter une absence</h2></div>
      <div className="dsh-form">
        <label className="dsh-lbl">Coiffeur
          <select className="dsh-input" value={f.barberId} onChange={e => setF({ ...f, barberId: e.target.value })}>{barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        </label>
        <label className="dsh-lbl">Motif
          <select className="dsh-input" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })}>{REASONS.map(r => <option key={r}>{r}</option>)}</select>
        </label>
        <label className="dsh-check"><input type="checkbox" checked={f.partial} onChange={e => setF({ ...f, partial: e.target.checked })} /> Seulement quelques heures</label>
        {f.partial ? (
          <>
            <label className="dsh-lbl">Jour<input className="dsh-input" type="date" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></label>
            <div className="dsh-row">
              <label className="dsh-lbl">De<input className="dsh-input" type="time" step={900} value={f.fromTime} onChange={e => setF({ ...f, fromTime: e.target.value })} /></label>
              <label className="dsh-lbl">À<input className="dsh-input" type="time" step={900} value={f.toTime} onChange={e => setF({ ...f, toTime: e.target.value })} /></label>
            </div>
          </>
        ) : (
          <div className="dsh-row">
            <label className="dsh-lbl">Du<input className="dsh-input" type="date" value={f.from} onChange={e => setF({ ...f, from: e.target.value, to: e.target.value > f.to ? e.target.value : f.to })} /></label>
            <label className="dsh-lbl">Au (inclus)<input className="dsh-input" type="date" value={f.to} min={f.from} onChange={e => setF({ ...f, to: e.target.value })} /></label>
          </div>
        )}
        {msg && <p className="dsh-muted" role="status">{msg}</p>}
        <button className="btn dsh-full" type="submit" disabled={!f.barberId}>Enregistrer l’absence</button>
      </div>
    </form>
  );
}
