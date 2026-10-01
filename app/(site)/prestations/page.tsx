import type { Metadata } from "next";
import Link from "next/link";
import { media, services } from "@/lib/data";
import { A, groupHours, mapsUrl, pad2 } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, BookButton, CtaBlock, Fig, Lines, PageHero } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "Prestations et tarifs coupe homme à Creil | Finn’s Barber",
  "Coupe homme 20 € (20 min), coupe + barbe 25 € (25 min). Réservation en ligne 24h/24 chez Finn’s Barber à Creil.",
  "/prestations"
);

export default function Prestations() {
  return (
    <>
      <PageHero label="Services / Nos prestations" title={"The\nmenu."} sub="Deux prestations, une même exigence. Réservation en ligne 24h/24, confirmation immédiate." />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap">
          {services.map((s, i) => (
            <article className="mi" key={s.id}>
              <div className="mi-fig mask"><Fig m={media[s.media]} ratio="4/5" /></div>
              <div className="mi-body">
                <p className="mi-n">{pad2(i + 1)}</p>
                <h2 className="d d-l split"><Lines text={s.name} /></h2>
                <dl className="mi-meta">
                  <div><dt className="label">Durée</dt><dd>{s.duration}</dd></div>
                  <div><dt className="label">Tarif</dt><dd>{s.price}</dd></div>
                </dl>
                <p className="lead">{s.long}</p>
                <p className="body">{s.short}</p>
                <div><BookButton label="Réserver" service={s.id} /></div>
              </div>
            </article>
          ))}
          <div className="info3">
            <div><h2 className="label">Réservation</h2><p>En ligne, directement sur ce site, 24h/24, avec confirmation immédiate.</p><Link className="link-more" href="/reserver"><span className="ul">Réserver un créneau</span> <Arr /></Link></div>
            <div><h2 className="label">Horaires</h2>{groupHours().map(h => <p key={h.days}>{h.days}<br /><strong>{h.v}</strong></p>)}</div>
            <div><h2 className="label">Adresse</h2><p>{A.street}<br />{A.postalCode} {A.city}</p><a className="link-more" href={mapsUrl} target="_blank" rel="noopener"><span className="ul">Itinéraire</span> <Arr /></a></div>
          </div>
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
