"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, MNAV, pad2 } from "@/lib/site";
import { Arr, FLine, BookButton } from "@/components/ui";

type LenisLike = { stop: () => void; start: () => void } | undefined;
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const top = "/" + (pathname.split("/")[1] || "");
  const light = pathname === "/" && !scrolled && !open; // menu clair au-dessus de la vidéo d’accueil

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (open) lenis()?.stop(); else lenis()?.start();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) { setOpen(false); burger.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${open ? "menu-open" : ""} ${light ? "nav--light" : ""}`}>
        <Link className="nav-logo" href="/" aria-label="Finn’s Barber, accueil">
          <span className="nav-wm">Finn’s</span><span className="nav-sub">Barber · Creil</span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          {NAV.map(([h, l]) => <Link key={h} href={h} aria-current={top === h ? "page" : undefined}>{l}</Link>)}
        </nav>
        <Link className="btn nav-cta mag" href="/reserver">Prendre RDV <Arr /></Link>
        <button ref={burger} className="nav-burger" type="button" aria-expanded={open} aria-controls="mmenu" onClick={() => setOpen(o => !o)}>
          <span /><span /><span className="sr">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
        </button>
      </header>

      <div className={`mmenu ${open ? "open" : ""}`} id="mmenu" inert={!open}>
        <nav aria-label="Menu mobile">
          <ol className="mm-list">
            {MNAV.map(([h, l], i) => (
              <li key={h}>
                <Link href={h} onClick={() => setOpen(false)} aria-current={top === h ? "page" : undefined}>
                  <span className="mm-n">{pad2(i + 1)}</span>
                  <span className="mm-t"><span className="ln"><span className="ln-i" style={{ transitionDelay: `${120 + i * 55}ms` }}>{l}</span></span></span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mm-foot">
          <FLine className="on fline--manual" />
          <div className="mm-meta label"><span>Creil — France</span><span>Since 1999</span></div>
          <BookButton label="Prendre RDV" className="btn--solid-cream btn--lg" />
        </div>
      </div>
    </>
  );
}
