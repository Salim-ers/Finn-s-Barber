import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Legal from "@/components/Legal";

export const metadata: Metadata = pageMeta("Gestion des cookies | Finn’s Barber", "Gestion des cookies du site Finn’s Barber, Creil.", "/cookies");

export default function Cookies() {
  return (
    <Legal title={"Gestion des\ncookies."}>
      <p className="lead" style={{ marginBottom: 12 }}>Ce site ne dépose aucun cookie publicitaire ni de mesure d’audience.</p>
      <h2>Ce que le site utilise</h2>
      <ul>
        <li>Un stockage de session strictement technique, pour mémoriser que l’animation d’ouverture a déjà été jouée. Il disparaît à la fermeture de l’onglet.</li>
        <li>Si vous acceptez d’afficher la carte Google Maps, ce choix est mémorisé dans votre navigateur pour ne pas vous le redemander. Il suffit d’effacer les données du site pour le retirer.</li>
        <li>Un cookie de session, réservé à l’équipe du salon, pour accéder au tableau de bord des rendez-vous. Il n’est jamais déposé chez les visiteurs.</li>
      </ul>
      <p>La réservation en ligne ne dépose aucun cookie.</p>
      <h2>Google Maps</h2>
      <p>La carte de la page Contact est fournie par Google. Elle n’est chargée qu’après votre clic sur « Afficher la carte » : Google peut alors déposer ses propres cookies, régis par sa <a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noopener">politique de confidentialité</a>. Sans ce clic, aucune donnée n’est transmise à Google.</p>
      <h2>Liens externes</h2>
      <p>Google Maps (itinéraire) et Instagram peuvent déposer leurs propres cookies lorsque vous suivez un lien qui y mène.</p>
      <h2>Évolution</h2>
      <p>Si un outil de mesure d’audience est ajouté (par exemple Vercel Analytics ou Google Analytics), un bandeau de consentement sera mis en place si nécessaire et cette page sera mise à jour.</p>
    </Legal>
  );
}
