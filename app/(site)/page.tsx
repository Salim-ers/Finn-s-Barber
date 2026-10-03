import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CtaBlock } from "@/components/ui";
import { ConseilsTeaser, Hero, Offer, Proof, Since, TheCut, Work } from "@/components/home/Sections";

export const metadata: Metadata = pageMeta(
  "Finn’s Barber Creil | Coiffeur Homme & Barber",
  "Finn’s Barber à Creil : coupe 20 €, coupe + barbe 25 €. Barbier depuis 1999, noté 5,0 sur 85 avis. Réservation en ligne 24h/24.",
  "/"
);

export default function Home() {
  return (
    <>
      <Hero />
      <Offer />
      <Proof />
      <TheCut />
      <Work />
      <Since />
      <ConseilsTeaser />
      <CtaBlock />
    </>
  );
}
