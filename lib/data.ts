/* =========================================================
   DONNÉES CENTRALISÉES — FINN’S BARBER
   Tout le contenu du site se modifie dans ce fichier.
   Sources : fiche Planity (01/10/2026), registres publics (SIREN 833 830 367).
   Règle : ne jamais inventer. Champ vide = placeholder « [À renseigner] ».
   ========================================================= */

export type Tone = "navy" | "warm" | "cream";
export type Media = { note: string; alt: string; tone: Tone; src?: string; video?: string; poster?: string; initial?: string; ratio?: string };
export type Service = { id: string; name: string; duration: string; price: string; short: string; long: string; media: string };
export type TeamMember = { name: string; photo: string };
export type Reviews = { rating: string; count: number; source: string; checkedAt: string; url: string; criteria: [string, string][]; items: { text: string; author: string; date: string }[] };
export type GalleryItem = Media & { cat: "cuts" | "fades" | "beards" | "details" | "shop"; size: "l" | "m" | "s"; ratio: string };
export type Article = { slug: string; cat: string; date: string; title: string; excerpt: string; cover: { note: string; tone: Tone; src?: string }; body: ({ p: string } | { h: string })[] };
/* =========================================================
   1. DONNÉES DU SALON — tout le contenu se modifie ici
   Sources : fiche Planity (01/10/2026), registres publics (SIREN 833 830 367)
   ========================================================= */
export const salon = {
  name: "Finn’s Barber",
  tagline: "Since 1999",
  founded: 1999,
  founder: "Khaldi Djilali",
  address: { street: "43 Rue Jean Jaurès", postalCode: "60100", city: "Creil", country: "FR" },
  phone: "",            // [À RENSEIGNER] ex. "03 44 00 00 00"
  email: "",            // [À RENSEIGNER]
  instagram: "https://www.instagram.com/finns.barber/", // compte public trouvé (@finns.barber) — à confirmer par le salon
  instagramHandle: "@finns.barber",
  tiktok: "",           // [À RENSEIGNER]
  planity: "https://www.planity.com/le-saloon-haircut-barber-60100-creil",
  // Domaine définitif : renseigner NEXT_PUBLIC_SITE_URL dans Vercel (ex. https://www.finnsbarber.fr)
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  openingHours: {
    monday: "Fermé",
    tuesday: "10:00 - 19:00",
    wednesday: "10:00 - 19:00",
    thursday: "10:00 - 19:00",
    friday: "10:00 - 19:00",
    saturday: "10:00 - 19:00",
    sunday: "10:00 - 19:00"
  },
  legal: {
    company: "FINN’S BARBER",
    form: "Société par actions simplifiée (SAS)",
    capital: "",        // [À RENSEIGNER]
    rcs: "RCS Compiègne 833 830 367",
    siren: "833 830 367",
    siret: "833 830 367 00011",
    vat: "FR17 833 830 367",
    director: "Yassir Khaldi",
    directorRole: "Président",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com" // à vérifier sur vercel.com/legal au moment de la mise en ligne
  }
};

export const services: Service[] = [
  { id: "coupe", name: "Coupe", duration: "20 min", price: "20 €",
    short: "Une coupe homme précise, travaillée dans le détail et adaptée au style du client.",
    long: "Coupe homme et finitions.", media: "s1" },
  { id: "coupe-barbe", name: "Coupe + Barbe", duration: "25 min", price: "25 €",
    short: "Coupe homme, barbe et finitions pour un résultat propre et structuré.",
    long: "Coupe, barbe et finitions.", media: "s2" }
];

/* Équipe : aucun rôle, aucune spécialité, aucune ancienneté tant que non fournis. */
export const team: TeamMember[] = [
  { name: "Yassir", photo: "" },
  { name: "Ayssem", photo: "" },
  { name: "Sami",   photo: "" },
  { name: "Mimine", photo: "" },
  { name: "Wassim", photo: "" }
];

