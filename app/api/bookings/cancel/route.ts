import { after } from "next/server";
import { body, fail, handle, json } from "@/lib/api";
import { mailCancelled } from "@/lib/booking/mail";
import { cancelByToken } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** POST /api/bookings/cancel { token } — annulation par le client via son lien personnel. */
export function POST(req: Request) {
  return handle(async () => {
    const { token } = await body(req);
    const r = await cancelByToken(String(token ?? ""));
    if (!r.ok) return fail(r.reason, r.reason === "notfound" ? 404 : 409);
    after(() => mailCancelled(r.appt));
    return json({ ok: true });
  });
}
