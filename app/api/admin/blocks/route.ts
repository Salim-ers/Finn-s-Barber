import { body, fail, handle, json } from "@/lib/api";
import { addBlock } from "@/lib/booking/repo";
import { isDate, parisToDate, toMin } from "@/lib/booking/time";

export const dynamic = "force-dynamic";

/** POST { date, from, to, reason } — fermeture exceptionnelle ou créneau bloqué. */
export function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const date = String(b.date ?? ""), from = toMin(String(b.from ?? "")), to = toMin(String(b.to ?? ""));
    if (!isDate(date) || isNaN(from) || isNaN(to) || to <= from || to > 24 * 60) return fail("invalid");
    const reason = typeof b.reason === "string" ? b.reason.trim().slice(0, 120) : "";
    await addBlock(+parisToDate(date, from), +parisToDate(date, to), reason);
    return json({ ok: true });
  }, { admin: true });
}
