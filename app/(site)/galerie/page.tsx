import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CtaBlock, PageHero } from "@/components/ui";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = pageMeta(
  "Galerie, coupes, dégradés et barbes | Finn’s Barber Creil",
  "Coupes, dégradés, barbes et détails : la galerie de Finn’s Barber, coiffeur homme à Creil.",
  "/galerie"
);

export default function Galerie() {
  return (
    <>
      <PageHero label="Galerie" title={"Cuts /\nDetails /\nFinn’s."} line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}><div className="wrap"><GalleryGrid /></div></section>
      <CtaBlock />
    </>
  );
}
