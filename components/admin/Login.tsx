"use client";

import { useState, type FormEvent } from "react";

export default function Login({ configured, localDefault }: { configured: boolean; localDefault: boolean }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (r.ok) { window.location.reload(); return; }
      setErr(r.status === 401 ? "Mot de passe incorrect." : "Connexion impossible pour le moment.");
    } catch { setErr("La connexion a échoué."); }
    setBusy(false);
  }

  return (
    <main className="ad-login">
      <form className="ad-login-card" onSubmit={submit}>
        <p className="ad-brand">Finn’s<span>Barber · Creil</span></p>
        <h1 className="ad-title">Tableau de bord</h1>
        {configured ? (
          <>
            <label className="ad-lbl" htmlFor="pw">Mot de passe du salon</label>
            <input id="pw" className="ad-input" type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
            {err && <p className="ad-err" role="alert">{err}</p>}
            <button className="btn ad-full" type="submit" disabled={busy || !pw}>{busy ? "Connexion…" : "Se connecter"}</button>
            {localDefault && <p className="ad-hint">En local, le mot de passe par défaut est « finns ». En ligne, définissez ADMIN_PASSWORD dans Vercel.</p>}
          </>
        ) : (
          <p className="ad-hint">Le tableau de bord n’est pas encore activé : définissez la variable ADMIN_PASSWORD dans les réglages Vercel, puis redéployez.</p>
        )}
      </form>
    </main>
  );
}
