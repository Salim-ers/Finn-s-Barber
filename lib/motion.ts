"use client";

/* =========================================================
   MOTION FINN’S — GSAP + ScrollTrigger + Lenis
   Révélations, hero, séquence logo, sticky, curseur, transitions.
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

/* ---------- Hero ---------- */
export function heroIntro() {
  const hero = $("#hero"); if (!hero) return;
  if (!isMotion()) { $$(".fline", hero).forEach(f => f.classList.add("on")); return; }
  gsap.set($$(".hw .ln-i", hero), { y: 0, yPercent: 110 });
  gsap.set($$(".hi-fade", hero), { autoAlpha: 0, y: 14 });
  gsap.timeline()
    .to($$(".hw-1 .ln-i", hero), { yPercent: 0, duration: 1.15, ease: "power4.out" }, 0)
    .to($$(".hw-2 .ln-i", hero), { yPercent: 0, duration: 1.15, ease: "power4.out" }, 0.14)
    .add(() => $$(".fline", hero).forEach(f => f.classList.add("on")), 0.4)
    .fromTo($(".hero-img", hero), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "power3.inOut" }, 0.3)
    .fromTo($(".hero-img .fig-in", hero), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: "power3.out" }, 0.3)
    .to($$(".hi-fade", hero), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.07 }, 0.75)
    .fromTo($(".hs-in", hero), { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.8 }, 1.3);
}

function initHeroScroll() {
  const hero = $("#hero"); if (!hero || !isMotion()) return;
  const img = $(".hero-img", hero)!;
  const calc = () => {
    const W = hero.clientWidth, H = hero.clientHeight;
    let x = img.offsetLeft, y = img.offsetTop, p = img.offsetParent as HTMLElement | null;
    while (p && p !== hero) { x += p.offsetLeft; y += p.offsetTop; p = p.offsetParent as HTMLElement | null; }
    const w = img.offsetWidth, h = img.offsetHeight;
    return { x: W / 2 - (x + w / 2), y: H / 2 - (y + h / 2), s: Math.max(W / w, H / h) * 1.02 };
  };
  let c = calc();
  gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + Math.round(innerHeight * (innerWidth < 760 ? 0.7 : 1)), pin: true, scrub: true, invalidateOnRefresh: true, onRefreshInit: () => { c = calc(); } } })
    .to($(".hw-1", hero), { xPercent: -16, ease: "none", duration: 1 }, 0)
    .to($(".hw-2", hero), { xPercent: 16, ease: "none", duration: 1 }, 0)
    .to([$(".hero-meta", hero), $(".hero-line", hero), $(".hero-foot", hero), $(".hero-scroll", hero)], { autoAlpha: 0, y: -24, duration: 0.35, ease: "none" }, 0)
    .to($$(".ph-meta, .ph-flag", img), { autoAlpha: 0, duration: 0.2 }, 0)
    .to(img, { x: () => c.x, y: () => c.y, scale: () => c.s, ease: "power1.in", duration: 1 }, 0)
    .to([$(".hw-1", hero), $(".hw-2", hero)], { autoAlpha: 0, duration: 0.3 }, 0.6);
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

/* ---------- The cut ---------- */
function initCut() {
  const s = $("#cut"); if (!s || !isMotion()) return;
  const words = $$(".cut-words .ln-i", s), inner = $(".cut-bg .fig-in", s);
  gsap.set(words, { y: 0, yPercent: 110 }); gsap.set(inner, { scale: 1.18 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: "top top", end: () => "+=" + Math.round(innerHeight * (innerWidth < 760 ? 0.8 : 1.2)), pin: true, scrub: true } });
  tl.to(inner, { scale: 1.02, yPercent: 4, ease: "none", duration: 3 }, 0);
  words.forEach((w, i) => tl.to(w, { yPercent: 0, duration: 0.6, ease: "power2.out" }, 0.4 + i * 0.8));
}

/* ---------- Le geste (sticky) ---------- */
function initGeste(): IntersectionObserver | null {
  const g = $("#geste"); if (!g) return null;
  const st = $$(".gs", g), figs = $$(".gm-f", g);
  const set = (i: number) => { st.forEach((s, j) => s.classList.toggle("on", j === i)); figs.forEach((f, j) => f.classList.toggle("on", j <= i)); };
  set(0);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+((e.target as HTMLElement).dataset.i || 0)); }), { rootMargin: "-48% 0px -48% 0px" });
  st.forEach(s => io.observe(s));
  return io;
}

