"use client";

import Link from "next/link";
import { useState } from "react";
import { fullAddress } from "@/lib/site";
import { icsHref } from "@/lib/booking/ics";
import { fmtWhen } from "@/lib/booking/time";

type Appt = { serviceName: string; minutes: number; priceCents: number; start: number; end: number; status: string; firstName: string };
const LABEL: Record<string, string> = { confirmed: "Confirmé", done: "Honoré", no_show: "Manqué", cancelled: "Annulé" };

export default function ManageBooking({ token, appt, canCancel, cancelUntilHours }: { token: string; appt: Appt; canCancel: boolean; cancelUntilHours: number }) {
  const [status, setStatus] = useState(appt.status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upcoming = status === "confirmed" && appt.end > Date.now();

  async function cancel() {
    if (!window.confirm("Annuler ce rendez-vous ?")) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/bookings/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) setStatus("cancelled");
      else setErr(j.error === "late" ? `L’annulation en ligne n’est plus possible à moins de ${cancelUntilHours} h du rendez-vous. Contactez le salon.` : "L’annulation a échoué. Réessayez ou contactez le salon.");
    } catch { setErr("La connexion a échoué. Réessayez."); } finally { setBusy(false); }
  }

  return (
    <div className="bk-done">
      <p className={`bk-status is-${status}`}>{LABEL[status] || status}</p>
      <h2 className="bk-done-title">{appt.serviceName}</h2>
      <p className="lead bk-done-when">{fmtWhen(appt.start)}</p>
      <dl className="bk-recap">
        <div><dt>Au nom de</dt><dd>{appt.firstName}</dd></div>
        <div><dt>Durée</dt><dd>{appt.minutes} min</dd></div>
        <div><dt>Tarif</dt><dd>{(appt.priceCents / 100).toFixed(0)} €, réglé au salon</dd></div>
        <div><dt>Adresse</dt><dd>{fullAddress}</dd></div>
      </dl>
      {status === "cancelled" ? (
        <div className="bk-done-btns"><Link className="btn" href="/reserver">Reprendre un rendez-vous</Link></div>
      ) : upcoming ? (
        <div className="bk-done-btns">
          <a className="btn" href={icsHref({ uid: token, start: appt.start, end: appt.end, title: `${appt.serviceName} — Finn’s Barber` })} download="finns-barber-rendez-vous.ics">Ajouter à mon agenda</a>
          {canCancel && <button className="btn btn--ghost" type="button" onClick={cancel} disabled={busy}>{busy ? "Annulation…" : "Annuler le rendez-vous"}</button>}
        </div>
      ) : null}
      {err && <p className="bk-msg" role="alert">{err}</p>}
      {upcoming && !canCancel && <p className="bk-fine">Le rendez-vous est dans moins de {cancelUntilHours} h : pour l’annuler, contactez directement le salon.</p>}
    </div>
  );
}
