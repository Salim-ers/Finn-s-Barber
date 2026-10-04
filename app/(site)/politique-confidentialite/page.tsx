import type { Metadata } from "next";
import { booking, salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Todo } from "@/components/ui";
import Legal from "@/components/Legal";

export const metadata: Metadata = pageMeta("Politique de confidentialité | Finn’s Barber", "Politique de confidentialité du site Finn’s Barber, Creil : réservation en ligne, données collectées, vos droits.", "/politique-confidentialite");

const L = salon.legal;
const mail = salon.email || <Todo />;

export default function Privacy() {
  return (
    <Legal title={"Confiden-\ntialité."}>
      <p className="lead" style={{ marginBottom: 12 }}>Le site ne collecte que les informations nécessaires à la prise de rendez-vous et aux réponses à vos messages. Elles ne sont ni vendues, ni utilisées à des fins publicitaires.</p>
      <h2>Responsable du traitement</h2>
      <p>{L.company}, {fullAddress}. Contact : {mail}.</p>
      <h2>Réservation en ligne</h2>
      <p>Lorsque vous réservez, le salon enregistre votre prénom, votre nom, votre numéro de téléphone, votre adresse e-mail, la prestation choisie, la date du rendez-vous et l’éventuelle précision que vous ajoutez. L’équipe peut aussi noter vos préférences de coupe pour mieux vous recevoir.</p>
      <ul>
        <li><strong>Finalité :</strong> organiser et honorer votre rendez-vous, vous joindre en cas d’imprévu, vous envoyer la confirmation par e-mail, tenir l’historique de vos passages.</li>
        <li><strong>Base légale :</strong> l’exécution de la prestation que vous demandez (mesures précontractuelles et contrat).</li>
        <li><strong>Destinataires :</strong> uniquement l’équipe du salon. Les données sont hébergées par nos prestataires techniques (hébergement du site, base de données, envoi des e-mails de confirmation), qui agissent pour le compte du salon.</li>
        <li><strong>Durée de conservation :</strong> 3 ans après votre dernier rendez-vous, puis suppression.</li>
      </ul>
      <p>Une empreinte anonymisée de l’adresse IP est conservée avec chaque réservation, pour limiter les réservations abusives. Elle ne permet pas de retrouver l’adresse.</p>
      <p>Vous pouvez annuler un rendez-vous jusqu’à {booking.cancelUntilHours} h avant, grâce au lien personnel affiché après la réservation.</p>
      <h2>Formulaire de contact</h2>
      <p>Les messages envoyés depuis la page Contact (nom, téléphone et/ou e-mail, message) servent uniquement à vous répondre. Ils sont lus par l’équipe du salon et conservés 1 an au plus. Une empreinte anonymisée de l’adresse IP limite les envois abusifs.</p>
      <h2>Carte Google Maps</h2>
      <p>La carte de la page Contact n’est chargée qu’après votre accord. Google traite alors des données selon sa propre politique de confidentialité. Voir la page Gestion des cookies.</p>
      <h2>Données techniques</h2>
      <p>L’hébergeur du site peut conserver des journaux techniques (adresse IP, date, pages consultées) à des fins de sécurité. Les polices de caractères sont hébergées sur le site lui-même : aucune donnée n’est transmise à un service de polices tiers.</p>
      <h2>Vos droits</h2>
      <p>Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition. Pour l’exercer, contactez {mail} ou adressez-vous directement au salon. Vous pouvez également adresser une réclamation à la CNIL (cnil.fr).</p>
    </Legal>
  );
}
