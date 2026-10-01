import type { Metadata } from "next";
import { team } from "@/lib/data";
import { pageMeta } from "@/lib/seo";
import { CtaBlock, PageHero, TeamCard } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "L’équipe | Finn’s Barber Creil",
  "Yassir, Ayssem, Sami, Mimine et Wassim : l’équipe du barber shop Finn’s Barber à Creil.",
  "/equipe"
);

export default function Equipe() {
  return (
    <>
      <PageHero label="The team / L’équipe" title={"Meet\nthe team."} sub="Cinq visages, une même exigence." />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap tgrid">{team.map((t, i) => <TeamCard t={t} i={i} key={t.name} />)}</div>
      </section>
      <CtaBlock />
    </>
  );
}
