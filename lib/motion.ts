"use client";

/* =========================================================
   MOTION FINN’S — GSAP + ScrollTrigger + Lenis
   Ouverture de l’accueil, révélations, parallaxes, curseur, transitions.
   Les états initiaux masqués sont posés en CSS (html.motion) pour éviter tout flash.
   ========================================================= */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

export const isMotion = () => document.documentElement.classList.contains("motion");
export const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis: Lenis | null = null;
export function getLenis() { return lenis; }
export function initLenis() {
  if (lenis || !isMotion()) return;
  lenis = new Lenis({ lerp: 0.11 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;
}
export function scrollTo(target: number | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target, { immediate, force: true, duration: 1.4 });
  else window.scrollTo({ top: typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY, behavior: immediate ? "auto" : "smooth" });
}

/* ---------- Révélations génériques ---------- */
export function initReveals(scope: ParentNode) {
  if (!isMotion()) { $$(".fline", scope).forEach(f => f.classList.add("on")); return; }
  $$(".split", scope).forEach(el => {
    const inner = $$(".ln-i", el);
    if (!inner.length) return;
    gsap.set(inner, { y: 0, yPercent: 110 });
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(inner, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.09 }) });
  });
  $$(".fline:not(.fline--manual)", scope).forEach(el => {
    el.classList.remove("on");
    ScrollTrigger.create({ trigger: el, start: "top 94%", once: true, onEnter: () => el.classList.add("on") });
  });
  $$(".fade", scope).forEach(el => {
    gsap.set(el, { autoAlpha: 0, y: 16 });
    ScrollTrigger.create({ trigger: el, start: "top 93%", once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }) });
  });
  $$(".mask", scope).forEach(el => {
    const inner = $(".fig-in", el), base = inner?.dataset.speed ? 1.14 : 1;
    gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
    if (inner) gsap.set(inner, { scale: base * 1.2 });
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => {
      gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut" });
      if (inner) gsap.to(inner, { scale: base, duration: 1.8, ease: "power3.out" });
    } });
  });
  $$("[data-speed]", scope).forEach(el => {
    const amp = +(el.dataset.speed || 0) * (innerWidth < 760 ? 0.5 : innerWidth < 1100 ? 0.75 : 1);
    if (!el.closest(".mask") && el.classList.contains("fig-in")) gsap.set(el, { scale: 1.14 });
    gsap.fromTo(el, { yPercent: -amp }, { yPercent: amp, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

/* ---------- Hero : ouverture ----------
   Première visite de la session : « FINN’S » s’écrit sur fond ivoire, la vidéo apparaît à travers
   les lettres (mélange « screen »), puis on plonge dans le I jusqu’à ce que la vidéo remplisse l’écran.
   Ensuite, et à chaque retour sur l’accueil : la vidéo se pose, le titre et les boutons arrivent. */
export function heroIntro() {
  const hero = $("#hero"); if (!hero) return;
  const root = document.documentElement;
  const intro = $(".hx-intro", hero);
  const letters = $$(".hx-ch", hero), reveal = $$(".hx-reveal", hero), zoom = $(".hx-zoom", hero);
  if (!isMotion()) { $$(".fline", hero).forEach(f => f.classList.add("on")); return; }

  gsap.set(letters, { y: 0, yPercent: 115 });
  gsap.set(reveal, { autoAlpha: 0, y: 22 });
  const tl = gsap.timeline();
  let at = 0.1;

  if (intro && !root.classList.contains("no-loader") && getComputedStyle(intro).display !== "none") {
    try { sessionStorage.setItem("finns-loader", "1"); } catch { /* stockage indisponible */ }
    lenis?.stop();
    const word = $(".hx-intro-word", intro)!, chars = $$(".hx-ich", intro), stem = $(".hx-ich-i", intro);
    gsap.set(chars, { y: 0, yPercent: 120 });
    // Point de plongée : le centre du I (un trait plein, donc la vidéo remplit l’écran)
    const origin = () => {
      const w = word.getBoundingClientRect(), r = (stem || word).getBoundingClientRect();
      return `${r.left - w.left + r.width / 2}px ${r.top - w.top + r.height * 0.55}px`;
    };
    tl.to(chars, { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.07 }, 0.15)
      .add(() => $(".fline", intro)?.classList.add("on"), 0.7)
      .to($(".hx-intro-line", intro), { autoAlpha: 0, duration: 0.3 }, 1.75)
      .set(word, { transformOrigin: origin }, 1.8)
      .to(word, { scale: 90, duration: 1.35, ease: "power3.in" }, 1.8)
      .to(intro, { autoAlpha: 0, duration: 0.3 }, 2.95)
      .add(() => {
        root.classList.add("no-loader"); intro.style.display = "none"; lenis?.start();
        gsap.fromTo([$(".nav"), $(".mbar")].filter(Boolean), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, clearProps: "opacity,visibility" });
      }, 3.25);
    at = 2.85;
  }

  if (zoom) tl.fromTo(zoom, { scale: 1.16 }, { scale: 1, duration: 2.4, ease: "power3.out" }, at - 0.1);
  tl.to(letters, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.04 }, at + 0.1)
    .add(() => $$(".hx-in .fline", hero).forEach(f => f.classList.add("on")), at + 0.5)
    .to(reveal, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.08 }, at + 0.55);
}

/* Hero au défilement : la vidéo s’enfonce, le contenu remonte et s’efface (sans épinglage). */
function initHeroParallax() {
  const hero = $("#hero"); if (!hero || !isMotion()) return;
  const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
  gsap.to($(".hx-media", hero), { yPercent: 22, ease: "none", scrollTrigger: st });
  gsap.to($(".hx-in", hero), { yPercent: -14, autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "70% top" } });
}

