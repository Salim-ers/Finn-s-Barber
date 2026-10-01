const streets = ["M0 70 L600 40", "M0 160 C150 150 320 175 600 130", "M0 300 L600 270", "M0 390 C200 370 400 410 600 380", "M90 0 L60 450", "M200 0 C215 160 190 300 230 450", "M430 0 L470 450", "M540 0 L520 450", "M0 230 L180 200"];

/* Plan schématique aux couleurs Finn’s (aucun script tiers, aucun cookie). */
export default function MapSchematic() {
  return (
    <svg viewBox="0 0 600 450" role="img" aria-label="Plan schématique : Finn’s Barber, 43 rue Jean Jaurès à Creil">
      <rect width="600" height="450" fill="#F4EEDF" />
      <path d="M-20 455 C120 360 160 300 260 250 S470 120 620 60" fill="none" stroke="#C3B59B" strokeOpacity=".35" strokeWidth="34" />
      {streets.map(d => <path key={d} d={d} fill="none" stroke="#071B2E" strokeOpacity=".16" strokeWidth="1.2" />)}
      <path id="rjj" d="M40 420 C150 340 230 300 320 220 S470 90 580 30" fill="none" stroke="#071B2E" strokeWidth="2.2" />
      <text fontFamily="Geist Variable, Arial, sans-serif" fontSize="11" letterSpacing="2.2" fill="#071B2E"><textPath href="#rjj" startOffset="8%">RUE JEAN JAURÈS</textPath></text>
      <circle cx="331" cy="210" r="22" fill="none" stroke="#B7A58A" strokeWidth="1" />
      <rect x="325" y="204" width="12" height="12" fill="#071B2E" transform="rotate(45 331 210)" />
      <g transform="translate(352 168)">
        <rect width="172" height="44" fill="#071B2E" />
        <text x="14" y="20" fontFamily="Fraunces Variable, Georgia, serif" fontWeight="700" fontSize="15" fill="#F4EEDF">FINN’S BARBER</text>
        <text x="14" y="34" fontFamily="Geist Variable, Arial, sans-serif" fontSize="9.5" letterSpacing="1.4" fill="#C3B59B">43 RUE JEAN JAURÈS</text>
      </g>
      <text x="24" y="34" fontFamily="Geist Variable, Arial, sans-serif" fontSize="10" letterSpacing="2" fill="#071B2E" fillOpacity=".6">CREIL — 60100</text>
    </svg>
  );
}
