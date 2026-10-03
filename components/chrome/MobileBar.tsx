"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mapsUrl, telHref } from "@/lib/site";
import { Arr } from "@/components/ui";

/* Barre d’action sur téléphone. Masquée là où l’on réserve déjà. */
export default function MobileBar() {
  const path = usePathname();
  if (path.startsWith("/reserver") || path.startsWith("/rdv")) return null;
  return (
    <div className="mbar">
      {telHref ? <a className="mbar-call" href={telHref}>Appeler</a> : <a className="mbar-call" href={mapsUrl} target="_blank" rel="noopener">Itinéraire</a>}
      <Link className="mbar-book" href="/reserver">Prendre RDV <Arr /></Link>
    </div>
  );
}
