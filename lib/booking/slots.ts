import { booking, salon, services } from "@/lib/data";
import { parseH } from "@/lib/site";
import { dayKey, hhmm, parisToDate } from "./time";

/** Intervalle occupé, en millisecondes. */
export type Span = { start: number; end: number };

export const serviceById = (id: unknown) => services.find(s => s.id === id);
export const openingOf = (date: string) => parseH(salon.openingHours[dayKey(date)]);

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

/** Heures de début libres pour une prestation donnée, un jour donné. */
export function daySlots(o: { date: string; minutes: number; busy: Span[]; blocks: Span[]; capacity: number; notBefore: number }): string[] {
  const h = openingOf(o.date);
  if (!h || o.capacity < 1) return [];
  const out: string[] = [];
  for (let m = h.o; m + o.minutes <= h.c; m += booking.slotStep) {
    const s = +parisToDate(o.date, m), e = s + o.minutes * 60000;
    if (s < o.notBefore) continue;
    if (o.blocks.some(b => b.start < e && b.end > s)) continue;
    if (maxOverlap(o.busy, s, e) >= o.capacity) continue;
    out.push(hhmm(m));
  }
  return out;
}
