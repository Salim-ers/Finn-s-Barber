import Link from "next/link";
import { gallery, media, salon, steps, type GalleryItem } from "@/lib/data";
import { A, pad2 } from "@/lib/site";
import { Arr, BookButton, FLine, Fig, Lines, ServiceRows, Timeline } from "@/components/ui";

export function Hero() {
  return (
    <section className="hero" id="hero">
      <h1 className="sr">Finn’s Barber, coiffeur homme et barbier à Creil depuis 1999</h1>
      <div className="hero-meta label">
        <span className="hi-fade">Creil, France</span>
        <span className="hi-fade hero-addr">Coiffeur homme &amp; barber</span>
        <span className="hi-fade">{A.street}</span>
      </div>
      <div className="hero-stage">
        <div className="hw hw-1 wm" aria-hidden="true"><span className="ln"><span className="ln-i">Finn’s</span></span></div>
        <div className="hero-img"><Fig m={media.hero} eager sizes="100vw" /></div>
        <div className="hw hw-2 wm" aria-hidden="true"><span className="ln"><span className="ln-i">Barber</span></span></div>
      </div>
      <div className="hero-line"><FLine className="fline--manual" /></div>
      <div className="hero-foot">
        <p className="hero-sign hi-fade">Une coupe.<br />Une signature.</p>
        <div className="hero-ctas hi-fade">
          <BookButton />
          <button className="btn btn--ghost" type="button" data-scrollto="#intro">Découvrir Finn’s</button>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true"><span className="hs-in label">Scroll to discover<i /></span></div>
    </section>
  );
}

export function Intro() {
  return (
    <section className="sec navy" id="intro">
      <div className="wrap">
        <div className="intro-grid">
          <div>
            <p className="label tick fade">Finn’s / Creil</p>
            <h2 className="d d-l split"><Lines text={"Le style\nse joue\ndans le\ndétail."} /></h2>
          </div>
          <div className="intro-side">
            <p className="lead fade">Maison de coiffure masculine à Creil depuis 1999.</p>
            <p className="body fade">Des coupes soignées, des finitions nettes, un service rapide et personnalisé. Un savoir-faire transmis de père en fils, dans une ambiance chaleureuse et authentique.</p>
            <Link className="link-more fade" href="/histoire"><span className="ul">Notre histoire</span> <Arr /></Link>
          </div>
        </div>
        <div className="intro-fig">
          <div className="mask"><Fig m={media.intro2} ratio="4/5" /></div>
          <div className="mask"><Fig m={media.intro} ratio="16/10" speed={5} /></div>
        </div>
      </div>
    </section>
  );
}

export function StoryTeaser() {
  return (
    <section className="sec cream story-h">
      <div className="big-year" aria-hidden="true" data-speed="10">1999</div>
      <div className="wrap">
        <p className="label tick fade">Our story / Notre histoire</p>
        <h2 className="d d-l split"><Lines text={"Depuis\n1999."} /></h2>
        <div className="story-cols">
          <p className="lead fade">Fondé en 1999 par {salon.founder}, coiffeur depuis les années 1960, Finn’s Barber est devenu une institution de la coiffure masculine à Creil.</p>
          <p className="body fade">Le métier s’y transmet de père en fils, avec la même exigence : des coupes précises, des finitions impeccables et un accueil qui fait revenir.</p>
        </div>
        <Timeline />
        <Link className="link-more fade" href="/histoire"><span className="ul">Lire notre histoire</span> <Arr /></Link>
      </div>
    </section>
  );
}

export function ServicesTeaser() {
  return (
    <section className="sec cream" id="services" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="svc-head">
          <div>
            <p className="label tick fade">Services / 01</p>
            <h2 className="d d-l split"><Lines text={"Simple.\nPrécis."} /></h2>
          </div>
          <Link className="link-more fade" href="/prestations"><span className="ul">Toutes les prestations</span> <Arr /></Link>
        </div>
        <ServiceRows />
        <p className="svc-note fade">Réservation en ligne 24h/24, confirmation immédiate.</p>
      </div>
    </section>
  );
}

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

export function Geste() {
  return (
    <section className="sec cream" id="geste">
      <div className="wrap">
        <p className="label tick fade">Le geste</p>
        <h2 className="d d-l split"><Lines text={"Le geste\nfait la\ndifférence."} /></h2>
      </div>
      <div className="wrap geste-grid">
        <ol className="geste-steps">
          {steps.map((s, i) => (
            <li className="gs" data-i={i} key={s.t}>
              <span className="gs-n">{pad2(i + 1)}</span>
              <h3 className="gs-t d d-m">{s.t}</h3>
              <p className="body">{s.d}</p>
              <div className="gs-m"><Fig m={media[s.m]} ratio="4/5" /></div>
            </li>
          ))}
        </ol>
        <div className="geste-media" aria-hidden="true">
          <div className="gm-stick">
            {steps.map((s, i) => <div className={`gm-f ${i === 0 ? "on" : ""}`} key={s.t}><Fig m={media[s.m]} fill sizes="45vw" /></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function MqItems({ list, dup }: { list: GalleryItem[]; dup?: boolean }) {
  return (
    <>
      {list.map((g, i) => (
        <Link key={(dup ? "d" : "") + i} className={`mq-item ${dup ? "dup" : ""}`} href="/galerie" data-cursor="view"
          {...(dup ? { "aria-hidden": true, tabIndex: -1 } : { "aria-label": `Voir la galerie : ${g.note}` })}>
          <Fig m={g} className="fig--sm" sizes="30vw" />
        </Link>
      ))}
    </>
  );
}

export function GalleryTeaser() {
  const row1 = gallery.slice(0, 5), row2 = gallery.slice(5);
  return (
    <section className="sec cream">
      <div className="wrap gal-head">
        <div>
          <p className="label tick fade">Selected work</p>
          <h2 className="d d-l split"><Lines text={"Cuts /\nDetails /\nFinn’s."} /></h2>
        </div>
        <Link className="btn btn--ghost" href="/galerie">Voir la galerie <Arr /></Link>
      </div>
      <div className="marq marq--a" data-dir="-1"><div className="marq-track"><MqItems list={row1} /><MqItems list={row1} dup /></div></div>
      <div className="marq marq--b" data-dir="1"><div className="marq-track"><MqItems list={row2} /><MqItems list={row2} dup /></div></div>
    </section>
  );
}

export function LogoSequence() {
  return (
    <section className="logoseq" id="logoseq" aria-label="Finn’s Barber, since 1999">
      <div className="ls-photo"><Fig m={media.logo} fill sizes="100vw" /></div>
      <div className="ls-words wm" aria-hidden="true">
        <div className="ls-finns">{["F", "I", "N", "N", "’", "S"].map((l, i) => <span className="ls-l" key={i}>{l}</span>)}</div>
        <div className="ls-barber"><span className="ln"><span className="ln-i">Barber</span></span></div>
        <div className="ls-line"><FLine className="fline--manual fline--scrub on" /></div>
      </div>
      <div className="ls-navy" />
    </section>
  );
}
