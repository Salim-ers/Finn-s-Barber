import { fail, handle, json } from "@/lib/api";
import { mailClientReminder, mailEnabled, sendWithin } from "@/lib/booking/mail";
import { claimReminders, findByToken, releaseReminder } from "@/lib/booking/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Appel autorisé : la tâche planifiée de Vercel (vercel.json), signée par CRON_SECRET quand il est défini. */
function fromCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get("authorization") === `Bearer ${secret}`;
  return !process.env.VERCEL || (req.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
}

/** GET — envoie le rappel de la veille aux clients qui ont rendez-vous demain. */
export function GET(req: Request) {
  return handle(async () => {
    if (!fromCron(req)) return fail("unauthorized", 401);
    if (!mailEnabled()) return json({ ok: true, sent: 0, failed: 0, skipped: "mail" });
    const tokens = await claimReminders();
    let sent = 0, failed = 0;
    // Par petits lots, pour rester sous les limites du serveur d’envoi
    for (let i = 0; i < tokens.length; i += 5) {
      await Promise.all(tokens.slice(i, i + 5).map(async token => {
        const appt = await findByToken(token);
        const ok = appt ? await sendWithin(mailClientReminder(appt, token), 15000) : false;
        if (ok) sent++;
        else { failed++; await releaseReminder(token); }
      }));
    }
    return json({ ok: true, sent, failed });
  });
}
