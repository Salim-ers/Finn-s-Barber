import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/geist/index.css";
import "./globals.css";
import { salon } from "@/lib/data";

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

/* Racine commune : le site vitrine (app/(site)) et le tableau de bord (app/admin) ont chacun leur mise en page. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
