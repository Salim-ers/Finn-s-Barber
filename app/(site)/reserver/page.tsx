import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PageHero } from "@/components/ui";
import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = pageMeta(
  "Prendre rendez-vous en ligne | Finn’s Barber Creil",
  "Réservez votre coupe ou votre coupe + barbe chez Finn’s Barber à Creil, en ligne 24h/24 avec confirmation immédiate.",
  "/reserver"
);

export default async function Reserver({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <>
      <PageHero label="Réservation" title="Réserver." sub="Confirmation immédiate · règlement au salon." line="" />
      <section className="sec cream bk-wrap" style={{ paddingTop: 0 }}>
        <div className="wrap"><BookingWizard initialService={service} /></div>
      </section>
    </>
  );
}
