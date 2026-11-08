"use client";

// Accueil 100 % rétro, façon jeux Pokémon Game Boy / GBA :
//  - écran titre (logo pixel, « APPUIE SUR START » qui clignote, défilé de sprites animés)
//  - boîte de dialogue qui s'écrit lettre par lettre + menu à flèche ▶
//  - régions façon « Carte de la ville », silhouette « Quel est ce Pokémon ? »
//  - outils présentés comme des barres de PV de combat
//  - lignes de balayage d'écran cathodique par-dessus toute la page

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RetroHeader from "./components/RetroHeader.jsx";
import RetroFooter from "./components/RetroFooter.jsx";

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
// Sprites animés de Noir & Blanc : de vrais petits pixels qui bougent
const animated = (id: number) => `${SPRITES}/versions/generation-v/black-white/animated/${id}.gif`;
const artwork = (id: number) => `${SPRITES}/other/official-artwork/${id}.png`;

// Le cortège qui défile en bas de l'écran titre (starters, mascottes…)
const PARADE = [25, 1, 4, 7, 133, 152, 155, 158, 175, 252, 255, 258, 143, 94, 129, 300, 39, 54];

const REGIONS = [
  { name: "KANTO", href: "/pokedex/kanto", image: "/KantoPIC.avif", gen: "GÉN. I", range: "001-151", starter: 25 },
  { name: "JOHTO", href: "/pokedex/johto", image: "/JohtoPIC.webp", gen: "GÉN. II", range: "152-251", starter: 175 },
  { name: "HOENN", href: "/pokedex/Hoenn", image: "/HoennPIC.webp", gen: "GÉN. III", range: "252-386", starter: 258 },
];

// Ce qu'on peut faire sur le site (href null = en cours de développement)
const FEATURES = [
  { name: "POKÉDEX", href: "/pokedex", sprite: 137, text: "Fiches, stats, talents, attaques, évolutions et simulateur de combat.", cta: "OUVRIR" },
  { name: "QUIZ", href: "/quiz", sprite: 132, text: "Une silhouette, un nom à trouver. Enchaîne les bonnes réponses.", cta: "JOUER" },
  { name: "POKETEAM", href: null, sprite: 143, text: "Composer son équipe de 6 et voir ses faiblesses.", cta: "BIENTÔT" },
];

const START_MENU = [
  { label: "POKÉDEX", href: "/pokedex" },
  { label: "QUIZ", href: "/quiz" },
  { label: "KANTO", href: "/pokedex/kanto" },
  { label: "JOHTO", href: "/pokedex/johto" },
];

const DIALOG = "Bienvenue dans le monde des POKÉMON ! Que veux-tu faire ?";

// Texte qui s'écrit lettre par lettre, comme dans les jeux
function useTypewriter(text: string, speed = 35) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { shown: text.slice(0, count), done: count >= text.length };
}

export default function HomePage() {
  const [mysteryId, setMysteryId] = useState<number | null>(null);
  const { shown, done } = useTypewriter(DIALOG);

  // Pokémon mystère tiré au hasard côté navigateur (pas côté serveur : sinon erreur d'hydratation)
  useEffect(() => {
    setMysteryId(1 + Math.floor(Math.random() * 386));
  }, []);

  return (
    <main className="gb">
      <RetroHeader />

      {/* ─── Écran titre ─── */}
      <section className="gb-title">
        <div className="gb-title-sky" aria-hidden="true">
          <span className="gb-cloud gb-cloud-1" />
          <span className="gb-cloud gb-cloud-2" />
          <span className="gb-cloud gb-cloud-3" />
        </div>

        <div className="gb-title-inner">
          <h1 className="gb-logo">
            <span className="gb-logo-main">POKÉDEX</span>
            <span className="gb-logo-sub">ÉDITION TEWFIK</span>
          </h1>

          <div className="gb-dialog px-frame">
            <p aria-hidden="true">
              {shown}
              {!done && <span className="gb-caret">▌</span>}
            </p>
            {done && <span className="gb-dialog-next" aria-hidden="true">▼</span>}
            <span className="sr-only">{DIALOG}</span>
          </div>

          <nav className="gb-start px-frame" aria-label="Accès rapide">
            {START_MENU.map((item) => (
              <Link key={item.href} href={item.href} className="gb-start-item">
                <span className="gb-cursor" aria-hidden="true">▶</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="gb-press">APPUIE SUR START</p>
        </div>

        {/* Herbes hautes + cortège de Pokémon qui marchent */}
        <div className="gb-ground" aria-hidden="true">
          <div className="gb-parade">
            {[...PARADE, ...PARADE].map((id, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={animated(id)} alt="" loading="lazy" />
            ))}
          </div>
          <div className="gb-grass" />
        </div>
      </section>

      {/* ─── Régions ─── */}
      <section className="gb-section">
        <h2 className="gb-h2">
          <span className="gb-h2-ball" aria-hidden="true" />
          CHOISIS TA RÉGION
        </h2>

        <div className="gb-regions">
          {REGIONS.map((region) => (
            <Link key={region.name} href={region.href} className="gb-region px-frame">
              <div className="gb-region-bar">
                <span>CARTE DE {region.name}</span>
                <span>{region.gen}</span>
              </div>
              <div className="gb-region-img">
                <Image src={region.image} alt={`Carte de ${region.name}`} fill sizes="(max-width: 768px) 100vw, 33vw" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="gb-region-sprite" src={animated(region.starter)} alt="" loading="lazy" />
              </div>
              <div className="gb-region-foot">
                <span className="gb-cursor" aria-hidden="true">▶</span>
                N° {region.range}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Quel est ce Pokémon ? ─── */}
      <section className="gb-who">
        <div className="gb-who-inner">
          <div className="gb-who-stage">
            {/* les rayons tournent autour de la silhouette (leur centre = le centre du Pokémon) */}
            <div className="gb-who-rays" aria-hidden="true" />
            <div className="gb-who-art">
              {mysteryId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artwork(mysteryId)} alt="Pokémon mystère" draggable={false} />
              )}
            </div>
          </div>

          <div className="gb-who-text">
            <h2>
              QUEL EST
              <br />
              CE POKÉMON ?
            </h2>
            <div className="gb-who-box px-frame">
              <p>Seulement sa silhouette. Trouve son nom et bats ton record de série.</p>
            </div>
            <Link href="/quiz" className="gb-btn px-frame">
              ▶ JOUER AU QUIZ
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ─── */}
      <section className="gb-section">
        <h2 className="gb-h2">
          <span className="gb-h2-ball" aria-hidden="true" />
          FONCTIONNALITÉS
        </h2>

        <div className="gb-features">
          {FEATURES.map((f) => {
            const inner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="gb-feature-sprite" src={animated(f.sprite)} alt="" loading="lazy" />
                <h3 className="gb-feature-name">{f.name}</h3>
                <p className="gb-feature-text">{f.text}</p>
                <span className="gb-feature-cta">
                  {f.href && <span aria-hidden="true">▶ </span>}
                  {f.cta}
                </span>
              </>
            );
            return f.href ? (
              <Link key={f.name} href={f.href} className="gb-feature px-frame">
                {inner}
              </Link>
            ) : (
              <div key={f.name} className="gb-feature px-frame is-wip" aria-disabled="true">
                {inner}
                <span className="gb-feature-badge">EN COURS DE DEV</span>
              </div>
            );
          })}
        </div>
      </section>

      <RetroFooter />
    </main>
  );
}
