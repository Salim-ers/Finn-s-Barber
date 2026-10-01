import { fail, handle, json } from "@/lib/api";
import { deleteBlock } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** DELETE — rouvre un créneau bloqué. */
export function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("id", 404);
    await deleteBlock(id);
    return json({ ok: true });
  }, { admin: true });
}
