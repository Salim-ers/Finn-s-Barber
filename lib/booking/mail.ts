/* =========================================================
   E-MAILS — confirmation et rappel au client, copie au salon
   Deux façons d’envoyer (variables d’environnement Vercel) :
   • SMTP, par exemple un compte Gmail du salon avec un « mot de passe d’application » :
       SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=…@gmail.com  SMTP_PASS=…
   • Resend (nécessite un nom de domaine vérifié) : RESEND_API_KEY + MAIL_FROM
   MAIL_FROM (facultatif avec SMTP) : « Finn’s Barber <adresse> ».
   SALON_NOTIFY_EMAIL (ou salon.email) reçoit une copie de chaque réservation, annulation et message.
   En local, sans configuration, les e-mails sont enregistrés dans .data/mails pour les prévisualiser.
   ========================================================= */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { booking, salon } from "@/lib/data";
import { fullAddress, mapsUrl } from "@/lib/site";
import { icsText } from "./ics";
import type { Appointment } from "./repo";
import { fmtWhen, hhmm, parisOf } from "./time";
import { fmtPhone } from "./validate";

type Attachment = { filename: string; content: string; contentType: string };
type Mail = { to: string; subject: string; html: string; text: string; attachments?: Attachment[] };

const env = process.env;
const smtpOn = () => !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
const resendOn = () => !!(env.RESEND_API_KEY && env.MAIL_FROM);
/** Un moyen d’envoi est-il configuré ? */
export const mailEnabled = () => smtpOn() || resendOn();
const from = () => env.MAIL_FROM || `${salon.name} <${env.SMTP_USER}>`;
const replyTo = () => env.SALON_NOTIFY_EMAIL || salon.email || undefined;
const notifyTo = () => env.SALON_NOTIFY_EMAIL || salon.email;

/** Envoie un e-mail ; renvoie true s’il est parti (jamais d’exception). */
async function send(m: Mail): Promise<boolean> {
  if (!m.to) return false;
  try {
    if (smtpOn()) {
      const nodemailer = await import("nodemailer");
      const port = Number(env.SMTP_PORT || 465);
      const t = nodemailer.createTransport({ host: env.SMTP_HOST, port, secure: port === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } });
      await t.sendMail({ from: from(), replyTo: replyTo(), to: m.to, subject: m.subject, html: m.html, text: m.text, attachments: m.attachments });
      return true;
    }
    if (resendOn()) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.MAIL_FROM, reply_to: replyTo(), to: m.to, subject: m.subject, html: m.html, text: m.text,
          attachments: m.attachments?.map(a => ({ filename: a.filename, content: Buffer.from(a.content).toString("base64") })) })
      });
      if (!r.ok) { console.error("Resend", r.status, await r.text()); return false; }
      return true;
    }
    if (!env.VERCEL) { // aperçu en local
      const dir = path.join(process.cwd(), ".data", "mails");
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.join(dir, `${Date.now()}-${m.to.replace(/[^\w.@-]/g, "_")}.html`), m.html);
    }
    return false;
  } catch (e) { console.error("E-mail", e); return false; }
}

/** Envoi borné dans le temps, pour ne pas faire attendre le client. */
export const sendWithin = (p: Promise<boolean>, ms = 6000) => Promise.race([p, new Promise<boolean>(r => setTimeout(() => r(false), ms))]);

/* ---------- Mise en page (compatible avec les messageries : tableaux, styles en ligne) ---------- */
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const C = { navy: "#071B2E", cream: "#F4EEDF", warm: "#FBF8F0", champ: "#B7A58A", muted: "#6b6253" };
const btn = (href: string, label: string, solid = true) =>
  `<a href="${href}" style="display:inline-block;margin:0 8px 10px 0;padding:14px 20px;font:600 12px/1 Helvetica,Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;border:1px solid ${C.navy};${solid ? `background:${C.navy};color:${C.cream}` : `background:transparent;color:${C.navy}`}">${label}</a>`;
const row = (k: string, v: string) =>
  `<tr><td style="padding:12px 0;border-bottom:1px solid #e3dccb;font:14px Helvetica,Arial,sans-serif;color:${C.muted};width:110px;vertical-align:top">${k}</td><td style="padding:12px 0;border-bottom:1px solid #e3dccb;font:15px Helvetica,Arial,sans-serif;color:${C.navy}">${v}</td></tr>`;

