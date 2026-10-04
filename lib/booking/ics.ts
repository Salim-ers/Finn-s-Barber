import { salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";

type Ev = { uid: string; start: number; end: number; title: string; cancel?: boolean };

/** Événement d’agenda (.ics) : Google Agenda, Apple Calendrier, Outlook. */
export function icsText(o: Ev) {
  const f = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Finns Barber//Rendez-vous//FR", "CALSCALE:GREGORIAN", `METHOD:${o.cancel ? "CANCEL" : "PUBLISH"}`, "BEGIN:VEVENT",
    `UID:${o.uid}@finns-barber`, `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(o.start)}`, `DTEND:${f(o.end)}`,
    `SUMMARY:${esc(o.title)}`, `LOCATION:${esc(`${salon.name}, ${fullAddress}`)}`, `STATUS:${o.cancel ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
}

/** Même événement, sous forme de lien téléchargeable. */
export const icsHref = (o: Ev) => "data:text/calendar;charset=utf-8," + encodeURIComponent(icsText(o));
