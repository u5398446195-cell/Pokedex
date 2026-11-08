// Pied de page rétro commun à toutes les pages (sauf les écrans de Pokédex plein écran).
import Link from "next/link";
import { PORTFOLIO_URL, GITHUB_URL } from "../lib/site.js";

const COLUMNS = [
  {
    title: "EXPLORER",
    links: [
      { label: "Pokédex", href: "/pokedex" },
      { label: "Kanto", href: "/pokedex/kanto" },
      { label: "Sinnoh", href: "/pokedex/sinnoh" },
      { label: "Kalos", href: "/pokedex/kalos" },
      { label: "Paldea", href: "/pokedex/paldea" },
    ],
  },
  {
    title: "JOUER",
    links: [
      { label: "Quel est ce Pokémon ?", href: "/quiz" },
      { label: "Accueil", href: "/" },
    ],
  },
];

export default function RetroFooter() {
  const ext = { target: "_blank", rel: "noopener noreferrer" };

  return (
    <footer className="gbf">
      <div className="gbf-grass" aria-hidden="true" />

      <div className="gbf-grid">
        <div className="gbf-id">
          <Link href="/" className="gbf-logo" aria-label="Accueil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width={40} height={40} />
            <span>POKÉDEX</span>
          </Link>
          <p>Les 1025 Pokémon de Kanto à Paldea : fiches, formes, talents, évolutions et quiz.</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} className="gbf-col" aria-label={col.title}>
            <p className="gbf-title">{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="gbf-link">
                <span className="gbf-cursor" aria-hidden="true">▶</span>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}

        <div className="gbf-col">
          <p className="gbf-title">DRESSEUR</p>
          <p className="gbf-text">Créé par T</p>
          {PORTFOLIO_URL && (
            <a href={PORTFOLIO_URL} {...ext} className="gbf-link">
              <span className="gbf-cursor" aria-hidden="true">▶</span>
              Mon portfolio
            </a>
          )}
          <a href={GITHUB_URL} {...ext} className="gbf-link">
            <span className="gbf-cursor" aria-hidden="true">▶</span>
            GitHub
          </a>
          <Link href="/mentions-legales" className="gbf-link">
            <span className="gbf-cursor" aria-hidden="true">▶</span>
            Mentions légales
          </Link>
        </div>
      </div>

      <div className="gbf-bar">
        <span>DONNÉES : POKÉAPI</span>
        <span className="gbf-blink" aria-hidden="true">▶ CONTINUER ?</span>
        <a href="#" className="gbf-top">▲ HAUT</a>
      </div>
      <p className="gbf-legal">
        Site de fan non officiel. Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc.
      </p>
    </footer>
  );
}
