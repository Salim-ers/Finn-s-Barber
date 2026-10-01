"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { curtainIn, curtainOut, heroIntro, initCursor, initLenis, initMagnetic, initPage, isMotion, refresh, runLoader, scrollTo } from "@/lib/motion";

/* Orchestration globale du motion : Lenis, loader, transitions de page, révélations. */
export default function MotionRoot() {
  const pathname = usePathname();
  const router = useRouter();
  const first = useRef(true);

  // Une seule fois : smooth scroll, curseur, interception des liens internes pour le rideau
  useEffect(() => {
    (window as unknown as { __finnsMotion: boolean }).__finnsMotion = true;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    initLenis();
    initCursor();
    initMagnetic(document);

    const onClick = (e: MouseEvent) => {
      const el = e.target as Element;
      const s = el.closest<HTMLElement>("[data-scrollto]");
      if (s) { const t = document.querySelector<HTMLElement>(s.dataset.scrollto || ""); if (t) scrollTo(t); return; }
      const a = el.closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.hash && url.pathname === location.pathname) return;
      e.preventDefault();
      if (url.pathname === location.pathname) { scrollTo(0); return; }
      const go = () => router.push(url.pathname + url.search, { scroll: false });
      if (isMotion()) curtainIn(go); else go();
    };
    document.addEventListener("click", onClick, true);
    if (document.fonts) document.fonts.ready.then(refresh);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // À chaque page
  useEffect(() => {
    scrollTo(0, true);
    let cleanup = () => {};
    const start = () => { cleanup = initPage(); heroIntro(); };
    if (first.current) { first.current = false; runLoader(start); }
    else { start(); curtainOut(); document.getElementById("main")?.focus({ preventScroll: true }); }
    return () => cleanup();
  }, [pathname]);

  return null;
}
