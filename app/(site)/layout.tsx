import { salon, services } from "@/lib/data";
import { A, DAYS, hoursOf, parseH } from "@/lib/site";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import { Curtain, Cursor, Loader } from "@/components/chrome/Overlays";
import MobileBar from "@/components/chrome/MobileBar";
import MotionRoot from "@/components/motion/MotionRoot";

function jsonLd() {
  const days: Record<string, string> = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };
  const spec = DAYS.map(([k]) => { const h = parseH(hoursOf(k)); return h ? { "@type": "OpeningHoursSpecification", dayOfWeek: "https://schema.org/" + days[k], opens: h.os, closes: h.cs } : null; }).filter(Boolean);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": salon.siteUrl + "/#salon",
    name: salon.name,
    url: salon.siteUrl,
    image: salon.siteUrl + "/opengraph-image.jpg",
    logo: salon.siteUrl + "/brand/finns-barber-logo.png",
    foundingDate: String(salon.founded),
    founder: { "@type": "Person", name: salon.founder },
    address: { "@type": "PostalAddress", streetAddress: A.street, postalCode: A.postalCode, addressLocality: A.city, addressCountry: A.country },
    openingHoursSpecification: spec,
    sameAs: [salon.instagram].filter(Boolean),
    makesOffer: services.map(s => ({ "@type": "Offer", price: parseInt(s.price, 10), priceCurrency: "EUR", itemOffered: { "@type": "Service", name: s.name } })),
    potentialAction: { "@type": "ReserveAction", target: salon.siteUrl + "/reserver" }
  };
  if (salon.phone) ld.telephone = salon.phone;
  if (salon.email) ld.email = salon.email;
  return JSON.stringify(ld);
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <a className="skip" href="#main">Aller au contenu</a>
      <Loader />
      <Nav />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <MobileBar />
      <Curtain />
      <Cursor />
      <MotionRoot />
    </>
  );
}
