/* =========================================================
   E-MAILS DE RÉSERVATION (facultatifs)
   Envoyés via Resend si RESEND_API_KEY et MAIL_FROM sont configurés.
   SALON_NOTIFY_EMAIL (ou salon.email) reçoit une copie de chaque réservation et annulation.
   Sans configuration, rien n’est envoyé : le client garde son lien personnel à l’écran.
   ========================================================= */
import { salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";
import type { Appointment } from "./repo";
import { fmtWhen } from "./time";
import { fmtPhone } from "./validate";

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from || !to) return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html })
    });
    if (!r.ok) console.error("Resend", r.status, await r.text());
  } catch (e) { console.error("Resend", e); }
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const layout = (body: string) => `<div style="font-family:Helvetica,Arial,sans-serif;background:#F4EEDF;padding:32px;color:#071B2E">
  <div style="max-width:520px;margin:0 auto;background:#FBF8F0;padding:32px;border:1px solid #C3B59B">
  <p style="font-family:Georgia,serif;font-size:26px;font-weight:bold;letter-spacing:1px;margin:0 0 4px">FINN’S BARBER</p>
  <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a6c55;margin:0 0 24px">Creil · Since 1999</p>
  ${body}
  <p style="font-size:13px;color:#555;margin-top:28px;border-top:1px solid #C3B59B;padding-top:16px">${esc(fullAddress)}</p>
  </div></div>`;

const notifyTo = () => process.env.SALON_NOTIFY_EMAIL || salon.email;
const manageUrl = (token: string) => `${salon.siteUrl}/rdv/${token}`;

export async function mailBooked(a: Appointment, token: string) {
  const when = fmtWhen(a.start);
  if (a.client.email) await send(a.client.email, `Rendez-vous confirmé — ${when}`, layout(`
    <p style="font-size:18px;margin:0 0 16px">Bonjour ${esc(a.client.firstName)},</p>
    <p style="font-size:15px;line-height:1.6">Votre rendez-vous est confirmé :</p>
    <p style="font-size:17px;line-height:1.6;margin:12px 0"><strong>${esc(a.serviceName)}</strong> — ${esc(when)}${a.barber ? " avec " + esc(a.barber.name) : ""}<br>${a.minutes} min · ${(a.priceCents / 100).toFixed(0)} €</p>
    <p style="font-size:15px;line-height:1.6">Merci d’arriver quelques minutes en avance.</p>
    <p style="margin:24px 0"><a href="${manageUrl(token)}" style="background:#071B2E;color:#F4EEDF;padding:12px 18px;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase">Gérer mon rendez-vous</a></p>`));
  await send(notifyTo(), `Nouveau RDV — ${a.client.firstName} ${a.client.lastName}, ${when}`, layout(`
    <p style="font-size:16px;line-height:1.6"><strong>${esc(a.serviceName)}</strong> — ${esc(when)}${a.barber ? " · " + esc(a.barber.name) : ""}</p>
    <p style="font-size:15px;line-height:1.6">${esc(a.client.firstName)} ${esc(a.client.lastName)}<br>${esc(fmtPhone(a.client.phone))}${a.client.email ? "<br>" + esc(a.client.email) : ""}</p>
    ${a.note ? `<p style="font-size:14px;line-height:1.6;color:#555">Note : ${esc(a.note)}</p>` : ""}`));
}

export async function mailCancelled(a: Appointment) {
  await send(notifyTo(), `RDV annulé — ${a.client.firstName} ${a.client.lastName}, ${fmtWhen(a.start)}`, layout(`
    <p style="font-size:16px;line-height:1.6">Le client a annulé en ligne :</p>
    <p style="font-size:15px;line-height:1.6"><strong>${esc(a.serviceName)}</strong> — ${esc(fmtWhen(a.start))}<br>${esc(a.client.firstName)} ${esc(a.client.lastName)} · ${esc(fmtPhone(a.client.phone))}</p>`));
}

export async function mailContact(m: { name: string; phone: string; email: string; body: string }) {
  await send(notifyTo(), `Message du site — ${m.name}`, layout(`
    <p style="font-size:16px;line-height:1.6"><strong>${esc(m.name)}</strong>${m.phone ? "<br>" + esc(fmtPhone(m.phone)) : ""}${m.email ? "<br>" + esc(m.email) : ""}</p>
    <p style="font-size:15px;line-height:1.7;white-space:pre-wrap">${esc(m.body)}</p>
    <p style="font-size:13px;color:#555">Retrouvez tous les messages dans le tableau de bord, onglet Messages.</p>`));
}
