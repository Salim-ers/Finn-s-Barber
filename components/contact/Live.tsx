"use client";

import { useEffect, useState } from "react";
import { DAYS, fmtH, hoursOf, openStatus, parisNow } from "@/lib/site";

/* Statut « ouvert / fermé » calculé à l’heure de Paris, côté visiteur. */
export function OpenStatus() {
  const [st, setSt] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => { const u = () => setSt(openStatus()); u(); const t = setInterval(u, 60000); return () => clearInterval(t); }, []);
  return <p className={`status ${st?.open ? "is-open" : ""}`} aria-live="polite"><i aria-hidden="true" />{st ? st.text : "\u00a0"}</p>;
}

export function Hours() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(parisNow().day), []);
  return (
    <ul className="hours">
      {DAYS.map(([k, l]) => (
        <li key={k} className={k === today ? "today" : ""}>
          <span>{l}{k === today && <em>Aujourd’hui</em>}</span><span>{fmtH(hoursOf(k))}</span>
        </li>
      ))}
    </ul>
  );
}
