import type { Metadata } from "next";
import { media } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { CtaBlock, Fig, Lines, PageHero, Timeline } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "Notre histoire, barbier à Creil depuis 1999 | Finn’s Barber",
  "Fondé en 1999 par Khaldi Djilali, coiffeur depuis les années 1960 : l’histoire de Finn’s Barber, salon de coiffure homme à Creil.",
  "/histoire"
);

export default function Histoire() {
  return (
    <>
      <PageHero label="Notre histoire" title={"Depuis\n1999."} sub="Un savoir-faire transmis de père en fils, à Creil." />
      <section className="cream"><div className="wrap"><div className="mask"><Fig m={media.story} ratio="16/9" speed={6} eager sizes="100vw" /></div></div></section>

      <section className="sec cream"><div className="wrap"><Timeline /></div></section>

      <section className="sec warm quote-sec">
        <div className="wrap quote-grid">
          <blockquote className="quote">
            <p className="split"><Lines text={"Les styles\nchangent.\nLa précision\nreste."} /></p>
            <footer className="label tick">La maison Finn’s, Creil</footer>
          </blockquote>
          <div className="hist-fig mask"><Fig m={media.archive} ratio="4/5" sizes="(max-width: 900px) 100vw, 35vw" /></div>
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
