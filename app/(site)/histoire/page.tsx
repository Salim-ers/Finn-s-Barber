import type { Metadata } from "next";
import Link from "next/link";
import { media, salon, team } from "@/lib/data";
import { A } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, CtaBlock, Fig, Lines, PageHero, Timeline } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "Notre histoire, barbier à Creil depuis 1999 | Finn’s Barber",
  "Fondé en 1999 par Khaldi Djilali, coiffeur depuis les années 1960 : l’histoire de Finn’s Barber, salon de coiffure homme à Creil.",
  "/histoire"
);

const names = team.join(", ").replace(/, ([^,]*)$/, " et $1");

export default function Histoire() {
  return (
    <>
      <PageHero label="Our story / 1999—Today" title={"Le savoir-faire\nse transmet."} />
      <section className="cream"><div className="wrap"><div className="mask"><Fig m={media.story} ratio="16/9" speed={6} eager sizes="100vw" /></div></div></section>

      <section className="sec cream">
        <div className="wrap chap-grid">
          <p className="chap-year split"><Lines text="1960s" /></p>
          <div className="chap-text">
            <p className="label tick fade">Chapitre 01 / Les origines</p>
            <p className="lead fade">Avant Finn’s, il y a un métier. {salon.founder} exerce la coiffure masculine depuis les années 1960.</p>
            <p className="body fade">Coiffeur passionné, il construit son savoir-faire au fil des décennies : la précision du geste, le soin du détail, l’exigence de la finition.</p>
          </div>
          <div className="chap-fig mask"><Fig m={media.archive} ratio="4/5" /></div>
        </div>
      </section>

      <section className="bleed"><div className="mask"><Fig m={media.facade} speed={6} sizes="100vw" /></div></section>

      <section className="sec cream">
        <div className="wrap chap-grid chap-grid--rev">
          <p className="chap-year split"><Lines text="1999" /></p>
          <div className="chap-text">
            <p className="label tick fade">Chapitre 02 / Finn’s</p>
            <p className="lead fade">En 1999, il fonde Finn’s Barber à Creil.</p>
            <p className="body fade">Une maison entièrement consacrée à la coiffure homme : des coupes soignées, des finitions impeccables, un service rapide et personnalisé, dans une ambiance chaleureuse et authentique.</p>
          </div>
        </div>
      </section>

      <section className="sec warm quote-sec">
        <div className="wrap">
          <blockquote className="quote">
            <p className="split"><Lines text={"Un savoir-faire\ntransmis de père\nen fils."} /></p>
            <footer className="label tick">La maison Finn’s, Creil</footer>
          </blockquote>
        </div>
      </section>

      <section className="sec cream today-sec">
        <div className="wrap">
          <p className="label tick fade">Chapitre 03 / Today</p>
          <h2 className="d d-l split"><Lines text={"The next\ncut."} /></h2>
          <div className="story-cols">
            <p className="lead fade">Plus de vingt-cinq ans après son ouverture, Finn’s Barber reste fidèle à son exigence. Une nouvelle génération perpétue et modernise l’expérience.</p>
            <p className="body fade">Aujourd’hui, {names} accueillent les clients au {A.street.replace("Rue", "rue")}.</p>
          </div>
          <Timeline />
          <Link className="link-more fade" href="/reserver"><span className="ul">Prendre rendez-vous</span> <Arr /></Link>
        </div>
      </section>

      <section className="sec navy">
        <div className="wrap">
          <p className="label tick fade">Manifesto</p>
          <h2 className="d d-l split"><Lines text={"Les styles\nchangent.\nLa précision\nreste."} /></h2>
          <div className="mf-cols">
            <p className="lead fade">Les tendances passent. Ce qui fait une bonne coupe, non : un geste juste, une ligne nette, une écoute attentive.</p>
            <p className="body fade">Chez Finn’s, chaque client repart avec une coupe pensée pour lui. C’est l’exigence de la maison depuis 1999, et c’est celle que l’équipe porte aujourd’hui.</p>
          </div>
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
