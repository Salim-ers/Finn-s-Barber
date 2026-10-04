import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { booking } from "@/lib/data";
import { DbUnavailable } from "@/lib/db";
import { findByToken, type Appointment } from "@/lib/booking/repo";
import { PageHero } from "@/components/ui";
import ManageBooking from "@/components/booking/ManageBooking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Mon rendez-vous | Finn’s Barber" }, robots: { index: false, follow: false } };

export default async function Rdv({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let appt: Appointment | null = null;
  try { appt = await findByToken(token); } catch (e) { if (!(e instanceof DbUnavailable)) throw e; }
  if (!appt) notFound();
  const canCancel = appt.status === "confirmed" && appt.start - Date.now() >= booking.cancelUntilHours * 3600000;
  return (
    <>
      <PageHero label="Réservation / Mon rendez-vous" title={"Mon\nrendez-vous."} line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ManageBooking token={token} canCancel={canCancel} cancelUntilHours={booking.cancelUntilHours}
            appt={{ serviceName: appt.serviceName, minutes: appt.minutes, priceCents: appt.priceCents, start: appt.start, end: appt.end, status: appt.status, firstName: appt.client.firstName, barber: appt.barber?.name ?? null }} />
        </div>
      </section>
    </>
  );
}
