import { after } from "next/server";
import { body, fail, handle, json } from "@/lib/api";
import { ipHash } from "@/lib/auth";
import { mailClientBooked, mailSalonBooked, sendWithin } from "@/lib/booking/mail";
import { createAppointment, findByToken } from "@/lib/booking/repo";
import { isDate, toMin } from "@/lib/booking/time";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";

/** POST /api/bookings — réservation par un client depuis le site. */
export function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    if (b.website) return json({ ok: true }); // champ piège : les robots le remplissent, pas les humains
    const input = {
      serviceId: String(b.serviceId ?? ""),
      date: String(b.date ?? ""),
      time: String(b.time ?? ""),
      barberId: typeof b.barberId === "string" && /^([0-9a-f-]{36}|any)$/i.test(b.barberId) ? b.barberId : "any",
      firstName: v.name(b.firstName),
      lastName: v.name(b.lastName),
      phone: v.phone(b.phone),
      email: v.email(b.email),
      note: v.note(b.note)
    };
    const bad = [
      !input.firstName && "firstName", !input.lastName && "lastName", !input.phone && "phone",
      !input.email && "email", !isDate(input.date) && "date", isNaN(toMin(input.time)) && "time"
    ].filter(Boolean);
    if (bad.length) return json({ error: "invalid", fields: bad }, 400);

    const r = await createAppointment(input, { source: "site", ipHash: ipHash(req) });
    if (!r.ok) return fail(r.reason, r.reason === "rate" ? 429 : 409);

    // Confirmation au client avant de répondre (pour lui dire qu’elle est partie), copie au salon ensuite
    const appt = await findByToken(r.token);
    const mailed = appt ? await sendWithin(mailClientBooked(appt, r.token)) : false;
    if (appt) after(() => mailSalonBooked(appt));
    return json({ ok: true, token: r.token, start: r.start, end: r.end, barber: r.barber, mailed, email: input.email });
  });
}