function layout(o: { preheader: string; kicker: string; title: string; intro: string; body: string }) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(o.title)}</title></head>
<body style="margin:0;padding:0;background:${C.cream}">
<div style="display:none;max-height:0;overflow:hidden">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:28px 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.warm};border:1px solid #d9cfb9">
    <tr><td style="background:${C.navy};padding:22px 28px">
      <p style="margin:0;font:700 26px Georgia,'Times New Roman',serif;letter-spacing:1px;color:${C.cream}">FINN’S BARBER</p>
      <p style="margin:6px 0 0;font:11px Helvetica,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:#C3B59B">Creil · Since 1999</p>
    </td></tr>
    <tr><td style="padding:30px 28px 8px">
      <p style="margin:0 0 10px;font:600 11px Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${C.champ}">${o.kicker}</p>
      <p style="margin:0 0 14px;font:700 30px/1.1 Georgia,'Times New Roman',serif;color:${C.navy}">${o.title}</p>
      <p style="margin:0 0 18px;font:16px/1.55 Helvetica,Arial,sans-serif;color:${C.navy}">${o.intro}</p>
      ${o.body}
    </td></tr>
    <tr><td style="padding:18px 28px 26px;border-top:1px solid #e3dccb">
      <p style="margin:0;font:13px/1.6 Helvetica,Arial,sans-serif;color:${C.muted}">${esc(salon.name)} · ${esc(fullAddress)}<br><a href="${salon.siteUrl}" style="color:${C.muted}">${salon.siteUrl.replace(/^https?:\/\//, "")}</a></p>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

const manageUrl = (token: string) => `${salon.siteUrl}/rdv/${token}`;
const price = (a: Appointment) => `${(a.priceCents / 100).toFixed(0)} €`;
const ics = (a: Appointment, token: string, cancel = false): Attachment => ({
  filename: cancel ? "finns-barber-annulation.ics" : "finns-barber-rendez-vous.ics",
  content: icsText({ uid: token, start: a.start, end: a.end, title: `${a.serviceName} — ${salon.name}`, cancel }),
  contentType: `text/calendar; charset=utf-8; method=${cancel ? "CANCEL" : "PUBLISH"}`
});

/** Récapitulatif du rendez-vous (confirmation et rappel). */
const recap = (a: Appointment, when: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.navy};margin:0 0 22px">
          ${row("Prestation", `<strong>${esc(a.serviceName)}</strong> · ${a.minutes} min`)}
          ${row("Quand", esc(when.charAt(0).toUpperCase() + when.slice(1)))}
          ${a.barber ? row("Coiffeur", esc(a.barber.name)) : ""}
          ${row("Tarif", `${price(a)}, réglé au salon`)}
          ${row("Adresse", esc(fullAddress))}
        </table>`;

/* ---------- Réservation ---------- */
export function mailClientBooked(a: Appointment, token: string) {
  const when = fmtWhen(a.start), who = a.barber ? ` avec ${a.barber.name}` : "";
  return send({
    to: a.client.email,
    subject: `Rendez-vous confirmé — ${when}`,
    html: layout({
      preheader: `${a.serviceName}, ${when}${who}. ${fullAddress}.`,
      kicker: "Rendez-vous confirmé",
      title: "C’est réservé.",
      intro: `Bonjour ${esc(a.client.firstName)}, votre rendez-vous est confirmé. À très vite au salon.`,
      body: `${recap(a, when)}
        ${btn(manageUrl(token), "Gérer ou annuler")}${btn(mapsUrl, "Itinéraire", false)}
        <p style="margin:14px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:${C.muted}">Le rendez-vous est joint à cet e-mail : ouvrez la pièce jointe pour l’ajouter à votre agenda. Annulation possible en ligne jusqu’à 2 h avant. Merci d’arriver quelques minutes en avance.</p>`
    }),
    text: `Bonjour ${a.client.firstName},\n\nVotre rendez-vous est confirmé :\n${a.serviceName} (${a.minutes} min, ${price(a)})\n${when}${who}\n${fullAddress}\n\nGérer ou annuler : ${manageUrl(token)}\nItinéraire : ${mapsUrl}\n\n${salon.name}`,
    attachments: [ics(a, token)]
  });
}

export function mailSalonBooked(a: Appointment) {
  const when = fmtWhen(a.start);
  return send({
    to: notifyTo(),
    subject: `Nouveau RDV — ${a.client.firstName} ${a.client.lastName}, ${when}${a.barber ? ` · ${a.barber.name}` : ""}`,
    html: layout({
      preheader: `${a.serviceName}, ${when}`, kicker: "Nouvelle réservation", title: `${esc(a.client.firstName)} ${esc(a.client.lastName)}`,
      intro: `${esc(a.serviceName)}, ${esc(when)}${a.barber ? ` avec ${esc(a.barber.name)}` : ""}.`,
      body: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.navy}">
          ${row("Téléphone", esc(fmtPhone(a.client.phone)))}${a.client.email ? row("E-mail", esc(a.client.email)) : ""}${a.note ? row("Note", esc(a.note)) : ""}
        </table>`
    }),
    text: `${a.client.firstName} ${a.client.lastName} — ${a.serviceName}, ${when}${a.barber ? ` avec ${a.barber.name}` : ""}\n${fmtPhone(a.client.phone)} ${a.client.email}\n${a.note}`
  });
}

