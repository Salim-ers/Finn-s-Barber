import { booking, salon, services } from "@/lib/data";
import { parseH } from "@/lib/site";
import { dayKey, hhmm, parisToDate, toMin } from "./time";

/** Intervalle occupé, en millisecondes. */
export type Span = { start: number; end: number };
/** Horaires d’un coiffeur : [début, fin] par jour (clé anglaise), ou null s’il ne travaille pas. */
export type Schedule = Partial<Record<string, [string, string] | null>>;
/** Disponibilité d’un coiffeur sur une journée. */
export type BarberDay = { id: string; window: Span | null; off: Span[]; busy: Span[] };

export const serviceById = (id: unknown) => services.find(s => s.id === id);
export const openingOf = (date: string) => parseH(salon.openingHours[dayKey(date)]);
const overlaps = (list: Span[], s: number, e: number) => list.some(b => b.start < e && b.end > s);

/** Nombre maximal de rendez-vous simultanés pendant [s, e). */
export function maxOverlap(busy: Span[], s: number, e: number) {
  const points = [s, ...busy.filter(b => b.start > s && b.start < e).map(b => b.start)];
  let max = 0;
  for (const p of points) {
    let n = 0;
    for (const b of busy) if (b.start <= p && b.end > p) n++;
    if (n > max) max = n;
  }
  return max;
}

/** Plage de travail d’un coiffeur un jour donné (bornée par les horaires du salon). */
export function workWindow(schedule: Schedule, date: string): Span | null {
  const day = schedule[dayKey(date)], open = openingOf(date);
  if (!day || !open) return null;
  const from = Math.max(toMin(day[0]), open.o), to = Math.min(toMin(day[1]), open.c);
  return to > from ? { start: +parisToDate(date, from), end: +parisToDate(date, to) } : null;
}

/** Coiffeurs libres sur [s, e). */
export function freeBarbers(barbers: BarberDay[], s: number, e: number) {
  return barbers.filter(b => b.window && s >= b.window.start && e <= b.window.end && !overlaps(b.off, s, e) && !overlaps(b.busy, s, e));
}

/** Heures de début libres d’une prestation, un jour donné, pour un coiffeur précis ou sans préférence.
    Les rendez-vous sans coiffeur attribué (anciens ou saisis sans choix) occupent un fauteuil quelconque. */
export function daySlots(o: { date: string; minutes: number; barbers: BarberDay[]; unassigned: Span[]; blocks: Span[]; notBefore: number; barberId?: string }): string[] {
  const h = openingOf(o.date);
  if (!h) return [];
  const out: string[] = [];
  for (let m = h.o; m + o.minutes <= h.c; m += booking.slotStep) {
    const s = +parisToDate(o.date, m), e = s + o.minutes * 60000;
    if (s < o.notBefore || overlaps(o.blocks, s, e)) continue;
    const free = freeBarbers(o.barbers, s, e);
    if (free.length - maxOverlap(o.unassigned, s, e) < 1) continue;
    if (o.barberId && !free.some(b => b.id === o.barberId)) continue;
    out.push(hhmm(m));
  }
  return out;
}
