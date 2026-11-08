"use client";

// Menu rétro, comme le menu START des jeux Pokémon :
// une fenêtre à droite, une flèche ▶ sur l'option survolée,
// et une boîte en bas qui décrit l'option (comme dans le jeu).
import Link from "next/link";
import { useEffect, useState } from "react";

// wip: true = fonctionnalité en cours de développement (affichée mais pas cliquable)
const LINKS = [
  { text: "ACCUEIL", href: "/", info: "Revenir à l'écran titre." },
  { text: "POKÉDEX", href: "/pokedex", info: "Les 1025 Pokémon, de Kanto à Paldea." },
  { text: "QUIZ", href: "/quiz", info: "Quel est ce Pokémon ? Devine son nom." },
];

export default function Menu({ openMenu, setOpenMenu }) {
  const [hover, setHover] = useState(0);

  // Échap pour fermer
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e) => e.key === "Escape" && setOpenMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu, setOpenMenu]);

  if (!openMenu) return null;

  const current = LINKS[hover] ?? { info: "Fermer le menu." };

  return (
    <div className="gb-menu" role="dialog" aria-label="Menu">
      <button type="button" className="gb-menu-backdrop" aria-label="Fermer le menu" onClick={() => setOpenMenu(false)} />

      <nav className="gb-menu-win px-frame" aria-label="Menu principal">
        {LINKS.map((link, i) => {
          const content = (
            <>
              <span className="gb-menu-cursor" aria-hidden="true">▶</span>
              <span>{link.text}</span>
              {link.wip && <span className="gb-menu-wip">DEV</span>}
            </>
          );
          return link.wip ? (
            <span
              key={link.text}
              className={`gb-menu-item is-wip ${hover === i ? "is-on" : ""}`}
              aria-disabled="true"
              onMouseEnter={() => setHover(i)}
            >
              {content}
            </span>
          ) : (
            <Link
              key={link.text}
              href={link.href}
              className={`gb-menu-item ${hover === i ? "is-on" : ""}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onClick={() => setOpenMenu(false)}
            >
              {content}
            </Link>
          );
        })}
        <button
          type="button"
          className={`gb-menu-item ${hover === LINKS.length ? "is-on" : ""}`}
          onMouseEnter={() => setHover(LINKS.length)}
          onFocus={() => setHover(LINKS.length)}
          onClick={() => setOpenMenu(false)}
        >
          <span className="gb-menu-cursor" aria-hidden="true">▶</span>
          <span>FERMER</span>
        </button>
      </nav>

      <div className="gb-menu-info px-frame" aria-live="polite">
        {current.info}
      </div>
    </div>
  );
}
