import { body, fail, handle, json } from "@/lib/api";
import { getCapacity, setCapacity } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

export function GET() {
  return handle(async () => json({ capacity: await getCapacity() }), { admin: true });
}

/** PUT { capacity } — nombre de coiffeurs disponibles en même temps (0 = réservation en ligne suspendue). */
export function PUT(req: Request) {
  return handle(async () => {
    const n = Number((await body(req)).capacity);
    if (!Number.isInteger(n) || n < 0 || n > 12) return fail("capacity");
    await setCapacity(n);
    return json({ ok: true, capacity: n });
  }, { admin: true });
}
