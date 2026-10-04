import type { Metadata } from "next";
import type { ReactNode } from "react";
import { salon } from "@/lib/data";
import { A, mapsUrl, telHref } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, BookButton, CtaBlock, Lines, PageHero, Todo } from "@/components/ui";
import { Hours, OpenStatus } from "@/components/contact/Live";
import GoogleMap from "@/components/contact/GoogleMap";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = pageMeta(
  "Contact, horaires et accès | Finn’s Barber Creil",
  "Finn’s Barber, 43 Rue Jean Jaurès, 60100 Creil. Ouvert du mardi au dimanche, 10:00 — 19:00. Plan d’accès, formulaire de contact et réservation en ligne.",
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
      <PageHero label="Contact" title={"Find\nFinn’s."} line="" />
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
          <div className="fade">
            <GoogleMap />
          </div>
          <div>
            <p className="label tick">Nous joindre</p>
            <dl className="cts">
              {salon.phone && <Row k="Téléphone" v={salon.phone} href={telHref} />}
              {salon.email && <Row k="E-mail" v={salon.email} href={`mailto:${salon.email}`} />}
              {salon.instagram && <Row k="Instagram" v={salon.instagramHandle} href={salon.instagram} />}
              <Row k="Rendez-vous" v="Réserver en ligne" href="/reserver" />
            </dl>
          </div>
        </div>
      </section>
      <section className="sec cream" id="message">
        <div className="wrap cf-grid">
          <div>
            <p className="label tick fade">Une question ?</p>
            <h2 className="d d-m split"><Lines text={"Écrivez-\nnous."} /></h2>
          </div>
          <ContactForm />
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
