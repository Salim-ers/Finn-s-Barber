import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/geist/index.css";
import "./globals.css";
import { salon, services } from "@/lib/data";
import { A, DAYS, hoursOf, parseH } from "@/lib/site";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import { Curtain, Cursor, Loader, MobileBar } from "@/components/chrome/Overlays";
import MotionRoot from "@/components/motion/MotionRoot";

export const metadata: Metadata = {
  metadataBase: new URL(salon.siteUrl),
  title: { default: "Finn’s Barber Creil | Coiffeur Homme & Barber", template: "%s" },
  description: "Finn’s Barber à Creil : salon de coiffure homme depuis 1999. Découvrez nos prestations et prenez rendez-vous en ligne.",
  applicationName: "Finn’s Barber",
  formatDetection: { telephone: false },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F4EEDF"
};

/* Avant le premier rendu : active le motion (sauf « réduire les animations »),
   saute le loader s’il a déjà été joué, et filet de sécurité si le JS échoue. */
const bootScript = `(function(){var d=document.documentElement;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');}if(sessionStorage.getItem('finns-loader'))d.classList.add('no-loader');}catch(e){}setTimeout(function(){if(!window.__finnsMotion){d.classList.remove('motion');d.classList.add('no-loader');}},4000);})();`;

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
    sameAs: [salon.planity, salon.instagram, salon.tiktok].filter(Boolean),
    makesOffer: services.map(s => ({ "@type": "Offer", price: parseInt(s.price, 10), priceCurrency: "EUR", itemOffered: { "@type": "Service", name: s.name } }))
  };
  if (salon.phone) ld.telephone = salon.phone;
  if (salon.email) ld.email = salon.email;
  return JSON.stringify(ld);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      </head>
      <body>
        <a className="skip" href="#main">Aller au contenu</a>
        <Loader />
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <MobileBar />
        <Curtain />
        <Cursor />
        <MotionRoot />
      </body>
    </html>
  );
}
