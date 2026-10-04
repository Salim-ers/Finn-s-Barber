import { body, fail, handle, json } from "@/lib/api";
import { addAbsence } from "@/lib/booking/repo";
import { addDays, isDate, parisToDate, toMin } from "@/lib/booking/time";

export const dynamic = "force-dynamic";

/** POST { barberId, from, to, fromTime?, toTime?, reason } — absence d’un coiffeur.
    Sans heures : journées entières du « from » au « to » inclus. Avec heures : sur la seule journée « from ». */
export function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const barberId = String(b.barberId ?? ""), from = String(b.from ?? ""), to = String(b.to || b.from || "");
    if (!/^[0-9a-f-]{36}$/i.test(barberId) || !isDate(from) || !isDate(to) || to < from) return fail("invalid");
    const reason = typeof b.reason === "string" ? b.reason.trim().slice(0, 80) : "";
    let start: number, end: number;
    if (b.fromTime && b.toTime) {
      const a = toMin(String(b.fromTime)), z = toMin(String(b.toTime));
      if (isNaN(a) || isNaN(z) || z <= a) return fail("invalid");
      start = +parisToDate(from, a); end = +parisToDate(from, z);
    } else {
      start = +parisToDate(from, 0); end = +parisToDate(addDays(to, 1), 0);
    }
    await addAbsence(barberId, start, end, reason);
    return json({ ok: true });
  }, { admin: true });
}
