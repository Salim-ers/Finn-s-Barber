# Finn’s Barber — site vitrine

Next.js 16 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis
Polices auto-hébergées (Fraunces, Geist) : aucune requête vers Google Fonts.

## Mettre en ligne sur Vercel (≈ 5 minutes)

### Option A — via GitHub (recommandée)
1. Créez un dépôt sur github.com et envoyez-y ce dossier :
   ```bash
   git init && git add . && git commit -m "Finn's Barber"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/finns-barber.git
   git push -u origin main
   ```
2. Sur https://vercel.com/new → « Import Git Repository » → choisissez le dépôt.
3. Vercel détecte Next.js automatiquement : cliquez sur **Deploy**, aucun réglage nécessaire.
4. Chaque `git push` redéploie ensuite le site automatiquement.

### Option B — en ligne de commande
```bash
npm install
npx vercel          # première fois : connexion + création du projet (aperçu)
npx vercel --prod   # mise en production
```

### Après le premier déploiement
- **Domaine** : Vercel → Project → Settings → Domains → ajoutez votre domaine et suivez les indications DNS.
- **URL canonique** : Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = `https://www.votre-domaine.fr`, puis redéployez.
  Sans cette variable, l’URL de production Vercel est utilisée automatiquement (sitemap, canonical, données structurées).
- **Google** : déclarez le site dans Google Search Console, soumettez `/sitemap.xml`, et ajoutez l’URL dans la fiche Google Business Profile.

## Travailler en local
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # vérification de production
```
Node.js 20.9 ou plus récent.

## Modifier le contenu
Tout est centralisé dans **`lib/data.ts`** : coordonnées, horaires, tarifs, prestations, équipe, avis, galerie, journal, mentions légales.

À compléter (affiché « [À renseigner] » tant que vide) : `phone`, `email`, `tiktok`, `legal.capital`.
À vérifier : `legal.host` (Vercel Inc.) et le compte Instagram `@finns.barber`.

### Photos et vidéos
1. Déposez les fichiers dans `public/media/`.
2. Renseignez-les dans `lib/data.ts` (`media`, `team[].photo`, `gallery[].src`, `journal[].cover.src`) :
   ```ts
   hero: { ..., src: "/media/hero.jpg" }
   cut:  { ..., video: "/media/the-cut.mp4", poster: "/media/the-cut.jpg" }
   ```
Tant qu’un `src` est vide, un emplacement « Photo à fournir » s’affiche. Next.js convertit les images en AVIF/WebP.

**Photos actuelles :** `salon.jpg` et `salon-fauteuils.jpg` sont de vraies photos du salon. Les autres sont des photos d’illustration Unsplash (licence libre, usage commercial autorisé) : à remplacer par des photos du salon, en retirant au fur et à mesure les photographes de `photoCredits` dans `lib/data.ts`. Les portraits de l’équipe restent volontairement vides : ils doivent montrer les vrais barbers.

### Avis clients
`reviews` dans `lib/data.ts` : note, nombre d’avis et date de relevé à mettre à jour. Uniquement des avis réels, avec l’accord de leurs auteurs.

## Structure
```
app/                 pages + sitemap.ts, robots.ts, image de partage
components/          ui.tsx, navigation, footer, galerie, contact, sections de l’accueil
lib/data.ts          TOUT le contenu
lib/motion.ts        animations (GSAP, ScrollTrigger, Lenis)
public/brand/        logo d’origine
public/media/        photos et vidéos du salon
```

## Accessibilité & performance
- « Réduire les animations » respecté : tout reste lisible sans animation.
- Navigation clavier, focus visibles, lien d’évitement, lightbox au clavier et au swipe.
- Pages statiques, polices auto-hébergées, images optimisées.
