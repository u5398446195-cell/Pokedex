"use client";

// Choix de la région, façon carte du monde des jeux Game Boy
import Image from "next/image";
import Link from "next/link";
import RetroHeader from "../components/RetroHeader.jsx";
import RetroFooter from "../components/RetroFooter.jsx";
import { REGIONS, countOf, rangeLabel, regionSprite, LAST_POKEMON_ID } from "../data/allRegions";

export default function PokedexHome() {
  return (
    <main className="gb">
      <RetroHeader title="POKÉDEX" />

      <section className="gb-section">
        <div className="gb-dialog px-frame gb-page-intro">
          <p>Les {LAST_POKEMON_ID} Pokémon, région par région. Laquelle veux-tu explorer ?</p>
          <span className="gb-dialog-next" aria-hidden="true">▼</span>
        </div>

        <h1 className="gb-h2">
          <span className="gb-h2-ball" aria-hidden="true" />
          CHOISIS TA RÉGION
        </h1>

        <div className="gb-regions">
          {REGIONS.map((region) => (
            <Link key={region.slug} href={region.href} className="gb-region px-frame">
              <div className="gb-region-bar">
                <span>CARTE DE {region.name.toUpperCase()}</span>
                <span>{region.gen}</span>
              </div>
              <div className="gb-region-img">
                <Image src={region.image} alt={`Carte de ${region.name}`} fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="gb-region-starters" aria-hidden="true">
                {region.starters.map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={id} src={regionSprite(id)} alt="" loading="lazy" />
                ))}
              </div>
              <div className="gb-region-foot">
                <span className="gb-cursor" aria-hidden="true">▶</span>
                N° {rangeLabel(region)} · {countOf(region)} POKÉMON
              </div>
            </Link>
          ))}
        </div>
      </section>
      <RetroFooter />
    </main>
  );
}
