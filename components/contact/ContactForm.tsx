"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type F = { name: string; phone: string; email: string; message: string; website: string };
const ERR: Record<string, string> = {
  name: "Indiquez votre nom.",
  phone: "Ce numéro n’est pas valide.",
  email: "Cette adresse e-mail n’est pas valide.",
  reach: "Laissez un téléphone ou un e-mail pour qu’on puisse vous répondre.",
  message: "Écrivez votre message."
};

/* Formulaire de contact : le message arrive dans le tableau de bord du salon (onglet Messages). */
export default function ContactForm() {
  const [f, setF] = useState<F>({ name: "", phone: "", email: "", message: "", website: "" });
  const [errs, setErrs] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "rate">("idle");
  const set = (k: keyof F) => (e: { target: { value: string } }) => { setF(x => ({ ...x, [k]: e.target.value })); setErrs(x => x.filter(y => y !== k && !(y === "reach" && (k === "phone" || k === "email")))); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const local = [!f.name.trim() && "name", !f.phone.trim() && !f.email.trim() && "reach", f.message.trim().length < 5 && "message"].filter(Boolean) as string[];
    if (local.length) { setErrs(local); return; }
    setState("sending");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setState("sent"); return; }
      if (j.error === "invalid") { setErrs(j.fields || []); setState("idle"); return; }
      setState(j.error === "rate" ? "rate" : "error");
    } catch { setState("error"); }
  }

  if (state === "sent") {
    return (
      <div className="cf-done" role="status">
        <p className="label tick">Message envoyé</p>
        <p className="lead">Merci {f.name.split(" ")[0]}, le salon vous répond rapidement.</p>
        <p className="body">Pour un rendez-vous, le plus rapide reste la <Link className="ul" href="/reserver">réservation en ligne</Link>.</p>
      </div>
    );
  }

  const field = (k: keyof F, label: string, type = "text", auto?: string) => (
    <div className={`bk-field ${errs.includes(k) || (errs.includes("reach") && (k === "phone" || k === "email")) ? "is-err" : ""}`}>
      <label htmlFor={`cf-${k}`}>{label}</label>
      <input id={`cf-${k}`} type={type} value={f[k]} onChange={set(k)} autoComplete={auto} aria-invalid={errs.includes(k) || undefined} />
      {errs.includes(k) && <p className="bk-err">{ERR[k]}</p>}
    </div>
  );

  return (
    <form className="cf" onSubmit={submit} noValidate>
      <div className="bk-fields">
        {field("name", "Nom", "text", "name")}
        <div className="cf-reach">
          {field("phone", "Téléphone", "tel", "tel")}
          {field("email", "E-mail", "email", "email")}
        </div>
        {errs.includes("reach") && <p className="bk-err bk-field--wide">{ERR.reach}</p>}
        <div className={`bk-field bk-field--wide ${errs.includes("message") ? "is-err" : ""}`}>
          <label htmlFor="cf-message">Message</label>
          <textarea id="cf-message" rows={5} maxLength={2000} value={f.message} onChange={set("message")} placeholder="Une question sur une coupe, un tarif, un horaire…" />
          {errs.includes("message") && <p className="bk-err">{ERR.message}</p>}
        </div>
        <div className="bk-hp" aria-hidden="true"><label htmlFor="cf-website">Site web</label><input id="cf-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} /></div>
      </div>
      {(state === "error" || state === "rate") && <p className="bk-msg" role="alert">{state === "rate" ? "Trop de messages envoyés depuis cette connexion. Réessayez plus tard." : "L’envoi a échoué. Réessayez dans un instant."}</p>}
      <div className="cf-foot">
        <button className="btn btn--lg" type="submit" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Envoyer le message"}</button>
        <p className="bk-fine">Vos coordonnées servent uniquement à vous répondre. <Link className="ul" href="/politique-confidentialite">Confidentialité</Link></p>
      </div>
    </form>
  );
}
