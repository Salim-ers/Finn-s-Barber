import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { conseils, salon } from "@/lib/data";
import { fmtDate, readTime } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Arr, BookButton, CtaBlock, FLine, Fig, Lines } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return conseils.map(a => ({ slug: a.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = conseils.find(x => x.slug === slug);
  if (!a) return {};
  return pageMeta(`${a.title} | Conseils Finn’s Barber`, a.excerpt, `/conseils/${a.slug}`);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = conseils.find(x => x.slug === slug);
  if (!a) notFound();
  const next = conseils[(conseils.indexOf(a) + 1) % conseils.length];
  const ld = {
    "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt,
    datePublished: a.date, inLanguage: "fr-FR",
    author: { "@type": "Organization", name: salon.name }, publisher: { "@type": "Organization", name: salon.name }
  };
  return (
    <>
      <article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <header className="phero cream">
          <div className="wrap">
            <p className="label tick fade"><Link className="ul" href="/conseils">Conseils</Link> / {a.cat}</p>
            <h1 className="art-title split"><Lines text={a.title} /></h1>
            <p className="art-meta label fade"><time dateTime={a.date}>{fmtDate(a.date)}</time><span>{readTime(a)} min de lecture</span></p>
            <div className="phero-line"><FLine text="Les conseils Finn’s" /></div>
          </div>
        </header>
        <div className="wrap"><div className="mask"><Fig m={{ ...a.cover, alt: a.title }} ratio="16/8" speed={5} eager sizes="100vw" /></div></div>
        <div className="wrap art-body">
          {a.body.map((b, i) => ("h" in b ? <h2 key={i}>{b.h}</h2> : <p key={i}>{b.p}</p>))}
          <aside className="art-aside"><p className="label">Votre prochaine coupe</p><BookButton label="Réserver ma coupe" /></aside>
        </div>
        <section className="sec cream art-next" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <p className="label tick">Article suivant</p>
            <Link href={`/conseils/${next.slug}`}><span className="ja-title" style={{ margin: 0 }}>{next.title}</span><Arr /></Link>
          </div>
        </section>
      </article>
      <CtaBlock />
    </>
  );
}
