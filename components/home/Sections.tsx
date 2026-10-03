import Link from "next/link";
import { conseils, media, reviews, services } from "@/lib/data";
import { Arr, BookButton, FLine, Fig, Lines, ReviewCard } from "@/components/ui";
import HeroVideo from "./HeroVideo";

const chars = (w: string, cls: string) => [...w].map((c, i) => <span className="hx-chw" key={i}><span className={cls}>{c}</span></span>);

/* ---------- Ouverture : vidéo plein écran ---------- */
export function Hero() {
  return (
    <section className="hx" id="hero">
      <div className="hx-media">
        <div className="hx-zoom"><HeroVideo /></div>
        <div className="hx-veil" />
      </div>

      {/* Première visite : « FINN’S » laisse voir la vidéo à travers ses lettres, puis on plonge dans le I */}
      <div className="hx-intro" aria-hidden="true">
        <div className="hx-intro-word">
          {[..."FINN’S"].map((c, i) => <span className="hx-ichw" key={i}><span className={`hx-ich ${c === "I" ? "hx-ich-i" : ""}`}>{c}</span></span>)}
        </div>
        <div className="hx-intro-line"><FLine className="fline--manual" /></div>
      </div>

      <div className="hx-in wrap">
        <p className="hx-kicker label hx-reveal">Barbier · Creil · depuis 1999</p>
        <h1 className="hx-title">
          <span className="sr">Finn’s Barber, coiffeur homme et barbier à Creil</span>
          <span className="hx-row" aria-hidden="true">{chars("Finn’s", "hx-ch")}</span>
          <span className="hx-row" aria-hidden="true">{chars("Barber", "hx-ch")}</span>
        </h1>
        <div className="hx-line hx-reveal"><FLine className="fline--manual" /></div>
        <div className="hx-ctas hx-reveal">
          <BookButton className="btn--solid-cream btn--lg" />
          <button className="btn btn--ghost btn--lg" type="button" data-scrollto="#offre">Tarifs</button>
        </div>
        <Link className="hx-proof hx-reveal" href="/avis"><span aria-hidden="true">★★★★★</span> {reviews.rating} · {reviews.count} avis clients</Link>
      </div>
      <div className="hx-scroll hx-reveal" aria-hidden="true"><i /></div>
    </section>
  );
}

/* ---------- Prestations ---------- */
export function Offer() {
  return (
    <section className="sec cream offer" id="offre">
      <div className="wrap">
        <div className="sec-head">
          <p className="label tick fade">Prestations</p>
          <h2 className="d d-l split"><Lines text={"Simple.\nPrécis."} /></h2>
        </div>
        <div className="offer-grid">
          {services.map(s => (
            <Link key={s.id} className="offer-card" href={`/reserver?service=${s.id}`} data-cursor="book" aria-label={`Réserver : ${s.name}, ${s.duration}, ${s.price}`}>
              <div className="offer-img mask"><Fig m={media[s.media]} fill sizes="(max-width: 760px) 100vw, 45vw" /></div>
              <div className="offer-body">
                <h3 className="offer-name">{s.name}</h3>
                <p className="offer-meta"><span>{s.duration}</span><strong>{s.price}</strong></p>
                <span className="offer-cta">Réserver <Arr /></span>
              </div>
            </Link>
          ))}
        </div>
        <p className="offer-note fade">Réservation en ligne 24h/24 · confirmation immédiate · règlement au salon</p>
      </div>
    </section>
  );
}

/* ---------- Avis ---------- */
export function Proof() {
  const picks = reviews.items.filter(r => r.text.length > 40 && r.text.length < 170).slice(0, 3);
  return (
    <section className="sec warm proof">
      <div className="wrap">
        <div className="proof-head">
          <p className="proof-num" aria-label={`Note moyenne ${reviews.rating} sur 5`}>{reviews.rating}</p>
          <div>
            <p className="rv-stars" aria-hidden="true">★★★★★</p>
            <p className="proof-count">{reviews.count} avis clients vérifiés</p>
          </div>
        </div>
        <div className="proof-cards" data-lenis-prevent>{picks.map(r => <ReviewCard r={r} key={r.text} />)}</div>
        <Link className="link-more" href="/avis"><span className="ul">Lire tous les avis</span> <Arr /></Link>
      </div>
    </section>
  );
}

/* ---------- The Finn’s cut ---------- */
export function TheCut() {
  return (
    <section className="cut" id="cut">
      <div className="cut-bg"><Fig m={media.cut} fill sizes="100vw" /></div>
      <div className="cut-veil" />
      <div className="wrap cut-in">
        <h2 className="d d-xl cut-title split"><Lines text={"The\nFinn’s\ncut."} /></h2>
        <ul className="cut-words" aria-label="Précision, geste, style">
          {["Précision", "Geste", "Style"].map(w => <li key={w}><span className="ln"><span className="ln-i">{w}</span></span></li>)}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Le travail (aperçu, photos différentes de la galerie) ---------- */
export function Work() {
  const items = ["w1", "w2", "w3", "w4"].map(k => media[k]);
  return (
    <section className="sec cream work">
      <div className="wrap">
        <div className="sec-head sec-head--row">
          <div>
            <p className="label tick fade">Le travail</p>
            <h2 className="d d-l split"><Lines text={"Cuts /\nDetails."} /></h2>
          </div>
          <Link className="btn btn--ghost fade" href="/galerie">Voir la galerie <Arr /></Link>
        </div>
        <div className="work-grid">
          {items.map((m, i) => (
            <Link key={i} href="/galerie" className="work-i mask" data-cursor="view" aria-label={`Galerie : ${m.note}`}>
              <Fig m={m} fill sizes="(max-width: 760px) 50vw, 25vw" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Depuis 1999 ---------- */
export function Since() {
  return (
    <section className="sec navy since">
      <div className="wrap since-grid">
        <div className="since-txt">
          <p className="label tick fade">Depuis 1999</p>
          <h2 className="d d-l split"><Lines text={"De père\nen fils."} /></h2>
          <p className="lead fade">Le salon de coiffure homme de Creil, rue Jean Jaurès.</p>
          <Link className="link-more fade" href="/histoire"><span className="ul">Notre histoire</span> <Arr /></Link>
        </div>
        <div className="since-img mask"><Fig m={media.since} fill speed={4} sizes="(max-width: 900px) 100vw, 55vw" /></div>
      </div>
    </section>
  );
}

/* ---------- Conseils ---------- */
export function ConseilsTeaser() {
  return (
    <section className="sec cream tips">
      <div className="wrap">
        <div className="sec-head sec-head--row">
          <div>
            <p className="label tick fade">Conseils</p>
            <h2 className="d d-m split"><Lines text={"Les conseils\nde la maison."} /></h2>
          </div>
          <Link className="link-more fade" href="/conseils"><span className="ul">Tous les conseils</span> <Arr /></Link>
        </div>
        <ul className="tips-list">
          {conseils.slice(0, 4).map(a => (
            <li key={a.slug} className="fade">
              <Link className="tip" href={`/conseils/${a.slug}`}>
                <span className="label tip-cat">{a.cat}</span>
                <span className="tip-title">{a.title}</span>
                <Arr />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
