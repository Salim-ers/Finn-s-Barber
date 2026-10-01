import { body, fail, handle, json } from "@/lib/api";
import { createAppointment } from "@/lib/booking/repo";
import { isDate, toMin } from "@/lib/booking/time";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";

/** POST — rendez-vous saisi par le salon (téléphone, comptoir). */
export function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    const input = {
      serviceId: String(b.serviceId ?? ""), date: String(b.date ?? ""), time: String(b.time ?? ""),
      firstName: v.name(b.firstName), lastName: v.name(b.lastName) || "-", phone: v.phone(b.phone),
      email: b.email ? v.email(b.email) : "", note: v.note(b.note)
    };
    const bad = [!input.firstName && "firstName", !input.phone && "phone", !isDate(input.date) && "date", isNaN(toMin(input.time)) && "time"].filter(Boolean);
    if (bad.length) return json({ error: "invalid", fields: bad }, 400);
    const r = await createAppointment(input, { source: "salon", force: b.force === true });
    if (!r.ok) return fail(r.reason, 409);
    return json({ ok: true, id: r.id });
  }, { admin: true });
}
