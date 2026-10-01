import { handle, json } from "@/lib/api";
import { listClients } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";

/** GET ?q= — fichier clients avec visites, absences, dernier et prochain passage. */
export function GET(req: Request) {
  return handle(async () => json({ clients: await listClients((new URL(req.url).searchParams.get("q") || "").slice(0, 60)) }), { admin: true });
}
