import { after } from "next/server";
import { body, fail, handle, json } from "@/lib/api";
import { mailClientCancelled, mailSalonCancelled } from "@/lib/booking/mail";
import { cancelByToken } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** POST /api/bookings/cancel { token } — annulation par le client via son lien personnel. */
export function POST(req: Request) {
  return handle(async () => {
    const { token } = await body(req);
    const t = String(token ?? "");
    const r = await cancelByToken(t);
    if (!r.ok) return fail(r.reason, r.reason === "notfound" ? 404 : 409);
    after(async () => { await mailClientCancelled(r.appt, t); await mailSalonCancelled(r.appt); });
    return json({ ok: true });
  });
}
