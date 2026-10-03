import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { timeline, reviews, type Media, type Review } from "@/lib/data";
import { A, groupHours, pad2 } from "@/lib/site";

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
          <p className="cta-addr label fade">{A.street}, {A.postalCode} {A.city}<br />{groupHours().filter(h => h.v !== "Fermé").map(h => `${h.days} · ${h.v}`).join(" / ")}</p>
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
