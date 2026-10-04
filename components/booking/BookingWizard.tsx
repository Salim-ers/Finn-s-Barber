"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { booking, services } from "@/lib/data";
import { fullAddress, pad2 } from "@/lib/site";
import { icsHref } from "@/lib/booking/ics";
import { fmtDay, fmtWhen, toMin } from "@/lib/booking/time";

type Day = { date: string; slots: string[] };
type Done = { token: string; start: number; end: number; barber: string | null };
type BarberOpt = { id: string; name: string };
type Form = { firstName: string; lastName: string; phone: string; email: string; note: string; website: string };

const MSG: Record<string, string> = {
  full: "Ce créneau vient d’être pris. Choisissez-en un autre, la liste a été mise à jour.",
  slot: "Ce créneau n’est plus disponible. Choisissez-en un autre, la liste a été mise à jour.",
  barber: "Ce coiffeur n’est plus disponible sur ce créneau. Choisissez un autre horaire ou « Sans préférence ».",
  limit: `Vous avez déjà ${booking.maxActivePerClient} rendez-vous à venir avec ce numéro. Pour en ajouter un, contactez le salon.`,
  rate: "Trop de réservations depuis cette connexion. Réessayez un peu plus tard.",
  network: "La connexion a échoué. Vérifiez votre réseau et réessayez."
};
const FIELD: Record<string, string> = { firstName: "Indiquez votre prénom.", lastName: "Indiquez votre nom.", phone: "Indiquez un numéro de téléphone valide.", email: "Cette adresse e-mail n’est pas valide." };

function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.1 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
}

