"use client";

import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/lib/data";

/* Vidéo d’ouverture : version portrait sur mobile, paysage ailleurs. L’image fixe reste affichée
   si l’utilisateur réduit les animations ou économise ses données, et la vidéo se met en pause hors écran. */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    setSrc(matchMedia("(max-aspect-ratio: 4/5)").matches ? heroVideo.srcPortrait : heroVideo.src);
  }, []);

  useEffect(() => {
    const v = ref.current; if (!v || !src) return;
    v.play().catch(() => { /* lecture automatique refusée : l’image fixe reste visible */ });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.02 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <>
      <picture>
        <source media="(max-aspect-ratio: 4/5)" srcSet={heroVideo.posterPortrait} />
        <img className="hx-poster" src={heroVideo.poster} alt="" fetchPriority="high" />
      </picture>
      <video ref={ref} className={`hx-video ${ready ? "is-ready" : ""}`} src={src ?? undefined} muted loop playsInline autoPlay preload="auto"
        aria-label={heroVideo.alt} onPlaying={() => setReady(true)} />
    </>
  );
}
