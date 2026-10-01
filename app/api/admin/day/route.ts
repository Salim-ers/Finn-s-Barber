import { fail, handle, json } from "@/lib/api";
import { dayView, today } from "@/lib/booking/repo";
import { isDate } from "@/lib/booking/time";

export const dynamic = "force-dynamic";

/** GET ?date=AAAA-MM-JJ — rendez-vous, blocages et semaine à venir. */
export function GET(req: Request) {
  return handle(async () => {
    const date = new URL(req.url).searchParams.get("date") || today();
    if (!isDate(date)) return fail("date");
    return json(await dayView(date));
  }, { admin: true });
}
