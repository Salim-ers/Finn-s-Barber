/* Dates et heures du salon : tout est raisonné à l’heure de Paris (changements d’heure compris). */
export const TZ = "Europe/Paris";

const dtf = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

function parts(ms: number) {
  const p = Object.fromEntries(dtf.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}
function offsetMs(ms: number) {
  const p = parts(ms);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - (ms - (ms % 1000));
}

export const pad = (n: number) => String(n).padStart(2, "0");
export const hhmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const toMin = (s: string) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s); return m ? +m[1] * 60 + +m[2] : NaN; };
export const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + "T00:00:00Z"));

/** Instant correspondant à une date (AAAA-MM-JJ) et à des minutes depuis minuit, heure de Paris. */
export function parisToDate(date: string, minutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const t = guess - offsetMs(guess);
  return new Date(guess - offsetMs(t));
}

/** Date (AAAA-MM-JJ) et minutes depuis minuit à Paris pour un instant donné. */
export function parisOf(at: Date | number) {
  const p = parts(+at);
  return { date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, min: p.h * 60 + p.mi };
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

const KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
export type DayKey = (typeof KEYS)[number];
export function dayKey(date: string): DayKey {
  const [y, m, d] = date.split("-").map(Number);
  return KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

const noonUtc = (date: string) => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
/** « mardi 2 octobre » */
export const fmtDay = (date: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) =>
  noonUtc(date).toLocaleDateString("fr-FR", { ...opts, timeZone: "UTC" });
/** « mardi 2 octobre à 10:15 » */
export function fmtWhen(at: Date | number) {
  const { date, min } = parisOf(at);
  return `${fmtDay(date)} à ${hhmm(min)}`;
}