/* ---------- Galerie défilante ---------- */
function initMarquee(loops: gsap.core.Tween[]) {
  if (!isMotion() || innerWidth < 760) return;
  $$(".marq").forEach(m => {
    const t = $(".marq-track", m), dir = +(m.dataset.dir || -1);
    const tw = dir < 0 ? gsap.to(t, { xPercent: -50, duration: 90, ease: "none", repeat: -1 }) : gsap.fromTo(t, { xPercent: -50 }, { xPercent: 0, duration: 90, ease: "none", repeat: -1 });
    loops.push(tw);
    m.addEventListener("mouseenter", () => gsap.to(tw, { timeScale: 0.2, duration: 0.8 }));
    m.addEventListener("mouseleave", () => gsap.to(tw, { timeScale: 1, duration: 0.8 }));
    ScrollTrigger.create({ trigger: m, start: "top bottom", end: "bottom top", onToggle: s => { if (s.isActive) tw.play(); else tw.pause(); } });
  });
}

/* ---------- Séquence logo : FINN’S → photo → BARBER → SINCE 1999 → navy ---------- */
function initLogoSeq() {
  const s = $("#logoseq"); if (!s || !isMotion()) return;
  const letters = $$(".ls-l", s), barber = $$(".ls-barber .ln-i", s), photo = $(".ls-photo", s);
  const segs = $$(".ls-line .fl-s", s), txt = $(".ls-line .fl-t", s), navyP = $(".ls-navy", s);
  const mob = () => innerWidth < 760;
  gsap.set(barber, { y: 0, yPercent: 110 }); gsap.set(photo, { clipPath: "inset(50% 50% 50% 50%)" });
  gsap.set(segs, { scaleX: 0 }); gsap.set(txt, { autoAlpha: 0 }); gsap.set(navyP, { yPercent: 100 });
  gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: s, start: "top top", end: () => "+=" + Math.round(innerHeight * (mob() ? 1.5 : 2.2)), pin: true, scrub: true, invalidateOnRefresh: true } })
    .to(letters, { x: i => (i - 2.5) * innerWidth * (mob() ? 0.012 : 0.017), duration: 1, ease: "power1.inOut" }, 0)
    .to(photo, { clipPath: () => mob() ? "inset(22% 12% 22% 12%)" : "inset(14% 28% 14% 28%)", duration: 1.2, ease: "power2.inOut" }, 0.5)
    .to(barber, { yPercent: 0, duration: 0.8, ease: "power2.out" }, 1.3)
    .to(segs, { scaleX: 1, duration: 0.8 }, 2)
    .to(txt, { autoAlpha: 1, duration: 0.4 }, 2.25)
    .to(navyP, { yPercent: 0, duration: 1, ease: "power2.inOut" }, 3.2);
}

/* ---------- Aperçu prestation ---------- */
function initSvcPreview() {
  const pv = $("#svcprev");
  if (!pv || !isFine() || !isMotion() || innerWidth < 900) return;
  const xTo = gsap.quickTo(pv, "x", { duration: 0.6, ease: "power3" }), yTo = gsap.quickTo(pv, "y", { duration: 0.6, ease: "power3" });
  $$("[data-prev]").forEach(a => {
    a.addEventListener("pointerenter", (e: PointerEvent) => {
      $$(".sp-f", pv).forEach(f => f.classList.toggle("on", f.dataset.i === a.dataset.prev));
      gsap.set(pv, { x: e.clientX + 30, y: e.clientY - 140 });
      gsap.to(pv, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    });
    a.addEventListener("pointermove", (e: PointerEvent) => { xTo(e.clientX + 30); yTo(e.clientY - 140); });
    a.addEventListener("pointerleave", () => gsap.to(pv, { autoAlpha: 0, scale: 0.94, duration: 0.35, overwrite: "auto" }));
  });
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
  try { sessionStorage.setItem("finns-loader", "1"); } catch { /* stockage indisponible */ }
  lenis?.stop();
  const ldIn = $(".ld-in", loader)!, lns = $$(".ln-i", ldIn);
  gsap.set(lns, { y: 0, yPercent: 110 }); gsap.set(ldIn, { opacity: 1 });
  gsap.timeline({ onComplete: () => { loader.style.display = "none"; lenis?.start(); } }) // masqué, pas retiré : l’élément appartient à React
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
  const loops: gsap.core.Tween[] = [];
  // Ordre du DOM : épingles d’abord, révélations ensuite (calculs ScrollTrigger corrects)
  initHeroScroll();
  initTimeline(main);
  initCut();
  const io = initGeste();
  initMarquee(loops);
  initLogoSeq();
  initSvcPreview();
  initReveals(main);
  initReveals(footer);
  initMagnetic(document);
  ScrollTrigger.refresh();
  return () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    loops.forEach(t => t.kill());
    io?.disconnect();
  };
}

export const refresh = () => ScrollTrigger.refresh();
