import type { Metadata } from "next";
import { reviews } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { CtaBlock, PageHero, RatingSummary, ReviewCard } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "Avis clients | Finn’s Barber Creil",
  `Note de ${reviews.rating}/5 sur ${reviews.count} avis vérifiés : ce que les clients disent de Finn’s Barber, coiffeur homme et barbier à Creil.`,
  "/avis"
);

export default function Avis() {
  return (
    <>
      <PageHero label="Clients / Avis" title={"Ils en\nparlent."} sub="Les avis laissés par nos clients après leur rendez-vous, recopiés tels quels." line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap rv-page">
          <aside className="rv-side"><RatingSummary /></aside>
          <div className="rv-wall">{reviews.items.map(r => <ReviewCard r={r} key={r.text + r.date} />)}</div>
        </div>
        <p className="wrap rv-source">Avis clients vérifiés publiés sur {reviews.source}, relevés le {reviews.checkedAt}. Seuls les avis accompagnés d’un commentaire sont affichés.</p>
      </section>
      <CtaBlock />
    </>
  );
}
