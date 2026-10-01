/* =========================================================
   ACCÈS AU TABLEAU DE BORD
   Un mot de passe unique pour le salon (variable ADMIN_PASSWORD),
   une session de 30 jours dans un cookie signé (SESSION_SECRET).
   En local, sans variable : mot de passe « finns ».
   ========================================================= */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "finns_admin";
const MAX_AGE = 30 * 24 * 3600;
const isProd = () => !!process.env.VERCEL;

export const adminPassword = () => process.env.ADMIN_PASSWORD || (process.env.VERCEL ? "" : "finns");
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "finns-local-secret";

const sha = (s: string) => createHash("sha256").update(s).digest();
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

export function checkPassword(input: unknown) {
  const pw = adminPassword();
  if (!pw || typeof input !== "string") return false;
  return timingSafeEqual(sha(input), sha(pw));
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, { httpOnly: true, secure: isProd(), sameSite: "lax", path: "/", maxAge: MAX_AGE });
}
export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v || !adminPassword()) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Empreinte anonyme de l’adresse IP (limite anti-abus), jamais l’adresse elle-même. */
export function ipHash(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  return ip ? createHmac("sha256", secret()).update(ip).digest("hex").slice(0, 32) : "";
}