/* Avis : valeurs relevées sur Planity, à mettre à jour régulièrement. Ne jamais inventer. */
export const reviews: Reviews = {
  rating: "5.0",
  count: 85,
  source: "Planity",
  checkedAt: "1er octobre 2026",
  url: "https://www.planity.com/le-saloon-haircut-barber-60100-creil",
  criteria: [["Accueil", "5,0"], ["Propreté", "5,0"], ["Cadre & ambiance", "5,0"], ["Qualité de la prestation", "5,0"]],
  items: [
    { text: "À l’heure et 10/10 pour la coupe.", author: "Client vérifié Planity", date: "13 août 2026" }
    // Ajouter d’autres avis réels ici : { text: "...", author: "...", date: "..." }
  ]
};

/* Photos & vidéos : déposer les fichiers dans /public/media puis renseigner src (ex. "/media/hero.jpg")
   ou video (ex. "/media/hero.mp4") + poster.
   Tant que src est vide, un emplacement de direction artistique s’affiche.
   ⚠ PHOTOS D’ILLUSTRATION : seules salon.jpg et salon-fauteuils.jpg montrent le vrai salon.
   Toutes les autres viennent d’Unsplash (licence libre, voir photoCredits) et servent à
   visualiser le rendu : les remplacer par des photos du salon avant la mise en ligne définitive,
   puis retirer les crédits correspondants. */
export const media: Record<string, Media> = {
  hero:    { note: "Barber en plein dégradé, mains et tondeuse", alt: "Barber réalisant un dégradé à la tondeuse", tone: "navy", src: "/media/hero-degrade.jpg", video: "", poster: "" },
  intro:   { note: "Le salon, lumière du jour", alt: "Intérieur du salon Finn’s Barber à Creil", tone: "warm", src: "/media/salon.jpg" },
  intro2:  { note: "Détail : peigne et ciseaux", alt: "Ciseaux de barbier en main", tone: "cream", src: "/media/ciseaux.jpg" },
  cut:     { note: "Finition des contours au rasoir, plein cadre", alt: "Finition au rasoir", tone: "navy", src: "/media/finition-rasoir.jpg", video: "" },
  g1:      { note: "Ciseaux sur peigne", alt: "Coupe aux ciseaux sur peigne", tone: "warm", src: "/media/geste-couper.jpg" },
  g2:      { note: "Tondeuse, transition du dégradé", alt: "Dégradé à la tondeuse", tone: "navy", src: "/media/geste-degrader.jpg" },
  g3:      { note: "Structure au peigne, face au miroir", alt: "Mise en forme de la coupe au peigne", tone: "cream", src: "/media/geste-structurer.jpg" },
  g4:      { note: "Contour net, barbe taillée", alt: "Contours au rasoir et barbe taillée", tone: "warm", src: "/media/geste-finaliser.jpg" },
  s1:      { note: "Coupe, vue de profil", alt: "Coupe homme vue de profil", tone: "navy", src: "/media/prestation-coupe.jpg" },
  s2:      { note: "Coupe + barbe, finitions", alt: "Taille de barbe aux ciseaux", tone: "warm", src: "/media/prestation-coupe-barbe.jpg" },
  story:   { note: "Le salon aujourd’hui, vue d’ensemble", alt: "Le salon Finn’s Barber", tone: "warm", src: "/media/salon.jpg" },
  archive: { note: "Archive familiale, si disponible", alt: "Fauteuil de barbier ancien dans la lumière", tone: "cream", src: "/media/heritage-fauteuil.jpg" },
  facade:  { note: "La façade, 43 rue Jean Jaurès", alt: "Fauteuils de barbier derrière une vitrine", tone: "navy", src: "/media/vitrine.jpg" },
  logo:    { note: "Coupe en cours, cadrage serré", alt: "Coupe en cours à la tondeuse", tone: "warm", src: "/media/coupe-en-cours.jpg" }
};

