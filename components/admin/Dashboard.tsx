"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { addDays, fmtDay, hhmm, parisOf } from "@/lib/booking/time";

/* =========================================================
   TABLEAU DE BORD DU SALON — agenda, clients, réglages
   ========================================================= */
type Svc = { id: string; name: string; minutes: number; price: string };
type Rules = { slotStep: number; leadMinutes: number; horizonDays: number; cancelUntilHours: number; maxActivePerClient: number };
type Status = "confirmed" | "done" | "no_show" | "cancelled";
type Appt = {
  id: string; serviceId: string; serviceName: string; minutes: number; priceCents: number; start: number; end: number; status: Status; source: string; note: string; createdAt: number;
  client: { id: string; firstName: string; lastName: string; phone: string; email: string; visits: number; noShows: number };
};
type Block = { id: string; reason: string; start: number; end: number };
type DayData = { date: string; capacity: number; appointments: Appt[]; blocks: Block[]; week: { date: string; count: number }[] };
type Client = { id: string; firstName: string; lastName: string; phone: string; email: string; notes: string; visits: number; noShows: number; upcoming: number; spentCents: number; last: number | null; next: number | null };

const STATUS: Record<Status, string> = { confirmed: "Confirmé", done: "Venu", no_show: "Absent", cancelled: "Annulé" };
const time = (t: number) => hhmm(parisOf(t).min);
const euros = (c: number) => `${(c / 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;
const phoneFmt = (p: string) => (/^0\d{9}$/.test(p) ? p.replace(/(\d{2})(?=\d)/g, "$1 ") : p);
const todayParis = () => parisOf(Date.now()).date;
const shortDate = (t: number) => { const { date } = parisOf(t); return fmtDay(date, { day: "numeric", month: "short", year: "numeric" }); };

async function api<T = Record<string, unknown>>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T }> {
  const r = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  if (r.status === 401) { window.location.reload(); }
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: data as T };
}

export default function Dashboard({ services, rules }: { services: Svc[]; rules: Rules }) {
  const [tab, setTab] = useState<"agenda" | "clients" | "settings">("agenda");
  const logout = async () => { await api("/api/admin/session", { method: "DELETE" }); window.location.reload(); };
  return (
    <div className="ad">
      <header className="ad-top">
        <p className="ad-brand">Finn’s<span>Tableau de bord</span></p>
        <nav className="ad-tabs" aria-label="Sections">
          {([["agenda", "Agenda"], ["clients", "Clients"], ["settings", "Réglages"]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
        <div className="ad-top-r">
          <a className="ad-link" href="/" target="_blank" rel="noopener">Voir le site</a>
          <button className="ad-link" type="button" onClick={logout}>Déconnexion</button>
        </div>
      </header>
      <main className="ad-main">
        {tab === "agenda" && <Agenda services={services} />}
        {tab === "clients" && <Clients />}
        {tab === "settings" && <Settings rules={rules} />}
      </main>
    </div>
  );
}

/* ---------------- Agenda ---------------- */
function Agenda({ services }: { services: Svc[] }) {
  const [date, setDate] = useState(todayParis);
  const [data, setData] = useState<DayData | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (d: string, silent = false) => {
    if (!silent) setErr("");
    const r = await api<DayData & { error?: string }>(`/api/admin/day?date=${d}`).catch(() => null);
    if (!r) { setErr("Connexion impossible. Vérifiez le réseau."); return; }
    if (!r.ok) { setErr(r.status === 503 ? "La base de données n’est pas configurée (DATABASE_URL)." : "Chargement impossible."); return; }
    setData(r.data);
  }, []);

  useEffect(() => { load(date); const t = setInterval(() => load(date, true), 60000); return () => clearInterval(t); }, [date, load]);

  const appts = data?.appointments ?? [];
  const live = appts.filter(a => a.status !== "cancelled");
  const stats = {
    count: appts.filter(a => a.status === "confirmed" || a.status === "done").length,
    revenue: appts.filter(a => a.status === "confirmed" || a.status === "done").reduce((s, a) => s + a.priceCents, 0),
    done: appts.filter(a => a.status === "done").length,
    noShow: appts.filter(a => a.status === "no_show").length,
    cancelled: appts.filter(a => a.status === "cancelled").length
  };

  async function patch(id: string, body: object) {
    const r = await api(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (!r.ok) window.alert("La modification n’a pas pu être enregistrée.");
    load(date, true);
  }

  return (
    <div className="ad-agenda">
      <div className="ad-daybar">
        <div className="ad-daynav">
          <button type="button" className="ad-icon" aria-label="Jour précédent" onClick={() => setDate(d => addDays(d, -1))}>←</button>
          <h1 className="ad-day">{fmtDay(date)}</h1>
          <button type="button" className="ad-icon" aria-label="Jour suivant" onClick={() => setDate(d => addDays(d, 1))}>→</button>
        </div>
        <div className="ad-daynav">
          {date !== todayParis() && <button type="button" className="ad-chip" onClick={() => setDate(todayParis())}>Aujourd’hui</button>}
          <input className="ad-input ad-input--date" type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)} aria-label="Choisir une date" />
        </div>
      </div>

      {data && (
        <div className="ad-week" role="list">
          {data.week.map(w => (
            <button key={w.date} role="listitem" type="button" className={`ad-wd ${w.date === date ? "is-on" : ""}`} onClick={() => setDate(w.date)}>
              <span>{fmtDay(w.date, { weekday: "short" })}</span><strong>{fmtDay(w.date, { day: "numeric" })}</strong><em>{w.count} RDV</em>
            </button>
          ))}
        </div>
      )}

      <div className="ad-stats">
        <Stat k="Rendez-vous" v={String(stats.count)} />
        <Stat k="Chiffre prévu" v={euros(stats.revenue)} />
        <Stat k="Venus" v={String(stats.done)} />
        <Stat k="Absents" v={String(stats.noShow)} />
        <Stat k="Annulés" v={String(stats.cancelled)} />
      </div>

      {err && <p className="ad-err" role="alert">{err}</p>}

      <div className="ad-grid">
        <section className="ad-card ad-list" aria-label="Rendez-vous du jour">
          <div className="ad-card-h"><h2>Rendez-vous</h2>{data && <span className="ad-muted">{data.capacity} coiffeur{data.capacity > 1 ? "s" : ""} en simultané</span>}</div>
          {!data && !err && <p className="ad-muted">Chargement…</p>}
          {data && !appts.length && <p className="ad-empty">Aucun rendez-vous ce jour-là.</p>}
          {data?.blocks.map(b => (
            <div className="ad-block" key={b.id}>
              <span className="ad-time">{time(b.start)}<br />{time(b.end)}</span>
              <span>Créneau bloqué{b.reason ? ` — ${b.reason}` : ""}</span>
              <button type="button" className="ad-link" onClick={async () => { await api(`/api/admin/blocks/${b.id}`, { method: "DELETE" }); load(date, true); }}>Rouvrir</button>
            </div>
          ))}
          <ul className="ad-appts">
            {appts.map(a => <ApptRow key={a.id} a={a} onPatch={patch} />)}
          </ul>
          {live.length > 0 && <p className="ad-muted ad-foot">Pointez chaque client après son passage : les visites et absences alimentent le fichier clients.</p>}
        </section>

        <div className="ad-side">
          <NewAppt services={services} date={date} onDone={() => load(date, true)} />
          <BlockForm date={date} onDone={() => load(date, true)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="ad-stat"><span>{k}</span><strong>{v}</strong></div>;
}

function ApptRow({ a, onPatch }: { a: Appt; onPatch: (id: string, body: object) => void }) {
  const past = a.end < Date.now();
  const toCheck = past && a.status === "confirmed";
  const editNote = () => { const n = window.prompt("Note interne pour ce rendez-vous :", a.note); if (n !== null) onPatch(a.id, { note: n }); };
  return (
    <li className={`ad-appt is-${a.status} ${toCheck ? "is-check" : ""}`}>
      <span className="ad-time">{time(a.start)}<br /><em>{time(a.end)}</em></span>
      <div className="ad-appt-main">
        <p className="ad-name">{a.client.firstName} {a.client.lastName !== "-" ? a.client.lastName : ""}
          {a.client.visits > 0 && <span className="ad-badge">{a.client.visits} visite{a.client.visits > 1 ? "s" : ""}</span>}
          {a.client.noShows > 0 && <span className="ad-badge ad-badge--warn">{a.client.noShows} absence{a.client.noShows > 1 ? "s" : ""}</span>}
          {a.client.visits === 0 && a.client.noShows === 0 && <span className="ad-badge ad-badge--new">Nouveau</span>}
        </p>
        <p className="ad-svc">{a.serviceName} · {euros(a.priceCents)} · <span className="ad-muted">{a.source === "site" ? "Réservé en ligne" : "Saisi au salon"}</span></p>
        <p className="ad-contact"><a href={`tel:${a.client.phone}`}>{phoneFmt(a.client.phone)}</a>{a.client.email && <> · <a href={`mailto:${a.client.email}`}>{a.client.email}</a></>}</p>
        {a.note && <p className="ad-note">« {a.note} »</p>}
        <button type="button" className="ad-link ad-small" onClick={editNote}>{a.note ? "Modifier la note" : "Ajouter une note"}</button>
      </div>
      <div className="ad-actions">
        {toCheck && <span className="ad-flag">À pointer</span>}
        {a.status === "confirmed" ? (
          <>
            <button type="button" className="ad-btn ad-btn--ok" onClick={() => onPatch(a.id, { status: "done" })}>Venu</button>
            <button type="button" className="ad-btn" onClick={() => onPatch(a.id, { status: "no_show" })}>Absent</button>
            <button type="button" className="ad-btn ad-btn--ghost" onClick={() => window.confirm("Annuler ce rendez-vous ?") && onPatch(a.id, { status: "cancelled" })}>Annuler</button>
          </>
        ) : (
          <>
            <span className={`ad-pill is-${a.status}`}>{STATUS[a.status]}</span>
            <button type="button" className="ad-link ad-small" onClick={() => onPatch(a.id, { status: "confirmed" })}>Rétablir</button>
          </>
        )}
      </div>
    </li>
  );
}

const ERR: Record<string, string> = {
  full: "Ce créneau est complet : tous les coiffeurs sont pris. Cochez « Ajouter même si complet » pour l’enregistrer quand même.",
  invalid: "Vérifiez le prénom, le téléphone, la date et l’heure.",
  service: "Prestation inconnue."
};

function NewAppt({ services, date, onDone }: { services: Svc[]; date: string; onDone: () => void }) {
  const blank = { serviceId: services[0]?.id ?? "", date, time: "", firstName: "", lastName: "", phone: "", email: "", note: "", force: false };
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState(""), [ok, setOk] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => setF(x => ({ ...x, date })), [date]);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF(x => ({ ...x, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(""); setOk("");
    const r = await api<{ error?: string }>("/api/admin/appointments", { method: "POST", body: JSON.stringify(f) }).catch(() => null);
    setBusy(false);
    if (r?.ok) { setOk(`Rendez-vous ajouté : ${f.firstName}, ${f.time}.`); setF({ ...blank, date: f.date, serviceId: f.serviceId }); onDone(); return; }
    setMsg(ERR[r?.data.error ?? ""] || "L’ajout a échoué.");
  }

  return (
    <form className="ad-card" onSubmit={submit}>
      <div className="ad-card-h"><h2>Nouveau rendez-vous</h2></div>
      <div className="ad-form">
        <label className="ad-lbl">Prestation
          <select className="ad-input" value={f.serviceId} onChange={set("serviceId")}>{services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.minutes} min · {s.price}</option>)}</select>
        </label>
        <div className="ad-row">
          <label className="ad-lbl">Date<input className="ad-input" type="date" value={f.date} onChange={set("date")} required /></label>
          <label className="ad-lbl">Heure<input className="ad-input" type="time" step={300} value={f.time} onChange={set("time")} required /></label>
        </div>
        <div className="ad-row">
          <label className="ad-lbl">Prénom<input className="ad-input" value={f.firstName} onChange={set("firstName")} required /></label>
          <label className="ad-lbl">Nom<input className="ad-input" value={f.lastName} onChange={set("lastName")} /></label>
        </div>
        <label className="ad-lbl">Téléphone<input className="ad-input" type="tel" value={f.phone} onChange={set("phone")} required /></label>
        <label className="ad-lbl">E-mail (facultatif)<input className="ad-input" type="email" value={f.email} onChange={set("email")} /></label>
        <label className="ad-lbl">Note (facultatif)<input className="ad-input" value={f.note} onChange={set("note")} /></label>
        <label className="ad-check"><input type="checkbox" checked={f.force} onChange={e => setF(x => ({ ...x, force: e.target.checked }))} /> Ajouter même si complet</label>
        {msg && <p className="ad-err" role="alert">{msg}</p>}
        {ok && <p className="ad-ok" role="status">{ok}</p>}
        <button className="btn ad-full" type="submit" disabled={busy}>{busy ? "Ajout…" : "Ajouter le rendez-vous"}</button>
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
    if (r?.ok) { setMsg("Créneau bloqué : il n’est plus proposé en ligne."); onDone(); } else setMsg("Vérifiez les heures (début avant fin).");
  };
  return (
    <form className="ad-card" onSubmit={e => { e.preventDefault(); send(f); }}>
      <div className="ad-card-h"><h2>Bloquer un créneau</h2></div>
      <div className="ad-form">
        <p className="ad-muted">Pause, absence, fermeture exceptionnelle : le créneau n’est plus proposé aux clients.</p>
        <label className="ad-lbl">Date<input className="ad-input" type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></label>
        <div className="ad-row">
          <label className="ad-lbl">De<input className="ad-input" type="time" step={300} value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></label>
          <label className="ad-lbl">À<input className="ad-input" type="time" step={300} value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></label>
        </div>
        <label className="ad-lbl">Motif (facultatif)<input className="ad-input" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} placeholder="Ex. pause déjeuner" /></label>
        <div className="ad-row">
          <button className="btn ad-full" type="submit">Bloquer</button>
          <button className="btn btn--ghost ad-full" type="button" onClick={() => window.confirm(`Fermer toute la journée du ${fmtDay(f.date)} à la réservation en ligne ?`) && send({ ...f, from: "00:00", to: "23:59", reason: f.reason || "Fermeture exceptionnelle" })}>Fermer la journée</button>
        </div>
        {msg && <p className="ad-muted" role="status">{msg}</p>}
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
    <div className="ad-clients">
      <div className="ad-daybar">
        <h1 className="ad-day">Clients</h1>
        <input className="ad-input ad-search" type="search" placeholder="Rechercher un nom ou un numéro…" value={q} onChange={e => setQ(e.target.value)} aria-label="Rechercher un client" />
      </div>
      <div className="ad-stats">
        <Stat k="Clients" v={String(totals.clients)} />
        <Stat k="Visites pointées" v={String(totals.visits)} />
      </div>
      <section className="ad-card">
        {!list && <p className="ad-muted">Chargement…</p>}
        {list && !list.length && <p className="ad-empty">{q ? "Aucun client ne correspond." : "Les clients apparaîtront ici après leur première réservation."}</p>}
        {list && list.length > 0 && (
          <div className="ad-table" role="table">
            <div className="ad-tr ad-th" role="row"><span role="columnheader">Client</span><span role="columnheader">Téléphone</span><span role="columnheader">Visites</span><span role="columnheader">Absences</span><span role="columnheader">Dernier passage</span><span role="columnheader">Prochain RDV</span><span role="columnheader">Total</span></div>
            {list.map(c => (
              <div key={c.id} className="ad-tgroup">
                <button type="button" className={`ad-tr ${open === c.id ? "is-open" : ""}`} role="row" onClick={() => setOpen(o => (o === c.id ? null : c.id))} aria-expanded={open === c.id}>
                  <span role="cell" className="ad-name">{c.firstName} {c.lastName !== "-" ? c.lastName : ""}</span>
                  <span role="cell">{phoneFmt(c.phone)}</span>
                  <span role="cell">{c.visits}</span>
                  <span role="cell" className={c.noShows ? "ad-warn" : ""}>{c.noShows}</span>
                  <span role="cell">{c.last ? shortDate(c.last) : "—"}</span>
                  <span role="cell">{c.next ? `${shortDate(c.next)}, ${time(c.next)}` : "—"}</span>
                  <span role="cell">{euros(c.spentCents)}</span>
                </button>
                {open === c.id && <ClientDetail c={c} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClientDetail({ c }: { c: Client }) {
  const [hist, setHist] = useState<Appt[] | null>(null);
  const [notes, setNotes] = useState(c.notes);
  const [saved, setSaved] = useState("");
  useEffect(() => { api<{ history: Appt[] }>(`/api/admin/clients/${c.id}`).then(r => setHist(r.ok ? r.data.history : [])).catch(() => setHist([])); }, [c.id]);
  const save = async () => { const r = await api(`/api/admin/clients/${c.id}`, { method: "PATCH", body: JSON.stringify({ notes }) }); setSaved(r.ok ? "Enregistré." : "Échec de l’enregistrement."); };
  return (
    <div className="ad-detail">
      <div>
        <p className="ad-lbl">Coordonnées</p>
        <p><a href={`tel:${c.phone}`}>{phoneFmt(c.phone)}</a>{c.email && <><br /><a href={`mailto:${c.email}`}>{c.email}</a></>}</p>
        <label className="ad-lbl" htmlFor={`n-${c.id}`}>Fiche (coupe habituelle, préférences…)</label>
        <textarea id={`n-${c.id}`} className="ad-input" rows={4} value={notes} onChange={e => { setNotes(e.target.value); setSaved(""); }} />
        <div className="ad-row ad-row--end"><span className="ad-muted">{saved}</span><button type="button" className="btn" onClick={save}>Enregistrer</button></div>
      </div>
      <div>
        <p className="ad-lbl">Historique</p>
        {!hist ? <p className="ad-muted">Chargement…</p> : (
          <ul className="ad-hist">
            {hist.map(h => <li key={h.id}><span>{shortDate(h.start)}, {time(h.start)}</span><span>{h.serviceName}</span><span className={`ad-pill is-${h.status}`}>{STATUS[h.status]}</span></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- Réglages ---------------- */
function Settings({ rules }: { rules: Rules }) {
  const [cap, setCap] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { api<{ capacity: number }>("/api/admin/settings").then(r => r.ok && setCap(r.data.capacity)).catch(() => setMsg("Chargement impossible.")); }, []);
  const save = async () => {
    const r = await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ capacity: cap }) });
    setMsg(r.ok ? "Enregistré : les créneaux proposés en ligne sont mis à jour." : "Valeur invalide (0 à 12).");
  };
  return (
    <div className="ad-settings">
      <h1 className="ad-day">Réglages</h1>
      <section className="ad-card">
        <div className="ad-card-h"><h2>Coiffeurs disponibles en même temps</h2></div>
        <div className="ad-form">
          <p className="ad-muted">Un créneau est proposé en ligne tant qu’il reste un fauteuil libre. Mettez 0 pour suspendre la réservation en ligne.</p>
          <div className="ad-row ad-row--start">
            <button type="button" className="ad-icon" aria-label="Moins" onClick={() => setCap(c => Math.max(0, (c ?? 0) - 1))}>−</button>
            <input className="ad-input ad-num" type="number" min={0} max={12} value={cap ?? ""} onChange={e => setCap(Number(e.target.value))} aria-label="Nombre de coiffeurs" />
            <button type="button" className="ad-icon" aria-label="Plus" onClick={() => setCap(c => Math.min(12, (c ?? 0) + 1))}>+</button>
            <button type="button" className="btn" onClick={save} disabled={cap === null}>Enregistrer</button>
          </div>
          {msg && <p className="ad-muted" role="status">{msg}</p>}
        </div>
      </section>
      <section className="ad-card">
        <div className="ad-card-h"><h2>Règles de réservation en ligne</h2></div>
        <ul className="ad-rules">
          <li>Un créneau proposé toutes les <strong>{rules.slotStep} minutes</strong>, selon les horaires d’ouverture.</li>
          <li>Réservation au plus tôt <strong>{rules.leadMinutes} minutes</strong> à l’avance, au plus tard <strong>{rules.horizonDays} jours</strong> à l’avance.</li>
          <li>Annulation en ligne jusqu’à <strong>{rules.cancelUntilHours} h</strong> avant le rendez-vous.</li>
          <li>Au maximum <strong>{rules.maxActivePerClient} rendez-vous à venir</strong> par numéro de téléphone.</li>
        </ul>
        <p className="ad-muted">Ces règles et les horaires se modifient dans lib/data.ts (sections « booking » et « openingHours »).</p>
      </section>
    </div>
  );
}
