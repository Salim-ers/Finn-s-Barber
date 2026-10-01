import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { salon, services, timeline, media, reviews, type Media, type TeamMember } from "@/lib/data";
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

export function BookButton({ label = "Prendre rendez-vous", className = "" }: { label?: string; className?: string }) {
  return (
    <a className={`btn mag ${className}`} href={salon.planity} target="_blank" rel="noopener">
      {label} <Arr /><span className="sr"> (Planity, nouvel onglet)</span>
    </a>
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
          <Image className="fig-media" src={m.src} alt={m.alt} fill sizes={sizes} priority={!!eager} />
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
          <a href={salon.planity} target="_blank" rel="noopener" data-cursor="book" data-prev={i} aria-label={`Réserver : ${s.name}, ${s.duration}, ${s.price} (Planity, nouvel onglet)`}>
            <span className="svc-n">{pad2(i + 1)}</span>
            <span className="svc-name">{s.name}</span>
            <span className="svc-desc">{s.short}</span>
            <span className="svc-dur">{s.duration.toUpperCase()}</span>
            <span className="svc-price">{s.price}</span>
            <span className="svc-cta">Réserver <Arr /></span>
          </a>
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

export function TeamCard({ t, i, small }: { t: TeamMember; i: number; small?: boolean }) {
  return (
    <Link className="tm" href="/equipe">
      <div className="tm-img">
        <Fig m={{ src: t.photo, alt: `Portrait de ${t.name}, Finn’s Barber`, note: `Portrait, ${t.name}`, tone: i % 2 ? "warm" : "navy", initial: t.name[0] }} ratio="3/4" className={small ? "fig--sm" : ""} sizes="(max-width: 900px) 64vw, 20vw" />
      </div>
      <span className="tm-name">{t.name}</span>
      <span className="tm-line" aria-hidden="true" />
      <span className="tm-sub label">Finn’s Barber</span>
    </Link>
  );
}

export function ReviewsSection() {
  return (
    <section className="sec warm">
      <div className="wrap rv-grid">
        <div>
          <p className="label tick fade">Clients / Finn’s</p>
          <p className="rv-num" aria-label={`Note moyenne ${reviews.rating} sur 5`}>{reviews.rating}</p>
          <p className="rv-stars" aria-hidden="true">★★★★★</p>
          <p className="rv-meta">{reviews.count} avis clients sur {reviews.source}<br />Note relevée le {reviews.checkedAt}</p>
          <ul className="rv-crit">{reviews.criteria.map(([k, v]) => <li key={k}><span>{k}</span><span>{v}</span></li>)}</ul>
        </div>
        <div>
          <h2 className="d d-m split"><Lines text={"Les clients\nparlent\npour nous."} /></h2>
          {reviews.items.map((r, i) => (
            <blockquote className="rv-quote fade" key={i}><p>“{r.text}”</p><footer className="label">{r.author}, {r.date}</footer></blockquote>
          ))}
          <a className="link-more" href={reviews.url} target="_blank" rel="noopener"><span className="ul">Lire tous les avis sur Planity</span> <Arr /></a>
        </div>
      </div>
    </section>
  );
}