export default function BookingWizard({ initialService }: { initialService?: string }) {
  const [svcId, setSvcId] = useState(services.some(s => s.id === initialService) ? initialService! : "");
  const [days, setDays] = useState<Day[] | null>(null);
  const [barbers, setBarbers] = useState<BarberOpt[]>([]);
  const [barberId, setBarberId] = useState("any");
  const [loadErr, setLoadErr] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [form, setForm] = useState<Form>({ firstName: "", lastName: "", phone: "", email: "", note: "", website: "" });
  const [errs, setErrs] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const slotRef = useRef<HTMLElement>(null), formRef = useRef<HTMLElement>(null), topRef = useRef<HTMLDivElement>(null);
  const svc = services.find(s => s.id === svcId);

  const load = useCallback(async (id: string, who = "any", keepDate?: string) => {
    setDays(null); setLoadErr("");
    try {
      const r = await fetch(`/api/availability?service=${id}&barber=${who}`, { cache: "no-store" });
      if (!r.ok) { setLoadErr(r.status === 503 ? "unavailable" : "network"); return; }
      const j: { days: Day[]; barbers: BarberOpt[] } = await r.json();
      const d = j.days;
      setBarbers(j.barbers); setDays(d);
      const keep = d.find(x => x.date === keepDate && x.slots.length);
      setDate(keep ? keep.date : d.find(x => x.slots.length)?.date || "");
    } catch { setLoadErr("network"); }
  }, []);

  useEffect(() => { if (svcId) load(svcId, barberId, date); }, [svcId, barberId, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickService = (id: string) => { setSvcId(id); setTime(""); setMsg(""); setTimeout(() => scrollToEl(slotRef.current), 80); };
  const pickBarber = (id: string) => { setBarberId(id); setTime(""); setMsg(""); };
  const barberName = barbers.find(b => b.id === barberId)?.name;
  const pickTime = (t: string) => { setTime(t); setMsg(""); setTimeout(() => scrollToEl(formRef.current), 80); };
  const set = (k: keyof Form) => (e: { target: { value: string } }) => { setForm(f => ({ ...f, [k]: e.target.value })); setErrs(x => x.filter(y => y !== k)); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!svc || !date || !time || sending) return;
    const local = [!form.firstName.trim() && "firstName", !form.lastName.trim() && "lastName", form.phone.replace(/\D/g, "").length < 9 && "phone"].filter(Boolean) as string[];
    if (local.length) { setErrs(local); return; }
    setSending(true); setMsg("");
    try {
      const r = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: svc.id, date, time, barberId, ...form }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.token) { setDone({ token: j.token, start: j.start, end: j.end, barber: j.barber ?? null }); setTimeout(() => scrollToEl(topRef.current), 60); return; }
      if (j.error === "invalid") { setErrs(j.fields || []); return; }
      if (j.error === "unavailable") { setLoadErr("unavailable"); return; }
      setMsg(MSG[j.error] || MSG.network);
      if (j.error === "full" || j.error === "slot" || j.error === "barber") { setTime(""); load(svc.id, barberId, date); }
    } catch { setMsg(MSG.network); } finally { setSending(false); }
  }

  if (done && svc) {
    return (
      <div className="bk-done" ref={topRef}>
        <p className="label tick">Rendez-vous confirmé</p>
        <h2 className="bk-done-title">C’est réservé.</h2>
        <p className="lead bk-done-when">{svc.name}, {fmtWhen(done.start)}{done.barber ? `, avec ${done.barber}` : ""}.</p>
        <dl className="bk-recap">
          <div><dt>Durée</dt><dd>{svc.duration}</dd></div>
          <div><dt>Tarif</dt><dd>{svc.price}, réglé au salon</dd></div>
          <div><dt>Adresse</dt><dd>{fullAddress}</dd></div>
        </dl>
        <div className="bk-done-btns">
          <a className="btn" href={icsHref({ uid: done.token, start: done.start, end: done.end, title: `${svc.name} — Finn’s Barber` })} download="finns-barber-rendez-vous.ics">Ajouter à mon agenda</a>
          <Link className="btn btn--ghost" href={`/rdv/${done.token}`}>Gérer mon rendez-vous</Link>
        </div>
        <p className="bk-fine">Gardez le lien « Gérer mon rendez-vous » : il permet d’annuler jusqu’à {booking.cancelUntilHours} h avant. Merci d’arriver quelques minutes en avance.</p>
      </div>
    );
  }

  if (loadErr === "unavailable") {
    return (
      <div className="bk-off">
        <p className="label tick">Réservation en ligne</p>
        <p className="lead">La réservation en ligne est momentanément indisponible.</p>
        <p className="body">Passez directement au salon, {fullAddress}, aux <Link className="ul" href="/contact">horaires d’ouverture</Link>.</p>
      </div>
    );
  }

  const day = days?.find(d => d.date === date);
  const groups = day ? [["Matin", day.slots.filter(t => toMin(t) < 720)], ["Après-midi", day.slots.filter(t => toMin(t) >= 720 && toMin(t) < 1020)], ["Fin de journée", day.slots.filter(t => toMin(t) >= 1020)]] as [string, string[]][] : [];
  const step = !svcId ? 1 : !time ? 2 : 3;

  return (
    <div className="bk" ref={topRef}>
      <ol className="bk-steps" aria-label="Étapes de la réservation">
        {["Prestation", "Créneau", "Coordonnées"].map((l, i) => <li key={l} className={step > i + 1 ? "is-done" : step === i + 1 ? "is-on" : ""}><span>{pad2(i + 1)}</span>{l}</li>)}
      </ol>

      <section className="bk-sec" aria-labelledby="bk-s1">
        <h2 className="bk-h" id="bk-s1"><span>01</span>La prestation</h2>
        <div className="bk-svcs">
          {services.map(s => (
            <button key={s.id} type="button" className="bk-svc" aria-pressed={s.id === svcId} onClick={() => pickService(s.id)}>
              <span className="bk-svc-name">{s.name}</span>
              <span className="bk-svc-meta">{s.duration} · {s.price}</span>
              <span className="bk-svc-desc">{s.short}</span>
            </button>
          ))}
        </div>
        {svcId && barbers.length > 0 && (
          <div className="bk-who">
            <p className="bk-who-q">Avec qui ?</p>
            <div className="bk-barbers" role="radiogroup" aria-label="Coiffeur">
              <button type="button" role="radio" aria-checked={barberId === "any"} className="bk-barber" onClick={() => pickBarber("any")}>
                <span className="bk-av bk-av--any" aria-hidden="true">✦</span><span className="bk-barber-name">Sans préférence</span>
              </button>
              {barbers.map(b => (
                <button key={b.id} type="button" role="radio" aria-checked={barberId === b.id} className="bk-barber" onClick={() => pickBarber(b.id)}>
                  <span className="bk-av" aria-hidden="true">{b.name[0]}</span><span className="bk-barber-name">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={`bk-sec ${svcId ? "" : "is-locked"}`} ref={slotRef} aria-labelledby="bk-s2">
        <h2 className="bk-h" id="bk-s2"><span>02</span>Le créneau</h2>
        {!svcId ? <p className="bk-hint">Choisissez d’abord une prestation.</p>
          : loadErr ? <p className="bk-msg" role="alert">{MSG.network} <button type="button" className="ul" onClick={() => load(svcId, barberId, date)}>Réessayer</button></p>
          : !days ? <p className="bk-hint" aria-live="polite">Chargement des disponibilités…</p>
          : (
            <>
              <div className="bk-days" data-lenis-prevent role="listbox" aria-label="Jour">
                {days.map(d => (
                  <button key={d.date} type="button" role="option" aria-selected={d.date === date} className="bk-day" disabled={!d.slots.length} onClick={() => { setDate(d.date); setTime(""); }}>
                    <span>{fmtDay(d.date, { weekday: "short" })}</span>
                    <strong>{fmtDay(d.date, { day: "numeric" })}</strong>
                    <span>{fmtDay(d.date, { month: "short" })}</span>
                  </button>
                ))}
              </div>
              {date ? (
                <div className="bk-slots">
                  <p className="bk-day-label">{fmtDay(date)}</p>
                  {groups.filter(([, g]) => g.length).map(([label, g]) => (
                    <div className="bk-group" key={label}>
                      <p className="label">{label}</p>
                      <div className="bk-times">{g.map(t => <button key={t} type="button" className="bk-time" aria-pressed={t === time} onClick={() => pickTime(t)}>{t}</button>)}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="bk-hint">{barberName ? <>Aucun créneau avec {barberName} sur les {booking.horizonDays} prochains jours. <button type="button" className="ul" onClick={() => pickBarber("any")}>Voir tous les coiffeurs</button></> : <>Aucun créneau disponible sur les {booking.horizonDays} prochains jours.</>}</p>}
            </>
          )}
      </section>

      <section className={`bk-sec ${time ? "" : "is-locked"}`} ref={formRef} aria-labelledby="bk-s3">
        <h2 className="bk-h" id="bk-s3"><span>03</span>Vos coordonnées</h2>
        {!time ? <p className="bk-hint">Choisissez un jour et une heure.</p> : (
          <form className="bk-form" onSubmit={submit} noValidate>
            <div className="bk-fields">
              <Field id="firstName" label="Prénom" value={form.firstName} onChange={set("firstName")} err={errs.includes("firstName")} auto="given-name" />
              <Field id="lastName" label="Nom" value={form.lastName} onChange={set("lastName")} err={errs.includes("lastName")} auto="family-name" />
              <Field id="phone" label="Téléphone" type="tel" value={form.phone} onChange={set("phone")} err={errs.includes("phone")} auto="tel" hint="Le salon vous appelle en cas d’imprévu." />
              <Field id="email" label="E-mail (facultatif)" type="email" value={form.email} onChange={set("email")} err={errs.includes("email")} auto="email" hint="Pour recevoir la confirmation." />
              <div className="bk-field bk-field--wide">
                <label htmlFor="note">Une précision ? (facultatif)</label>
                <textarea id="note" rows={3} maxLength={300} value={form.note} onChange={set("note")} placeholder="Coupe habituelle, demande particulière…" />
              </div>
              <div className="bk-hp" aria-hidden="true"><label htmlFor="website">Site web</label><input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></div>
            </div>
            <aside className="bk-sum">
              <p className="label">Récapitulatif</p>
              <p className="bk-sum-svc">{svc?.name}</p>
              <p className="bk-sum-when">{fmtDay(date)}<br />à {time}</p>
              <p className="bk-sum-who">{barberName ? `Avec ${barberName}` : "Avec le premier coiffeur disponible"}</p>
              <p className="bk-sum-meta">{svc?.duration} · {svc?.price}, réglé au salon</p>
              {msg && <p className="bk-msg" role="alert">{msg}</p>}
              <button className="btn bk-submit" type="submit" disabled={sending}>{sending ? "Réservation…" : "Confirmer le rendez-vous"}</button>
              <p className="bk-fine">Vos informations servent uniquement à la gestion de votre rendez-vous par le salon. <Link className="ul" href="/politique-confidentialite">Confidentialité</Link></p>
            </aside>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({ id, label, value, onChange, err, type = "text", auto, hint }: { id: string; label: string; value: string; onChange: (e: { target: { value: string } }) => void; err?: boolean; type?: string; auto?: string; hint?: string }) {
  return (
    <div className={`bk-field ${err ? "is-err" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} value={value} onChange={onChange} autoComplete={auto} aria-invalid={err || undefined} aria-describedby={err ? `${id}-err` : hint ? `${id}-hint` : undefined} />
      {err ? <p className="bk-err" id={`${id}-err`}>{FIELD[id]}</p> : hint ? <p className="bk-field-hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}