export const gallery: GalleryItem[] = ([
  { cat: "fades",   size: "l", ratio: "4/5",   tone: "navy",  note: "Dégradé bas, vue de dos", src: "/media/galerie-degrade-nuque.jpg" },
  { cat: "details", size: "s", ratio: "1/1",   tone: "cream", note: "Tondeuse sur le plan de travail", src: "/media/galerie-tondeuses.jpg" },
  { cat: "cuts",    size: "m", ratio: "3/4",   tone: "warm",  note: "Coupe texturée, vue de face", src: "/media/galerie-coupe-texturee.jpg" },
  { cat: "beards",  size: "m", ratio: "4/5",   tone: "navy",  note: "Barbe taillée, profil", src: "/media/galerie-barbe-profil.jpg" },
  { cat: "shop",    size: "l", ratio: "16/10", tone: "warm",  note: "Les fauteuils et les miroirs", src: "/media/salon.jpg" },
  { cat: "details", size: "s", ratio: "3/4",   tone: "navy",  note: "Rasoir et contour", src: "/media/galerie-rasoir-contour.jpg" },
  { cat: "cuts",    size: "s", ratio: "4/5",   tone: "cream", note: "Coupe courte aux ciseaux", src: "/media/galerie-ciseaux.jpg" },
  { cat: "fades",   size: "m", ratio: "1/1",   tone: "warm",  note: "Transition du dégradé, gros plan", src: "/media/galerie-transition.jpg" },
  { cat: "beards",  size: "s", ratio: "3/4",   tone: "navy",  note: "Ligne de barbe au rasoir", src: "/media/galerie-ligne-barbe.jpg" },
  { cat: "shop",    size: "m", ratio: "4/3",   tone: "cream", note: "La rangée de fauteuils", src: "/media/salon-fauteuils.jpg" }
] as Omit<GalleryItem, "alt">[]).map(g => ({ ...g, alt: g.note }));
export const CAT: Record<string, string> = { all: "Tout", cuts: "Coupes", fades: "Dégradés", beards: "Barbes", details: "Détails", shop: "Le salon" };

/* Crédits photo (affichés dans les mentions légales). Retirer un photographe dès que sa photo est remplacée. */
export const photoCredits = {
  salon: "Photographies du salon : Finn’s Barber.",
  stock: { source: "Unsplash", license: "https://unsplash.com/license", authors: [
    "Ace Maxwell", "Agustin Fernandez", "Ahmad Ebadi", "André Reis", "Damian Barczak", "Daria Andriianova",
    "Eduardo Cano Photo Co.", "Fábio Alves", "Gulom Nazarov", "Hai Phung", "Hannah Skelly", "Jerry Wei",
    "Josh Marty", "Mitchell Orr", "Mr Shave", "Nate Johnston", "Nathon Oski", "Peter Vimalis",
    "Redd Francisco", "Salah Regouane", "Tá Focando", "Ten", "YearOne"
  ] }
};

export const timeline = [
  { year: "1960s", title: "Les origines", text: "Premières racines du savoir-faire familial." },
  { year: "1999",  title: "Finn’s",       text: "Ouverture du salon à Creil." },
  { year: "Today", title: "The next cut", text: "Une nouvelle génération perpétue et modernise l’expérience." }
];

export const steps = [
  { t: "Couper",     d: "Le volume se décide aux ciseaux, mèche après mèche, selon la nature du cheveu.", m: "g1" },
  { t: "Dégrader",   d: "La tondeuse travaille les transitions jusqu’à ce que le passage devienne invisible.", m: "g2" },
  { t: "Structurer", d: "Les lignes se dessinent : la forme suit le visage, pas la tendance.", m: "g3" },
  { t: "Finaliser",  d: "Contours nets, barbe taillée, coiffage. Le détail qui signe la coupe.", m: "g4" }
];

