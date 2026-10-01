import Link from "next/link";
import { salon } from "@/lib/data";
import { A, MNAV, mapsUrl } from "@/lib/site";
import { FLine, Lines } from "@/components/ui";
import Year from "./Year";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="wrap">
        <p className="ft-wm wm split" aria-hidden="true"><Lines text={"Finn’s\nBarber"} /></p>
        <div className="ft-line"><FLine /></div>
        <div className="ft-grid">
          <div className="ft-col">
            <h2 className="label">Le salon</h2>
            <address>{salon.name}<br />{A.street}<br />{A.postalCode} {A.city}</address>
            <a className="ul" href={mapsUrl} target="_blank" rel="noopener">Itinéraire</a>
          </div>
          <nav className="ft-col" aria-label="Pied de page">
            <h2 className="label">Navigation</h2>
            <ul>{MNAV.map(([h, l]) => <li key={h}><Link className="ul" href={h}>{l}</Link></li>)}</ul>
          </nav>
          <div className="ft-col">
            <h2 className="label">Réserver &amp; suivre</h2>
            <ul>
              <li><a className="ul" href={salon.planity} target="_blank" rel="noopener">Planity</a></li>
              {salon.instagram && <li><a className="ul" href={salon.instagram} target="_blank" rel="noopener">Instagram</a></li>}
              {salon.tiktok && <li><a className="ul" href={salon.tiktok} target="_blank" rel="noopener">TikTok</a></li>}
            </ul>
          </div>
          <div className="ft-col">
            <h2 className="label">Informations</h2>
            <ul>
              <li><Link className="ul" href="/mentions-legales">Mentions légales</Link></li>
              <li><Link className="ul" href="/politique-confidentialite">Politique de confidentialité</Link></li>
              <li><Link className="ul" href="/cookies">Gestion des cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="ft-bottom label"><span>Creil, France</span><span>© <Year initial={new Date().getFullYear()} /> Finn’s Barber</span></div>
      </div>
    </footer>
  );
}
