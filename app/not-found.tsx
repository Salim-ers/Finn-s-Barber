import Link from "next/link";
import { Arr, PageHero } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <PageHero label="Erreur 404" title={"Page\nintrouvable."} sub="Cette page n’existe pas ou a été déplacée." />
      <section className="cream" style={{ paddingBottom: 120 }}><div className="wrap"><Link className="btn" href="/">Retour à l’accueil <Arr /></Link></div></section>
    </>
  );
}
