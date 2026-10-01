import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { DbUnavailable } from "@/lib/db";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const fail = (error: string, status = 400) => json({ error }, status);

/** Exécute un gestionnaire d’API et traduit les erreurs (base indisponible, données invalides). */
export async function handle(fn: () => Promise<Response>, opts: { admin?: boolean } = {}) {
  try {
    if (opts.admin && !(await isAdmin())) return fail("unauthorized", 401);
    return await fn();
  } catch (e) {
    if (e instanceof DbUnavailable) return fail("unavailable", 503);
    console.error(e);
    return fail("server", 500);
  }
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  try { const b = await req.json(); return b && typeof b === "object" ? b : {}; } catch { return {}; }
}
