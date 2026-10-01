import type { Metadata } from "next";
import type { ReactNode } from "react";
import { salon } from "@/lib/data";
import { A, mapsUrl, telHref } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, BookButton, CtaBlock, PageHero, Todo } from "@/components/ui";
import { Hours, OpenStatus } from "@/components/contact/Live";
import MapSchematic from "@/components/contact/MapSchematic";

export const metadata: Metadata = pageMeta(
  "Contact, horaires et accès | Finn’s Barber Creil",
  "Finn’s Barber, 43 Rue Jean Jaurès, 60100 Creil. Ouvert du mardi au dimanche, 10:00 — 19:00. Itinéraire et réservation.",
  "/contact"
);

function Row({ k, v, href }: { k: string; v: ReactNode; href?: string }) {
  return (
    <div>
      <dt>{k}</dt>
      <dd>{v ? (href ? <a className="ul" href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>{v}</a> : v) : <Todo />}</dd>
    </div>
  );
}

export default function Contact() {
  return (
    <>
      <PageHero label="Contact / Creil" title={"Find\nFinn’s."} line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap ct-grid">
          <div>
            <p className="label tick">Adresse</p>
            <p className="addr d">{A.street}<br />{A.postalCode} {A.city}</p>
            <OpenStatus />
            <div className="ct-btns">
              <a className="btn mag" href={mapsUrl} target="_blank" rel="noopener">Itinéraire <Arr /></a>
              <BookButton label="Prendre RDV" className="btn--ghost" />
              {telHref && <a className="btn btn--ghost" href={telHref}>Appeler</a>}
            </div>
          </div>
          <div>
            <p className="label tick">Horaires</p>
            <Hours />
          </div>
        </div>
      </section>
      <section className="sec warm">
        <div className="wrap ct-grid2">
          <div className="map fade">
            <MapSchematic />
            <a className="btn map-btn" href={mapsUrl} target="_blank" rel="noopener">Itinéraire <Arr /></a>
            <p className="map-note">Plan schématique. Le bouton Itinéraire ouvre Google Maps.</p>
          </div>
          <div>
            <p className="label tick">Nous joindre</p>
            <dl className="cts">
              <Row k="Téléphone" v={salon.phone} href={telHref} />
              <Row k="E-mail" v={salon.email} href={salon.email ? `mailto:${salon.email}` : ""} />
              <Row k="Instagram" v={salon.instagram ? salon.instagramHandle : ""} href={salon.instagram} />
              <Row k="TikTok" v={salon.tiktok ? "TikTok" : ""} href={salon.tiktok} />
              <Row k="Planity" v="Voir sur Planity" href={salon.planity} />
            </dl>
          </div>
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
