
"use client";

import { useEffect, useState } from "react";
import { PokemonSummary, fetchRegionList } from "../lib/pokeapi";

type EvolutionNode = {
  species: {
    name: string;
    url: string;
   
  };
  evolves_to: EvolutionNode[];
  evolution_details: {
    min_level: number | null;
    trigger: { name: string };
    item: { name: string } | null;
  }[];
};

type EvolutionChainResponse = {
  chain: EvolutionNode;
};

type EvolutionPokemon = {
  id: number;
  name: string;
  image: string;
  method: string;
};

export default function EvolutionChain({
  speciesUrl,
  currentId,
  onSelect,
  endId,
  startId,
}: {
  startId:number;
  endId: number;
  speciesUrl: string;
  currentId: number;
  onSelect: (pokemon: PokemonSummary) => void;
}) {
  const [evolutions, setEvolutions] = useState<EvolutionPokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) {
          throw new Error("Failed to fetch Pokémon species");
        }

        const species = await speciesResponse.json();

        const chainResponse = await fetch(species.evolution_chain.url);
        if (!chainResponse.ok) {
          throw new Error("Failed to fetch evolution chain");
        }

        const data: EvolutionChainResponse =
          await chainResponse.json();

        const results: EvolutionPokemon[] = [];

        function walk(node: EvolutionNode) {
          const id = Number(
            node.species.url.split("/").filter(Boolean).pop()
          );

          const detail = node.evolution_details[0];
          let method = "";

          if (detail?.min_level) {
            method = `Niveau ${detail.min_level}`;
          } else if (detail?.item) {
            method = detail.item.name;
          } else if (detail) {
            method = detail.trigger.name;
          }

          results.push({
            id,
            name: node.species.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            method,
          });

          node.evolves_to.forEach(walk);
        }

        walk(data.chain);

        if (!cancelled) {
          setEvolutions(results);
        }
      } catch (error) {
        console.error("Evolution loading error:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [speciesUrl]);

  if (loading) return <p>Loading evolutions...</p>;
  if (!evolutions.length) return null;

  return (
   
<section className="space-y-1 h-52 overflow-y-auto">
  <div className="flex flex-col items-center h-full space-y-1">
    {evolutions.map((pokemon) => {
      const unavailable = pokemon.id > endId || startId > pokemon.id; 

      return (
        <div
          key={pokemon.id}
          onClick={async () => {
            if (unavailable) return;

            try {
              const [summary] = await fetchRegionList({
                startId: pokemon.id,
                limit: 1,
              });

              if (summary) {
                onSelect(summary);
              }
            } catch (error) {
              console.error("Error selecting evolution:", error);
            }
          }}
          className={`relative flex h-auto w-full flex-row border p-1.5 text-white font-mono ${
            unavailable
              ? "cursor-not-allowed border-gray-500"
              : "cursor-pointer"
          } ${
            pokemon.id === currentId
              ? "border-red-500 hover:bg-blue-900/30 hover:border-blue-500 bg-red-900/30"
              : "border-red-900/60 hover:bg-blue-500 hover:border-blue-200"
          }`}
        >
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="h-12 w-12 object-contain"
          />

          <div className="flex flex-col justify-center pl-2">
            <span className="text-xs capitalize font-black">
              {pokemon.name}
            </span>

            {pokemon.method && (
              <span className="text-[10px] opacity-70">
                {pokemon.method}
              </span>
            )}
          </div>

          {unavailable && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-400/60">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {pokemon.name}({pokemon.id}) is not in this Pokedex
              </span>
            </div>
          )}
        </div>
      );
    })}
  </div>
</section>

  );
}
