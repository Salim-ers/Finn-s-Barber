import { handle, json } from "@/lib/api";
import { listMessages } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** GET — messages reçus par le formulaire de contact. */
export function GET() {
  return handle(async () => {
    const messages = await listMessages();
    return json({ messages, unread: messages.filter(m => !m.read).length });
  }, { admin: true });
}
