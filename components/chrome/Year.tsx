"use client";
import { useEffect, useState } from "react";

/* Année courante, mise à jour côté client (le site est généré statiquement). */
export default function Year({ initial }: { initial: number }) {
  const [y, setY] = useState(initial);
  useEffect(() => setY(new Date().getFullYear()), []);
  return <>{y}</>;
}
