import { salon, type Article } from "./data";

export const A = salon.address;
export const fullAddress = `${A.street}, ${A.postalCode} ${A.city}`;
export const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(`Finn's Barber, ${fullAddress}`);
export const mapsEmbedUrl = "https://maps.google.com/maps?q=" + encodeURIComponent(fullAddress) + "&z=17&hl=fr&output=embed";
export const telHref = salon.phone ? "tel:" + salon.phone.replace(/[^\d+]/g, "") : "";
export const pad2 = (n: number) => String(n).padStart(2, "0");

type DayKey = keyof typeof salon.openingHours;
export const DAYS: [DayKey, string][] = [["monday", "Lundi"], ["tuesday", "Mardi"], ["wednesday", "Mercredi"], ["thursday", "Jeudi"], ["friday", "Vendredi"], ["saturday", "Samedi"], ["sunday", "Dimanche"]];
export const hoursOf = (k: string) => salon.openingHours[k as DayKey] || "";
export const fmtH = (v: string) => (v || "").replace(/\s*-\s*/, " — ");

export function groupHours() {
  const g: { from: string; to: string | null; v: string }[] = [];
  DAYS.forEach(([k, l]) => {
    const v = hoursOf(k), last = g[g.length - 1];
    if (last && last.v === v) last.to = l; else g.push({ from: l, to: null, v });
  });
  return g.map(x => ({ days: x.to ? `${x.from} — ${x.to}` : x.from, v: fmtH(x.v) }));
}

export function parseH(v: string) {
  const m = /(\d\d):(\d\d)\s*-\s*(\d\d):(\d\d)/.exec(v || "");
  return m ? { o: +m[1] * 60 + +m[2], c: +m[3] * 60 + +m[4], os: `${m[1]}:${m[2]}`, cs: `${m[3]}:${m[4]}` } : null;
}

export function parisNow() {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { day: String(p.weekday).toLowerCase(), min: (+p.hour % 24) * 60 + +p.minute };
}

export function openStatus() {
  const { day, min } = parisNow();
  const idx = DAYS.findIndex(d => d[0] === day);
  const t = parseH(hoursOf(day));
  if (t && min >= t.o && min < t.c) return { open: true, text: `Ouvert maintenant, jusqu’à ${t.cs}` };
  if (t && min < t.o) return { open: false, text: `Fermé pour le moment. Ouverture aujourd’hui à ${t.os}` };
  for (let i = 1; i <= 7; i++) {
    const [k, l] = DAYS[(idx + i) % 7], h = parseH(hoursOf(k));
    if (h) return { open: false, text: `Fermé pour le moment. Réouverture ${i === 1 ? "demain" : l.toLowerCase()} à ${h.os}` };
  }
  return { open: false, text: "Fermé" };
}

export const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export const readTime = (a: Article) => Math.max(2, Math.round(a.body.map(b => ("p" in b ? b.p : b.h)).join(" ").split(/\s+/).length / 200));

export const NAV: [string, string][] = [["/", "Accueil"], ["/histoire", "Notre histoire"], ["/prestations", "Prestations"], ["/galerie", "Galerie"], ["/avis", "Avis"], ["/conseils", "Conseils"], ["/contact", "Contact"]];
export const MNAV: [string, string][] = [["/", "Accueil"], ["/histoire", "Histoire"], ["/prestations", "Prestations"], ["/galerie", "Galerie"], ["/avis", "Avis"], ["/conseils", "Conseils"], ["/contact", "Contact"]];
