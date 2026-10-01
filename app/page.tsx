import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CtaBlock, ReviewsSection, ServicePreview } from "@/components/ui";
import { GalleryTeaser, Geste, Hero, Intro, LogoSequence, ServicesTeaser, StoryTeaser, TeamTeaser, TheCut } from "@/components/home/Sections";

export const metadata: Metadata = pageMeta(
  "Finn’s Barber Creil | Coiffeur Homme & Barber",
  "Finn’s Barber à Creil : salon de coiffure homme depuis 1999. Découvrez nos prestations et prenez rendez-vous en ligne.",
  "/"
);

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <StoryTeaser />
      <ServicesTeaser />
      <TheCut />
      <Geste />
      <TeamTeaser />
      <GalleryTeaser />
      <ReviewsSection />
      <LogoSequence />
      <CtaBlock />
      <ServicePreview />
    </>
  );
}
