import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Legal from "@/components/Legal";

export const metadata: Metadata = pageMeta("Gestion des cookies | Finn’s Barber", "Gestion des cookies du site Finn’s Barber, Creil.", "/cookies");

export default function Cookies() {
  return (
    <Legal title={"Gestion des\ncookies."}>
      <p className="lead" style={{ marginBottom: 12 }}>Ce site ne dépose aucun cookie publicitaire ni de mesure d’audience.</p>
      <h2>Ce que le site utilise</h2>
      <ul><li>Un stockage de session strictement technique, pour mémoriser que l’animation d’ouverture a déjà été jouée. Il ne nécessite pas de consentement et disparaît à la fermeture de l’onglet.</li></ul>
      <h2>Services tiers</h2>
      <p>Planity, Google Maps et Instagram peuvent déposer leurs propres cookies lorsque vous cliquez sur un lien qui y mène. Ces cookies relèvent de leurs politiques respectives.</p>
      <h2>Évolution</h2>
      <p>Si un outil de mesure d’audience est ajouté (par exemple Vercel Analytics ou Google Analytics), un bandeau de consentement sera mis en place si nécessaire et cette page sera mise à jour.</p>
    </Legal>
  );
}