/* ---------- Timeline ---------- */
function initTimeline(scope: ParentNode) {
  $$(".tl", scope).forEach(tl => {
    const items = $$(".tl-item", tl);
    const set = (p: number) => { tl.style.setProperty("--p", String(p)); items.forEach((it, i) => it.classList.toggle("on", p >= Math.max(0.02, i / items.length))); };
    if (!isMotion()) { set(1); return; }
    set(0);
    ScrollTrigger.create({ trigger: tl, start: "top 78%", end: "bottom 50%", scrub: true, onUpdate: s => set(s.progress) });
  });
}

/* ---------- The cut : photo en profondeur, mots qui montent (sans épinglage) ---------- */
function initCut() {
  const s = $("#cut"); if (!s || !isMotion()) return;
  const words = $$(".cut-words .ln-i", s), inner = $(".cut-bg .fig-in", s);
  if (inner) gsap.fromTo(inner, { scale: 1.22, yPercent: -7 }, { scale: 1.04, yPercent: 7, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true } });
  gsap.set(words, { y: 0, yPercent: 110 });
  ScrollTrigger.create({ trigger: s, start: "top 55%", once: true, onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.05, ease: "power4.out", stagger: 0.16 }) });
}

/* ---------- Boutons magnétiques ---------- */
export function initMagnetic(scope: ParentNode) {
  if (!isFine() || !isMotion()) return;
  $$<HTMLElement & { _mag?: boolean }>(".mag", scope).forEach(el => {
    if (el._mag) return; el._mag = true;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }), yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    el.addEventListener("pointermove", (e: PointerEvent) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.2); yTo((e.clientY - r.top - r.height / 2) * 0.3); });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

/* ---------- Curseur desktop ---------- */
export function initCursor() {
  const c = $("#cursor"); const root = document.documentElement;
  if (!c || !isFine() || !isMotion()) { root.classList.add("no-cursor"); return; }
  root.classList.add("has-cursor");
  const lbl = $("span", c)!;
  const xTo = gsap.quickTo(c, "x", { duration: 0.22, ease: "power3" }), yTo = gsap.quickTo(c, "y", { duration: 0.22, ease: "power3" });
  addEventListener("pointermove", e => { c.classList.add("on"); xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.addEventListener("pointerleave", () => c.classList.remove("on"));
  document.addEventListener("pointerover", e => {
    const el = e.target as Element;
    const t = el.closest<HTMLElement>("[data-cursor]"), l = el.closest("a,button");
    c.classList.toggle("lbl", !!t);
    lbl.textContent = t ? (t.dataset.cursor === "view" ? "View" : "Book") : "";
    c.classList.toggle("grow", !t && !!l);
  });
}

/* ---------- Loader (premier chargement de la session) ---------- */
export function runLoader(done: () => void) {
  const loader = $("#loader");
  const root = document.documentElement;
  if (!loader || root.classList.contains("no-loader") || !isMotion()) { if (loader) loader.style.display = "none"; done(); return; }
  // Accueil : l’ouverture du hero remplace le loader
  if ($("#hero .hx-intro")) { loader.style.display = "none"; done(); return; }
  try { sessionStorage.setItem("finns-loader", "1"); } catch { /* stockage indisponible */ }
  lenis?.stop();
  const ldIn = $(".ld-in", loader)!, lns = $$(".ln-i", ldIn);
  gsap.set(lns, { y: 0, yPercent: 110 }); gsap.set(ldIn, { opacity: 1 });
  gsap.timeline({ onComplete: () => { loader.style.display = "none"; root.classList.add("no-loader"); lenis?.start(); } }) // masqué, pas retiré : l’élément appartient à React
    .to(lns[0], { yPercent: 0, duration: 0.5, ease: "power3.out" }, 0.05)
    .to(lns[1], { yPercent: 0, duration: 0.5, ease: "power3.out" }, 0.18)
    .add(() => $(".fline", ldIn)?.classList.add("on"), 0.3)
    .to(ldIn, { y: -30, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.95)
    .to($(".ld-a", loader), { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, 1.0)
    .to($(".ld-b", loader), { yPercent: 100, duration: 0.55, ease: "power3.inOut" }, 1.0)
    .add(done, 1.0);
}

/* ---------- Rideau de transition ---------- */
export function curtainIn(cb: () => void) {
  const c = $("#curtain"); if (!c || !isMotion()) { cb(); return; }
  lenis?.stop();
  gsap.timeline()
    .set(c, { yPercent: 100, visibility: "visible" })
    .add(() => $(".fline", c)?.classList.add("on"))
    .to(c, { yPercent: 0, duration: 0.6, ease: "power3.inOut" })
    .add(cb);
}
export function curtainOut() {
  const c = $("#curtain"); if (!c || getComputedStyle(c).visibility === "hidden") { lenis?.start(); return; }
  gsap.timeline({ delay: 0.15, onComplete: () => { $(".fline", c)?.classList.remove("on"); gsap.set(c, { visibility: "hidden" }); lenis?.start(); } })
    .to(c, { yPercent: -100, duration: 0.75, ease: "power3.inOut" });
}

/* ---------- Initialisation d’une page ; renvoie le nettoyage ---------- */
export function initPage(): () => void {
  const main = $("#main")!, footer = $("#footer")!;
  initHeroParallax();
  initTimeline(main);
  initCut();
  initReveals(main);
  initReveals(footer);
  initMagnetic(document);
  ScrollTrigger.refresh();
  return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
}

export const refresh = () => ScrollTrigger.refresh();
