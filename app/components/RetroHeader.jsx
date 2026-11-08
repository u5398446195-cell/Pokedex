"use client";

// Barre du haut rétro (coque du Pokédex) + menu + lignes d'écran cathodique.
// À mettre en haut de chaque page : <RetroHeader title="QUIZ" />
import { useState } from "react";
import Link from "next/link";
import Menu from "./Menu.jsx";

export default function RetroHeader({ title = "POKÉDEX" }) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <>
      <div className="gb-scanlines" aria-hidden="true" />
      <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} />

      <header className="gb-top">
        <Link href="/" className="gb-lens" aria-label="Accueil">
          <span />
        </Link>
        <div className="gb-leds" aria-hidden="true">
          <span className="gb-led gb-led-red" />
          <span className="gb-led gb-led-yellow" />
          <span className="gb-led gb-led-green" />
        </div>
        <p className="gb-brand">{title}</p>
        <button type="button" className="gb-menu-btn px-frame" aria-label="Ouvrir le menu" onClick={() => setOpenMenu(true)}>
          MENU
        </button>
      </header>
    </>
  );
}
