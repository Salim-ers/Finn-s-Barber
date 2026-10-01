"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAT, gallery, type GalleryItem } from "@/lib/data";
import { pad2 } from "@/lib/site";
import { Fig } from "@/components/ui";

type LenisLike = { stop: () => void; start: () => void } | undefined;
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

export default function GalleryGrid() {
  const cats = ["all", ...Array.from(new Set(gallery.map(g => g.cat)))];
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const returnRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);

  const visible: GalleryItem[] = gallery.filter(g => filter === "all" || g.cat === filter);
  const step = useCallback((d: number) => setOpen(i => (i === null ? i : (i + d + visible.length) % visible.length)), [visible.length]);
  const close = useCallback(() => { setOpen(null); returnRef.current?.focus(); }, []);

  useEffect(() => {
    const isOpen = open !== null;
    document.body.classList.toggle("lb-open", isOpen);
    if (isOpen) { lenis()?.stop(); closeRef.current?.focus(); } else lenis()?.start();
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  const cur = open !== null ? visible[open] : null;

  return (
    <>
      <div className="filters" role="group" aria-label="Filtrer la galerie">
        {cats.map(c => <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>{CAT[c]}</button>)}
      </div>
      <div className="ggrid">
        {visible.map((g, i) => (
          <div className={`gi ${g.size} in`} key={filter + gallery.indexOf(g)} data-cursor="view">
            <Fig m={g} n={gallery.indexOf(g) + 1} sizes="(max-width: 900px) 50vw, 40vw" />
            <span className="gi-cap label">{CAT[g.cat]}</span>
            <button className="gi-btn" type="button" aria-label={`Agrandir : ${g.note}`} onClick={e => { returnRef.current = e.currentTarget; setOpen(i); }} />
          </div>
        ))}
      </div>

      <div className={`lb ${cur ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Galerie Finn’s Barber" inert={!cur}
        onPointerDown={e => { startX.current = e.clientX; }}
        onPointerUp={e => { if (startX.current !== null && Math.abs(e.clientX - startX.current) > 50) step(e.clientX < startX.current ? 1 : -1); startX.current = null; }}>
        <div className="lb-top">
          <span className="label">Finn’s / Creil</span>
          <span className="label lb-count">{open !== null ? `${pad2(open + 1)} / ${pad2(visible.length)}` : ""}</span>
          <button ref={closeRef} className="lb-close" type="button" aria-label="Fermer la galerie" onClick={close}>×</button>
        </div>
        <div className="lb-stage">{cur && <Fig m={cur} n={gallery.indexOf(cur) + 1} sizes="90vw" />}</div>
        <div className="lb-bot">
          <button className="lb-prev" type="button" aria-label="Image précédente" onClick={() => step(-1)}>←</button>
          <p className="lb-cap label">{cur ? `${CAT[cur.cat]} — ${cur.note}` : ""}</p>
          <button className="lb-next" type="button" aria-label="Image suivante" onClick={() => step(1)}>→</button>
        </div>
      </div>
    </>
  );
}
