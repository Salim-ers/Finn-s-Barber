import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { services, timeline, media, reviews, type Media, type Review } from "@/lib/data";
import { A, pad2 } from "@/lib/site";

/* Titre découpé en lignes masquées (reveal vertical) */
export function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((l, i) => <span className="ln" key={i}><span className="ln-i">{l}</span></span>)}</>;
}

export const Arr = () => <span className="arr" aria-hidden="true">→</span>;
export const Todo = () => <span className="todo">[À renseigner]</span>;

/* La ligne Finn’s — signature graphique issue du « Since 1999 » du logo */
export function FLine({ text = "Since 1999", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`fline ${className}`}>
      <span className="fl-s fl-l" aria-hidden="true"><i /></span>
      {text && <span className="fl-t">{text}</span>}
      <span className="fl-s fl-r" aria-hidden="true"><i /></span>
    </div>
  );
}

/* Réservation en ligne, directement sur le site */
export function BookButton({ label = "Prendre rendez-vous", className = "", service }: { label?: string; className?: string; service?: string }) {
  return (
    <Link className={`btn mag ${className}`} href={service ? `/reserver?service=${service}` : "/reserver"}>
      {label} <Arr />
    </Link>
  );
}

/* Figure : photo réelle (next/image), vidéo, ou emplacement de direction artistique */
type FigOpts = { n?: number; ratio?: string; fill?: boolean; className?: string; speed?: number; eager?: boolean; sizes?: string };
export function Fig({ m, n, ratio, fill, className = "", speed, eager, sizes = "(max-width: 900px) 100vw, 50vw" }: { m: Media } & FigOpts) {
  const real = !!(m.src || m.video);
  const style = fill ? undefined : { aspectRatio: ratio || m.ratio || "3/4" };
  return (
    <figure
      className={`fig ${real ? "" : "is-ph"} tone-${m.tone || "navy"} ${fill ? "fig--fill" : ""} ${className}`}
      style={style}
      {...(real ? {} : { role: "img", "aria-label": m.alt || m.note })}
    >
      <div className="fig-in" data-speed={speed || undefined}>
        {m.video ? (
          <video className="fig-media" muted loop playsInline autoPlay preload={eager ? "auto" : "none"} poster={m.poster || undefined} aria-label={m.alt}>
            <source src={m.video} type={/\.webm$/.test(m.video) ? "video/webm" : "video/mp4"} />
          </video>
        ) : m.src ? (
          <Image className="fig-media" src={m.src} alt={m.alt} fill sizes={sizes} priority={!!eager} style={m.pos ? { objectPosition: m.pos } : undefined} />
        ) : (
          <>
            <div className="ph-art" />
            {m.initial && <span className="ph-initial" aria-hidden="true">{m.initial}</span>}
          </>
        )}
      </div>
      {!real && (
        <>
          <figcaption className="ph-meta">{n ? <span className="ph-n">Fig. {pad2(n)}</span> : null}<span className="ph-d">{m.note}</span></figcaption>
          <span className="ph-flag" aria-hidden="true">Photo à fournir</span>
        </>
      )}
    </figure>
  );
}

export function PageHero({ label, title, sub, line = "Since 1999" }: { label: ReactNode; title: string; sub?: string; line?: string }) {
  return (
    <section className="phero cream">
      <div className="wrap">
        <p className="label tick fade">{label}</p>
        <h1 className="d d-xl split"><Lines text={title} /></h1>
        {line && <div className="phero-line"><FLine text={line} /></div>}
        {sub && <p className="lead phero-sub fade">{sub}</p>}
      </div>
    </section>
  );
}

export function CtaBlock() {
  return (
    <section className="sec navy cta-big">
      <div className="wrap">
        <p className="label tick fade">Time for a fresh cut?</p>
        <h2 className="d d-xxl split cta-title"><Lines text="À vous." /></h2>
        <div className="cta-row">
          <BookButton className="btn--solid-cream btn--lg" />
          <p className="cta-addr label fade">{A.street}<br />{A.postalCode} {A.city}</p>
        </div>
      </div>
    </section>
  );
}

export function Timeline() {
  return (
    <div className="tl">
      <div className="tl-track"><span className="tl-fill" /></div>
      <ol className="tl-list">
        {timeline.map(t => (
          <li className="tl-item" key={t.year}>
            <span className="tl-tick" aria-hidden="true" />
            <p className="tl-year">{t.year}</p>
            <h3 className="label">{t.title}</h3>
            <p>{t.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ServiceRows() {
  return (
    <ul className="svc-list">
      {services.map((s, i) => (
        <li className="svc-row" key={s.id}>
          <Link href={`/reserver?service=${s.id}`} data-cursor="book" data-prev={i} aria-label={`Réserver : ${s.name}, ${s.duration}, ${s.price}`}>
            <span className="svc-n">{pad2(i + 1)}</span>
            <span className="svc-name">{s.name}</span>
            <span className="svc-desc">{s.short}</span>
            <span className="svc-dur">{s.duration.toUpperCase()}</span>
            <span className="svc-price">{s.price}</span>
            <span className="svc-cta">Réserver <Arr /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* Aperçu photo qui suit le curseur au survol d’une prestation (desktop) */
export function ServicePreview() {
  return (
    <div className="svc-prev" id="svcprev" aria-hidden="true">
      {services.map((s, i) => <div className="sp-f" data-i={i} key={s.id}><Fig m={media[s.media]} className="fig--sm" /></div>)}
    </div>
  );
}

/* Note globale et critères, relevés sur la fiche Planity du salon */
export function RatingSummary() {
  return (
    <>
      <p className="rv-num" aria-label={`Note moyenne ${reviews.rating} sur 5`}>{reviews.rating}</p>
      <p className="rv-stars" aria-hidden="true">★★★★★</p>
      <p className="rv-meta">{reviews.count} avis clients vérifiés sur {reviews.source}<br />Note relevée le {reviews.checkedAt}</p>
      <ul className="rv-crit">{reviews.criteria.map(([k, v]) => <li key={k}><span>{k}</span><span>{v}</span></li>)}</ul>
    </>
  );
}

export function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="rv-card">
      <p className="rv-card-stars" aria-label="5 étoiles sur 5">★★★★★</p>
      <blockquote><p>{r.text}</p></blockquote>
      <figcaption className="label">{r.author} <span aria-hidden="true">·</span> {r.date}</figcaption>
    </figure>
  );
}

export function ReviewsSection() {
  const [featured, ...rest] = reviews.items;
  const picks = rest.filter(r => r.text.length > 45 && r.text.length < 230).slice(0, 4);
  return (
    <section className="sec warm">
      <div className="wrap rv-grid">
        <div>
          <p className="label tick fade">Clients / Finn’s</p>
          <RatingSummary />
        </div>
        <div>
          <h2 className="d d-m split"><Lines text={"Les clients\nparlent\npour nous."} /></h2>
          <blockquote className="rv-quote fade"><p>“{featured.text}”</p><footer className="label">{featured.author}, {featured.date}</footer></blockquote>
          <div className="rv-cards fade">{picks.map(r => <ReviewCard r={r} key={r.text} />)}</div>
          <Link className="link-more" href="/avis"><span className="ul">Lire les {reviews.items.length} avis</span> <Arr /></Link>
        </div>
      </div>
    </section>
  );
}
