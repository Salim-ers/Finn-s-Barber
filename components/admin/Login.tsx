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
    <main className="dsh-login">
      <form className="dsh-login-card" onSubmit={submit}>
        <p className="dsh-brand">Finn’s<span>Barber · Creil</span></p>
        <h1 className="dsh-title">Tableau de bord</h1>
        {configured ? (
          <>
            <label className="dsh-lbl" htmlFor="pw">Mot de passe du salon</label>
            <input id="pw" className="dsh-input" type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
            {err && <p className="dsh-err" role="alert">{err}</p>}
            <button className="btn dsh-full" type="submit" disabled={busy || !pw}>{busy ? "Connexion…" : "Se connecter"}</button>
            {localDefault && <p className="dsh-hint">En local, le mot de passe par défaut est « finns ». En ligne, définissez ADMIN_PASSWORD dans Vercel.</p>}
          </>
        ) : (
          <p className="dsh-hint">Le tableau de bord n’est pas encore activé : définissez la variable ADMIN_PASSWORD dans les réglages Vercel, puis redéployez.</p>
        )}
      </form>
    </main>
  );
}
