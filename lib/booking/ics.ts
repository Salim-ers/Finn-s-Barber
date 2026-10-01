import { salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";

/** Fichier .ics (Google Agenda, Apple Calendrier, Outlook) sous forme de lien téléchargeable. */
export function icsHref(o: { uid: string; start: number; end: number; title: string }) {
  const f = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Finns Barber//Rendez-vous//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${o.uid}@finns-barber`, `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(o.start)}`, `DTEND:${f(o.end)}`,
    `SUMMARY:${esc(o.title)}`, `LOCATION:${esc(`${salon.name}, ${fullAddress}`)}`, "END:VEVENT", "END:VCALENDAR"
  ];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}
