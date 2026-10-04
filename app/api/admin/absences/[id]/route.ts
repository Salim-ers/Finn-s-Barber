import { fail, handle, json } from "@/lib/api";
import { deleteAbsence } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** DELETE — supprime une absence (le coiffeur redevient réservable). */
export function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("id", 404);
    await deleteAbsence(id);
    return json({ ok: true });
  }, { admin: true });
}
