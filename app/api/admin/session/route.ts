import { body, fail, handle, json } from "@/lib/api";
import { adminPassword, checkPassword, endSession, startSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST { password } — connexion au tableau de bord. */
export function POST(req: Request) {
  return handle(async () => {
    if (!adminPassword()) return fail("not-configured", 503);
    const { password } = await body(req);
    if (!checkPassword(password)) {
      await new Promise(r => setTimeout(r, 600)); // ralentit les essais en série
      return fail("password", 401);
    }
    await startSession();
    return json({ ok: true });
  });
}

/** DELETE — déconnexion. */
export function DELETE() {
  return handle(async () => { await endSession(); return json({ ok: true }); });
}