/* Journal — structure CMS-friendly. Articles rédigés comme brouillons, dates à valider. */
export const journal: Article[] = [
  { slug: "combien-de-temps-garder-son-degrade", cat: "Entretien", date: "2026-09-22",
    title: "Combien de temps garder son dégradé ?",
    excerpt: "Un dégradé est net le jour J. Mais combien de temps reste-t-il propre ? Quelques repères pour savoir quand revenir.",
    cover: { note: "Dégradé, gros plan sur la nuque", tone: "navy", src: "/media/journal-degrade.jpg" },
    body: [
      { p: "Un dégradé se joue sur quelques millimètres. C’est ce qui fait sa netteté, et c’est aussi ce qui le rend éphémère : le cheveu pousse d’environ un centimètre par mois, et sur les zones les plus courtes, chaque millimètre se voit." },
      { h: "Les repères" },
      { p: "Pour un dégradé bas et très court, la transition reste nette une à deux semaines, puis commence à s’estomper. Un dégradé plus haut, ou plus long sur le dessus, tient en général un peu plus, autour de trois semaines." },
      { h: "Les signes qui ne trompent pas" },
      { p: "La transition devient visible, les contours autour des oreilles se brouillent, la nuque perd sa ligne. Quand deux de ces signes apparaissent, il est temps de repasser au fauteuil." },
      { h: "Le bon réflexe" },
      { p: "Si vous tenez à un dégradé toujours net, réservez votre prochain créneau dès votre coupe terminée. C’est le moyen le plus simple de ne jamais laisser la forme se défaire." }
    ] },
  { slug: "comment-entretenir-sa-barbe", cat: "Barbe", date: "2026-09-08",
    title: "Comment entretenir sa barbe ?",
    excerpt: "Une barbe soignée ne dépend pas seulement de la taille. Ce qui se passe entre deux rendez-vous compte autant.",
    cover: { note: "Barbe taillée, lumière rasante", tone: "warm", src: "/media/journal-barbe.jpg" },
    body: [
      { p: "Une barbe soignée ne dépend pas seulement de la taille. Ce qui se passe entre deux passages chez le barber compte autant." },
      { h: "Laver sans dessécher" },
      { p: "La barbe se lave deux à trois fois par semaine avec un nettoyant doux. Le savon pour les mains ou le gel douche dessèchent le poil et la peau en dessous." },
      { h: "Nourrir" },
      { p: "Quelques gouttes d’huile ou une noisette de baume, appliquées sur barbe légèrement humide, assouplissent le poil et limitent les démangeaisons." },
      { h: "Peigner, chaque jour" },
      { p: "Un peigne discipline le poil dans le bon sens et révèle la forme travaillée au salon. C’est le geste le plus simple, et le plus souvent oublié." },
      { h: "Laisser les lignes au barber" },
      { p: "Joues, cou, contour de la bouche : reprendre soi-même une ligne, c’est souvent la faire remonter. Mieux vaut entretenir le volume et confier les contours au fauteuil." }
    ] },
  { slug: "quelle-coupe-homme-choisir", cat: "Style", date: "2026-08-25",
    title: "Quelle coupe homme choisir ?",
    excerpt: "Il n’y a pas de bonne coupe dans l’absolu. Il y a celle qui va avec votre visage, votre cheveu et vos matins.",
    cover: { note: "Coupe texturée, vue de trois quarts", tone: "cream", src: "/media/journal-coupe.jpg" },
    body: [
      { p: "Il n’y a pas de bonne coupe dans l’absolu. Il y a celle qui va avec votre visage, votre cheveu et votre façon de vivre." },
      { h: "Partir du visage" },
      { p: "Un visage rond gagne à garder de la hauteur sur le dessus et des côtés plus courts. Un visage long supporte mieux des côtés un peu plus fournis. Un visage carré peut presque tout se permettre." },
      { h: "Écouter le cheveu" },
      { p: "Épais, fin, bouclé, frisé, avec des épis : la nature du cheveu décide de ce qui tiendra au quotidien. Une coupe qui lutte contre le cheveu ne dure jamais longtemps." },
      { h: "Penser au matin" },
      { p: "Combien de temps voulez-vous passer devant le miroir ? Une coupe texturée demande un peu de produit, un dégradé court presque rien." },
      { h: "En parler" },
      { p: "Le plus simple reste d’en discuter au fauteuil, avec une ou deux photos de référence. Le barber vous dira ce qui est réaliste avec votre cheveu." }
    ] },
  { slug: "comment-garder-des-contours-propres", cat: "Entretien", date: "2026-08-11",
    title: "Comment garder des contours propres ?",
    excerpt: "Les contours sont la première chose qui trahit une coupe qui vieillit. Quelques réflexes suffisent.",
    cover: { note: "Contour au rasoir, tempe", tone: "navy", src: "/media/journal-contours.jpg" },
    body: [
      { p: "Les contours sont la première chose qui trahit une coupe qui vieillit. Quelques réflexes suffisent pour les préserver." },
      { h: "Ne pas toucher à la ligne" },
      { p: "La ligne du front, des tempes et de la nuque est tracée avec un repère précis. La reprendre soi-même, c’est presque toujours la décaler." },
      { h: "Nettoyer seulement ce qui dépasse" },
      { p: "Entre deux rendez-vous, on peut retirer les poils clairement situés sous la ligne du cou, sans jamais remonter. Dans le doute, on n’y touche pas." },
      { h: "Prendre soin de la peau" },
      { p: "Une peau irritée rend les contours moins nets. Après la coupe, évitez de frotter la nuque et hydratez si besoin." },
      { h: "Revenir à temps" },
      { p: "Pour des contours toujours précis, un passage toutes les deux à trois semaines reste la meilleure solution." }
    ] },
  { slug: "a-quelle-frequence-retourner-chez-le-barber", cat: "Conseils", date: "2026-07-28",
    title: "À quelle fréquence retourner chez le barber ?",
    excerpt: "Tout dépend de la longueur et de la précision que vous voulez garder. Les rythmes qui fonctionnent.",
    cover: { note: "Le fauteuil, en attendant le prochain client", tone: "warm", src: "/media/salon.jpg" },
    body: [
      { p: "Tout dépend de la longueur et de la précision que vous voulez garder." },
      { h: "Coupes courtes et dégradés" },
      { p: "Toutes les deux à trois semaines. Au-delà, la transition s’efface et la coupe perd sa forme." },
      { h: "Coupes mi-longues" },
      { p: "Toutes les quatre à six semaines suffisent souvent, le temps que les pointes et les côtés reprennent du volume." },
      { h: "La barbe" },
      { p: "Toutes les deux à quatre semaines pour garder des lignes nettes, plus souvent si la barbe est courte et très dessinée." },
      { h: "Le bon réflexe" },
      { p: "Notez la date de votre dernière coupe, observez le moment où elle commence à vous gêner, et calez vos rendez-vous sur ce rythme." }
    ] },
  { slug: "comment-preparer-sa-prochaine-coupe", cat: "Conseils", date: "2026-07-14",
    title: "Comment préparer sa prochaine coupe ?",
    excerpt: "Une bonne coupe commence avant d’arriver au salon. Ce qu’il faut savoir, et ce qu’il faut dire.",
    cover: { note: "Miroir, avant la coupe", tone: "cream", src: "/media/journal-miroir.jpg" },
    body: [
      { p: "Une bonne coupe commence avant d’arriver au salon." },
      { h: "Venir avec une idée, même vague" },
      { p: "Une photo, le souvenir d’une coupe réussie, ou simplement ce qui vous gêne aujourd’hui : tout aide à se comprendre vite." },
      { h: "Dire ce qui n’a pas marché" },
      { p: "Un épi qui rebique, des côtés qui gonflent, une nuque qui repousse mal. Ces détails orientent la coupe autant que la photo." },
      { h: "Cheveux propres, sans produit" },
      { p: "Un cheveu propre et non coiffé montre sa vraie nature : son sens, son volume, ses épis." },
      { h: "Réserver, et arriver à l’heure" },
      { p: "La réservation en ligne sur Planity permet de choisir son créneau. Arriver quelques minutes en avance, c’est profiter pleinement de sa prestation." }
    ] }
];
