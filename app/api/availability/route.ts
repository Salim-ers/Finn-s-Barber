import { fail, handle, json } from "@/lib/api";
import { availability } from "@/lib/booking/repo";
import { serviceById } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

/** GET /api/availability?service=coupe&barber=<id>|any → coiffeurs et créneaux libres jour par jour. */
export function GET(req: Request) {
  return handle(async () => {
    const q = new URL(req.url).searchParams;
    const id = q.get("service");
    if (!serviceById(id)) return fail("service");
    const r = await availability(id!, q.get("barber") || "any");
    return r ? json(r) : fail("barber");
  });
}
