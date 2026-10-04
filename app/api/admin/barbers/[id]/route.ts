import { body, fail, handle, json } from "@/lib/api";
import { updateBarber } from "@/lib/booking/repo";
import type { Schedule } from "@/lib/booking/slots";
import { toMin } from "@/lib/booking/time";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function schedule(x: unknown): Schedule | null {
  if (!x || typeof x !== "object") return null;
  const out: Schedule = {};
  for (const d of DAYS) {
    const v = (x as Record<string, unknown>)[d];
    if (v === null || v === undefined) { out[d] = null; continue; }
    if (!Array.isArray(v) || v.length !== 2) return null;
    const [a, b] = v.map(String);
    if (isNaN(toMin(a)) || isNaN(toMin(b)) || toMin(b) <= toMin(a)) return null;
    out[d] = [a, b];
  }
  return out;
}

/** PATCH { name?, active?, schedule? } — renommer, activer / désactiver, horaires de la semaine. */
export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("id", 404);
    const b = await body(req);
    const p: { name?: string; active?: boolean; schedule?: Schedule } = {};
    if (b.name !== undefined) { const n = v.name(b.name); if (!n) return fail("name"); p.name = n; }
    if (b.active !== undefined) p.active = b.active === true;
    if (b.schedule !== undefined) { const s = schedule(b.schedule); if (!s) return fail("schedule"); p.schedule = s; }
    if (!(await updateBarber(id, p))) return fail("notfound", 404);
    return json({ ok: true });
  }, { admin: true });
}
