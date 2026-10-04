import { body, fail, handle, json } from "@/lib/api";
import { addBarber, listAbsences, listBarbers } from "@/lib/booking/repo";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";

/** GET — équipe (actifs et inactifs) et absences à venir. */
export function GET() {
  return handle(async () => json({ barbers: await listBarbers(), absences: await listAbsences(Date.now()) }), { admin: true });
}

/** POST { name } — nouveau coiffeur (horaires du salon par défaut). */
export function POST(req: Request) {
  return handle(async () => {
    const name = v.name((await body(req)).name);
    if (!name) return fail("name");
    return json({ ok: true, id: await addBarber(name) });
  }, { admin: true });
}
