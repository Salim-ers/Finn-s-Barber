import type { Metadata } from "next";
import { salon } from "@/lib/data";
import { fullAddress } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Todo } from "@/components/ui";
import Legal from "@/components/Legal";

export const metadata: Metadata = pageMeta("Mentions légales | Finn’s Barber", "Mentions légales du site Finn’s Barber, Creil.", "/mentions-legales");

const L = salon.legal;
const v = (x: string) => x || <Todo />;

export default function Mentions() {
  return (
    <Legal title={"Mentions\nlégales."}>
      <h2>Éditeur du site</h2>
      <dl className="ldl">
        <div><dt>Dénomination</dt><dd>{L.company}</dd></div>
        <div><dt>Forme juridique</dt><dd>{L.form}</dd></div>
        <div><dt>Capital social</dt><dd>{v(L.capital)}</dd></div>
        <div><dt>Siège social</dt><dd>{fullAddress}</dd></div>
        <div><dt>Immatriculation</dt><dd>{L.rcs}</dd></div>
        <div><dt>SIRET</dt><dd>{L.siret}</dd></div>
        <div><dt>TVA intracommunautaire</dt><dd>{L.vat}</dd></div>
        <div><dt>Téléphone</dt><dd>{v(salon.phone)}</dd></div>
        <div><dt>E-mail</dt><dd>{v(salon.email)}</dd></div>
      </dl>
      <h2>Directeur de la publication</h2>
      <p>{L.director}, en qualité de {L.directorRole.toLowerCase()}.</p>
      <h2>Hébergement</h2>
      <p>{v(L.host)}</p>
      <h2>Propriété intellectuelle</h2>
      <p>L’ensemble des éléments de ce site (textes, logo, identité visuelle, photographies, mise en page) est la propriété de {L.company} ou de ses partenaires. Toute reproduction ou réutilisation sans autorisation écrite préalable est interdite.</p>
      <h2>Crédits photographiques</h2>
      <p><Todo /></p>
      <h2>Réservation en ligne</h2>
      <p>Les rendez-vous sont pris via la plateforme Planity, qui applique ses propres <a href="https://www.planity.com/cgu" target="_blank" rel="noopener">conditions générales d’utilisation</a>.</p>
      <h2>Liens externes</h2>
      <p>Le site renvoie vers des services tiers (Planity, Google Maps, réseaux sociaux). {L.company} n’est pas responsable de leur contenu ni de leurs pratiques.</p>
    </Legal>
  );
}
