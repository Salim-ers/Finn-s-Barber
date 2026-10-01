import Link from "next/link";
import { salon } from "@/lib/data";
import { telHref } from "@/lib/site";
import { Arr, FLine } from "@/components/ui";

/* Loader (premier chargement uniquement), rideau de transition, curseur, barre mobile */
export function Loader() {
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <div className="ld-half ld-a" /><div className="ld-half ld-b" />
      <div className="ld-in">
        <div className="wm"><span className="ln"><span className="ln-i">Finn’s</span></span></div>
        <div className="wm"><span className="ln"><span className="ln-i">Barber</span></span></div>
        <div className="ld-line"><FLine className="fline--manual" /></div>
      </div>
    </div>
  );
}

export function Curtain() {
  return (
    <div className="curtain" id="curtain" aria-hidden="true">
      <div className="cur-in"><span className="wm cur-wm">Finn’s</span><FLine className="fline--manual" /></div>
    </div>
  );
}

export function Cursor() {
  return <div className="cursor" id="cursor" aria-hidden="true"><span /></div>;
}

export function MobileBar() {
  return (
    <div className="mbar">
      {telHref ? <a className="mbar-call" href={telHref}>Appeler</a> : <Link className="mbar-call" href="/contact">Appeler</Link>}
      <a className="mbar-book" href={salon.planity} target="_blank" rel="noopener">Prendre RDV <Arr /><span className="sr"> (Planity, nouvel onglet)</span></a>
    </div>
  );
}
