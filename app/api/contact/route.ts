import { after } from "next/server";
import { body, fail, handle, json } from "@/lib/api";
import { ipHash } from "@/lib/auth";
import { mailContact } from "@/lib/booking/mail";
import { addMessage } from "@/lib/booking/repo";
import * as v from "@/lib/booking/validate";

export const dynamic = "force-dynamic";

/** POST /api/contact — message envoyé depuis la page Contact. */
export function POST(req: Request) {
  return handle(async () => {
    const b = await body(req);
    if (b.website) return json({ ok: true }); // champ piège anti-robots
    const m = {
      name: v.name(b.name),
      phone: b.phone ? v.phone(b.phone) : "",
      email: b.email ? v.email(b.email) : "",
      body: typeof b.message === "string" ? b.message.trim().slice(0, 2000) : ""
    };
    const bad = [
      !m.name && "name", b.phone && !m.phone && "phone", b.email && !m.email && "email",
      !m.phone && !m.email && !b.phone && !b.email && "reach", m.body.length < 5 && "message"
    ].filter(Boolean);
    if (bad.length) return json({ error: "invalid", fields: bad }, 400);
    const r = await addMessage({ ...m, ipHash: ipHash(req) });
    if (!r.ok) return fail("rate", 429);
    after(() => mailContact(m));
    return json({ ok: true });
  });
}
