"use client";

import { useEffect, useState } from "react";
import { fullAddress, mapsEmbedUrl, mapsUrl } from "@/lib/site";
import MapSchematic from "./MapSchematic";

const KEY = "finns-maps-ok";

/* Carte Google Maps interactive. Google dépose des cookies : la carte ne se charge
   qu’après accord du visiteur (exigence CNIL), accord mémorisé dans son navigateur. */
export default function GoogleMap() {
  const [ok, setOk] = useState(false);
  useEffect(() => { try { if (localStorage.getItem(KEY) === "1") setOk(true); } catch { /* stockage indisponible */ } }, []);
  const accept = () => { setOk(true); try { localStorage.setItem(KEY, "1"); } catch { /* stockage indisponible */ } };

  return (
    <div className="gmap" data-lenis-prevent>
      {ok ? (
        <iframe className="gmap-frame" src={mapsEmbedUrl} title={`Carte Google Maps : Finn’s Barber, ${fullAddress}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <div className="gmap-ph">
          <MapSchematic />
          <div className="gmap-card">
            <p className="label">Carte interactive</p>
            <p className="gmap-txt">La carte est fournie par Google Maps, qui dépose ses propres cookies à l’affichage.</p>
            <div className="gmap-btns">
              <button className="btn" type="button" onClick={accept}>Afficher la carte</button>
              <a className="btn btn--ghost" href={mapsUrl} target="_blank" rel="noopener">Itinéraire</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
