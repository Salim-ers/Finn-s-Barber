import type { Metadata } from "next";
import Link from "next/link";
import { journal, type Article } from "@/lib/data";
import { fmtDate, readTime } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, CtaBlock, Fig, PageHero } from "@/components/ui";

export const metadata: Metadata = pageMeta(
  "Journal, conseils coupe et barbe | Finn’s Barber",
  "Dégradé, barbe, contours, fréquence des coupes : les conseils de Finn’s Barber, barbier à Creil.",
  "/journal"
);

const Meta = ({ a }: { a: Article }) => (
  <p className="ja-meta label"><span>{a.cat}</span><time dateTime={a.date}>{fmtDate(a.date)}</time><span>{readTime(a)} min de lecture</span></p>
);

export default function Journal() {
  const [f, ...rest] = journal;
  return (
    <>
      <PageHero label="Le journal Finn’s" title="Journal." sub="Coupe, barbe, entretien. Les conseils de la maison, sans détour." line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Link className="jf" href={`/journal/${f.slug}`}>
            <div className="mask"><Fig m={{ ...f.cover, alt: f.title }} ratio="16/10" sizes="(max-width: 900px) 100vw, 58vw" /></div>
            <div><Meta a={f} /><h2 className="ja-title">{f.title}</h2><p className="ja-ex">{f.excerpt}</p><span className="ja-cta">Lire l’article <Arr /></span></div>
          </Link>
          <div className="jgrid">
            {rest.map((a, i) => (
              <Link className="ja" href={`/journal/${a.slug}`} key={a.slug}>
                <div className="mask"><Fig m={{ ...a.cover, alt: a.title }} ratio={i % 3 === 0 ? "4/5" : "4/3"} sizes="(max-width: 900px) 100vw, 45vw" /></div>
                <Meta a={a} /><h2 className="ja-title">{a.title}</h2><p className="ja-ex">{a.excerpt}</p><span className="ja-cta">Lire l’article <Arr /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBlock />
    </>
  );
}
