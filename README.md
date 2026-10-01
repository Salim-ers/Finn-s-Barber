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

## Réservation en ligne et tableau de bord
Les clients réservent directement sur le site (`/reserver`) pour chaque prestation de `services`. Le salon gère tout depuis **`/admin`** : agenda du jour et de la semaine, pointage (venu, absent), rendez-vous pris par téléphone, créneaux bloqués, fermetures exceptionnelles, fichier clients avec historique et fiche, nombre de coiffeurs en simultané.

### Mise en service sur Vercel (≈ 10 minutes, gratuit)
1. **Base de données** : Vercel → projet → *Storage* → *Create Database* → **Neon (Postgres)** → reliez-la au projet. La variable `DATABASE_URL` est ajoutée automatiquement. Les tables se créent seules au premier rendez-vous.
2. **Accès au tableau de bord** : *Settings* → *Environment Variables* :
   - `ADMIN_PASSWORD` : le mot de passe du salon pour `/admin` ;
   - `SESSION_SECRET` : une longue chaîne aléatoire (ex. `openssl rand -base64 32`).
3. **E-mails de confirmation (facultatif)** : créez un compte sur resend.com, vérifiez le domaine du site, puis ajoutez :
   - `RESEND_API_KEY` ;
   - `MAIL_FROM`, par exemple `Finn’s Barber <rdv@finnsbarber.fr>` ;
   - `SALON_NOTIFY_EMAIL` : l’adresse qui reçoit chaque réservation et annulation (sinon `salon.email`).

   Sans ces variables, rien n’est envoyé : le client garde son lien personnel « Gérer mon rendez-vous » à l’écran.
4. **Redéployez** (Deployments → ⋯ → Redeploy).

Tant que `DATABASE_URL` n’est pas configurée, la page de réservation affiche un message d’indisponibilité au lieu d’une erreur.

### Règles (modifiables dans `lib/data.ts`, objet `booking`)
- un créneau toutes les 15 minutes, dans les horaires d’ouverture (`openingHours`) ;
- au plus tôt 1 h à l’avance, au plus tard 30 jours à l’avance ;
- annulation en ligne jusqu’à 2 h avant ;
- 2 rendez-vous à venir maximum par numéro de téléphone ;
- un créneau reste proposé tant qu’un coiffeur est libre (nombre réglable dans `/admin` → Réglages, 0 = réservation suspendue).

Deux réservations simultanées ne peuvent pas prendre la même dernière place (verrou en base). Un champ piège et une limite par connexion freinent les robots.

> **Planity** : si l’agenda Planity du salon reste ouvert, deux agendas coexistent et un même créneau peut être pris des deux côtés. Fermez la prise de rendez-vous Planity ou bloquez les créneaux correspondants dans `/admin`.

### En local
`npm run dev` suffit : sans `DATABASE_URL`, une base Postgres embarquée est créée dans `.data/` (ignorée par Git). Mot de passe du tableau de bord en local : `finns`.

## Modifier le contenu
Tout est centralisé dans **`lib/data.ts`** : coordonnées, horaires, tarifs, prestations, règles de réservation, avis, galerie, conseils, mentions légales.

À compléter (affiché « [À renseigner] » tant que vide) : `phone`, `email`, `legal.capital`.
À vérifier : `legal.host` (Vercel Inc.) et le compte Instagram `@finns.barber`.

### Photos et vidéos
1. Déposez les fichiers dans `public/media/`.
2. Renseignez-les dans `lib/data.ts` (`media`, `gallery[].src`, `conseils[].cover.src`) :
   ```ts
   hero: { ..., src: "/media/hero.jpg" }
   cut:  { ..., video: "/media/the-cut.mp4", poster: "/media/the-cut.jpg" }
   ```
Tant qu’un `src` est vide, un emplacement « Photo à fournir » s’affiche. Next.js convertit les images en AVIF/WebP.

**Photos actuelles :** seule `salon.jpg` montre le vrai salon. Les autres sont des photos d’illustration Unsplash et Pexels (licences libres, usage commercial autorisé), choisies sans tatouage visible et sans doublon : chaque photo n’apparaît qu’une fois. À remplacer par des photos du salon, en retirant au fur et à mesure les photographes de `photoCredits`.

### Avis clients
`reviews` dans `lib/data.ts` : avis avec commentaire relevés sur la fiche Planity du salon (textes d’origine, prénom et initiale), note globale, nombre d’avis et date de relevé. Ils s’affichent sur l’accueil et sur `/avis`. À mettre à jour régulièrement, uniquement avec de vrais avis.

### Carte
La page Contact affiche une carte Google Maps interactive. Google déposant des cookies, la carte ne se charge qu’après un clic du visiteur (exigence CNIL) ; ce choix est ensuite mémorisé dans son navigateur.

## Structure
```
app/(site)/          pages du site (accueil, prestations, réservation, avis, conseils, contact…)
app/admin/           tableau de bord du salon
app/api/             réservation, annulation, API du tableau de bord
components/          ui.tsx, navigation, footer, galerie, contact, réservation, tableau de bord
lib/data.ts          TOUT le contenu
lib/booking/         créneaux, fuseau horaire, requêtes, e-mails
lib/db.ts            connexion Postgres (Neon en ligne, PGlite en local)
lib/motion.ts        animations (GSAP, ScrollTrigger, Lenis)
public/media/        photos du site
```

## Accessibilité & performance
- « Réduire les animations » respecté : tout reste lisible sans animation.
- Navigation clavier, focus visibles, lien d’évitement, lightbox au clavier et au swipe.
- Pages vitrines statiques, polices auto-hébergées, images optimisées.
