/* Contrôle des saisies du formulaire de réservation (côté serveur). */

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function name(v: unknown) {
  const s = clean(v, 60);
  return /^[\p{L}][\p{L}\p{M}' .-]*$/u.test(s) ? s : "";
}

/** Numéro normalisé (06 12 34 56 78 → 0612345678, +33 6… → 06…), ou "" si invalide. */
export function phone(v: unknown) {
  let s = (typeof v === "string" ? v : "").replace(/[\s.\-()]/g, "");
  if (s.startsWith("0033")) s = "+" + s.slice(2);
  if (s.startsWith("+33")) s = "0" + s.slice(3);
  if (/^0[1-9]\d{8}$/.test(s)) return s;
  if (/^\+\d{8,15}$/.test(s)) return s;
  return "";
}
export const fmtPhone = (p: string) => (/^0\d{9}$/.test(p) ? p.replace(/(\d{2})(?=\d)/g, "$1 ") : p);

export function email(v: unknown) {
  const s = clean(v, 120).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) ? s : "";
}

export const note = (v: unknown) => clean(v, 300);
