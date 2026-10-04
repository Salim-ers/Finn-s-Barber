import { body, fail, handle, json } from "@/lib/api";
import { deleteMessage, setMessageRead } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";
const isId = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/** PATCH { read } — marquer lu / non lu. */
export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!isId(id)) return fail("id", 404);
    if (!(await setMessageRead(id, (await body(req)).read !== false))) return fail("notfound", 404);
    return json({ ok: true });
  }, { admin: true });
}

/** DELETE — supprimer un message. */
export function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!isId(id)) return fail("id", 404);
    await deleteMessage(id);
    return json({ ok: true });
  }, { admin: true });
}
