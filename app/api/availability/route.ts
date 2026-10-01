import { fail, handle, json } from "@/lib/api";
import { availability } from "@/lib/booking/repo";
import { serviceById } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";

/** GET /api/availability?service=coupe → créneaux libres jour par jour. */
export function GET(req: Request) {
  return handle(async () => {
    const id = new URL(req.url).searchParams.get("service");
    if (!serviceById(id)) return fail("service");
    return json({ days: await availability(id!) });
  });
}
