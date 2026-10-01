import type { Metadata } from "next";
import { salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Todo } from "@/components/ui";
import Legal from "@/components/Legal";

export const metadata: Metadata = pageMeta("Politique de confidentialité | Finn’s Barber", "Politique de confidentialité du site Finn’s Barber, Creil.", "/politique-confidentialite");

const L = salon.legal;
const mail = salon.email || <Todo />;

export default function Privacy() {
  return (
    <Legal title={"Confiden-\ntialité."}>
      <p className="lead" style={{ marginBottom: 12 }}>Ce site est une vitrine. Il ne comporte aucun formulaire et ne collecte directement aucune donnée personnelle.</p>
      <h2>Responsable du traitement</h2>
      <p>{L.company}, {fullAddress}. Contact : {mail}.</p>
      <h2>Réservations</h2>
      <p>La prise de rendez-vous s’effectue sur Planity. Les données saisies lors d’une réservation sont traitées par Planity selon sa <a href="https://www.planity.com/politique-de-confidentialite" target="_blank" rel="noopener">politique de confidentialité</a>, et transmises au salon pour la gestion de votre rendez-vous.</p>
      <h2>Données techniques</h2>
      <p>L’hébergeur du site peut conserver des journaux techniques (adresse IP, date, pages consultées) à des fins de sécurité. Les polices de caractères sont hébergées sur le site lui-même : aucune donnée n’est transmise à un service de polices tiers.</p>
      <p>Le site enregistre une seule information dans votre navigateur (stockage de session) pour ne pas rejouer l’animation d’ouverture. Elle est effacée à la fermeture de l’onglet.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition. Pour l’exercer, contactez {mail}. Vous pouvez également adresser une réclamation à la CNIL (cnil.fr).</p>
    </Legal>
  );
}
