import { body, fail, handle, json } from "@/lib/api";
import { setAppointmentBarber, setNote, setStatus, STATUSES, type Status } from "@/lib/booking/repo";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";
const isId = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/** PATCH { status?, note?, barberId? } — pointage (venu, absent), annulation, note interne, changement de coiffeur. */
export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!isId(id)) return fail("id", 404);
    const b = await body(req);
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status as Status)) return fail("status");
      if (!(await setStatus(id, b.status as Status))) return fail("notfound", 404);
    }
    if (b.note !== undefined && !(await setNote(id, v.note(b.note)))) return fail("notfound", 404);
    if (b.barberId !== undefined) {
      const bid = b.barberId === null || b.barberId === "" ? null : String(b.barberId);
      if (bid && !isId(bid)) return fail("barber");
      if (!(await setAppointmentBarber(id, bid))) return fail("notfound", 404);
    }
    return json({ ok: true });
  }, { admin: true });
}
