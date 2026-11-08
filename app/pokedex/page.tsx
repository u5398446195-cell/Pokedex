"use client";

// Choix de la région, façon carte du monde des jeux Game Boy
import Image from "next/image";
import Link from "next/link";
import RetroHeader from "../components/RetroHeader.jsx";

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const animated = (id: number) => `${SPRITES}/versions/generation-v/black-white/animated/${id}.gif`;

const REGIONS = [
  { name: "KANTO", href: "/pokedex/kanto", image: "/KantoPIC.avif", gen: "GÉN. I", range: "001-151", count: 151, starters: [1, 4, 7] },
  { name: "JOHTO", href: "/pokedex/johto", image: "/JohtoPIC.webp", gen: "GÉN. II", range: "152-251", count: 100, starters: [152, 155, 158] },
  { name: "HOENN", href: "/pokedex/Hoenn", image: "/HoennPIC.webp", gen: "GÉN. III", range: "252-386", count: 135, starters: [252, 255, 258] },
];

export default function PokedexHome() {
  return (
    <main className="gb">
      <RetroHeader title="POKÉDEX" />

      <section className="gb-section">
        <div className="gb-dialog px-frame gb-page-intro">
          <p>Quelle région veux-tu explorer ?</p>
          <span className="gb-dialog-next" aria-hidden="true">▼</span>
        </div>

        <h1 className="gb-h2">
          <span className="gb-h2-ball" aria-hidden="true" />
          CHOISIS TA RÉGION
        </h1>

        <div className="gb-regions">
          {REGIONS.map((region) => (
            <Link key={region.name} href={region.href} className="gb-region px-frame">
              <div className="gb-region-bar">
                <span>CARTE DE {region.name}</span>
                <span>{region.gen}</span>
              </div>
              <div className="gb-region-img">
                <Image src={region.image} alt={`Carte de ${region.name}`} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="gb-region-starters" aria-hidden="true">
                {region.starters.map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={id} src={animated(id)} alt="" loading="lazy" />
                ))}
              </div>
              <div className="gb-region-foot">
                <span className="gb-cursor" aria-hidden="true">▶</span>
                N° {region.range} · {region.count} POKÉMON
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