/* ---------- Rappel la veille ---------- */
export function mailClientReminder(a: Appointment, token: string) {
  const when = fmtWhen(a.start), at = hhmm(parisOf(a.start).min), who = a.barber ? ` avec ${a.barber.name}` : "";
  return send({
    to: a.client.email,
    subject: `Rappel : votre rendez-vous demain à ${at}`,
    html: layout({
      preheader: `${a.serviceName}, demain à ${at}${who}. ${fullAddress}.`,
      kicker: "Rappel",
      title: "À demain.",
      intro: `Bonjour ${esc(a.client.firstName)}, petit rappel : votre rendez-vous chez ${esc(salon.name)} est demain à ${at}.`,
      body: `${recap(a, when)}
        ${btn(manageUrl(token), "Gérer ou annuler")}${btn(mapsUrl, "Itinéraire", false)}
        <p style="margin:14px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:${C.muted}">Un empêchement ? Annulez en ligne jusqu’à ${booking.cancelUntilHours} h avant pour libérer le créneau. Merci d’arriver quelques minutes en avance.</p>`
    }),
    text: `Bonjour ${a.client.firstName},\n\nPetit rappel : votre rendez-vous est demain à ${at}.\n${a.serviceName} (${a.minutes} min, ${price(a)})${who}\n${fullAddress}\n\nUn empêchement ? Annulez en ligne jusqu’à ${booking.cancelUntilHours} h avant : ${manageUrl(token)}\nItinéraire : ${mapsUrl}\n\n${salon.name}`
  });
}

/* ---------- Annulation ---------- */
export function mailClientCancelled(a: Appointment, token: string) {
  const when = fmtWhen(a.start);
  return send({
    to: a.client.email,
    subject: `Rendez-vous annulé — ${when}`,
    html: layout({
      preheader: `Votre rendez-vous du ${when} est annulé.`, kicker: "Annulation confirmée", title: "Rendez-vous annulé.",
      intro: `Bonjour ${esc(a.client.firstName)}, votre rendez-vous « ${esc(a.serviceName)} » du ${esc(when)} est bien annulé.`,
      body: `${btn(`${salon.siteUrl}/reserver`, "Reprendre un rendez-vous")}`
    }),
    text: `Bonjour ${a.client.firstName},\n\nVotre rendez-vous « ${a.serviceName} » du ${when} est bien annulé.\nReprendre un rendez-vous : ${salon.siteUrl}/reserver\n\n${salon.name}`,
    attachments: [ics(a, token, true)]
  });
}

export function mailSalonCancelled(a: Appointment) {
  const when = fmtWhen(a.start);
  return send({
    to: notifyTo(),
    subject: `RDV annulé — ${a.client.firstName} ${a.client.lastName}, ${when}`,
    html: layout({ preheader: `Annulation : ${when}`, kicker: "Annulation en ligne", title: `${esc(a.client.firstName)} ${esc(a.client.lastName)}`,
      intro: `${esc(a.serviceName)}, ${esc(when)}${a.barber ? ` avec ${esc(a.barber.name)}` : ""} — annulé par le client.`, body: "" }),
    text: `${a.client.firstName} ${a.client.lastName} a annulé : ${a.serviceName}, ${when}`
  });
}

/* ---------- Formulaire de contact ---------- */
export function mailContact(m: { name: string; phone: string; email: string; body: string }) {
  return send({
    to: notifyTo(),
    subject: `Message du site — ${m.name}`,
    html: layout({ preheader: m.body.slice(0, 90), kicker: "Message du site", title: esc(m.name),
      intro: [m.phone && esc(fmtPhone(m.phone)), m.email && esc(m.email)].filter(Boolean).join(" · "),
      body: `<p style="margin:0;font:15px/1.7 Helvetica,Arial,sans-serif;color:${C.navy};white-space:pre-wrap">${esc(m.body)}</p>` }),
    text: `${m.name} ${m.phone} ${m.email}\n\n${m.body}`
  });
}
