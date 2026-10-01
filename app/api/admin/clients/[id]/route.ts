import { body, fail, handle, json } from "@/lib/api";
import { clientHistory, setClientNotes } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";
const isId = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/** GET — historique des rendez-vous d’un client. */
export function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!isId(id)) return fail("id", 404);
    return json({ history: await clientHistory(id) });
  }, { admin: true });
}

/** PATCH { notes } — fiche client (préférences, coupe habituelle…). */
export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!isId(id)) return fail("id", 404);
    const { notes } = await body(req);
    const text = typeof notes === "string" ? notes.trim().slice(0, 1000) : "";
    if (!(await setClientNotes(id, text))) return fail("notfound", 404);
    return json({ ok: true });
  }, { admin: true });
}
