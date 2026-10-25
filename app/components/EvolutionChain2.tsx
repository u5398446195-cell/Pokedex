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
  onClose,
  speciesUrl,
  currentId,
  onSelect,
}: {
  onClose: () => void;
  speciesUrl: string;
  currentId: number;
  onSelect: (pokemon: PokemonSummary) => void;
}) {
  const [evolutions, setEvolutions] = useState<EvolutionPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);

        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) {
          throw new Error("Failed to fetch Pokémon species");
        }

        const species = await speciesResponse.json();
        const chainResponse = await fetch(species.evolution_chain.url);

        if (!chainResponse.ok) {
          throw new Error("Failed to fetch evolution chain");
        }

        const data: EvolutionChainResponse = await chainResponse.json();
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

        if (!cancelled) {
          setError(true);
        }
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

  async function handleSelect(pokemon: EvolutionPokemon) {
    try {
      setSelectingId(pokemon.id);

      const [summary] = await fetchRegionList({
        startId: pokemon.id,
        limit: 1,
      });

      if (summary) {
        onSelect(summary);
        onClose();
      }
    } catch (error) {
      console.error("Error selecting evolution:", error);
    } finally {
      setSelectingId(null);
    }
  }

  if (loading) {
    return (
      <p className="border-4 border-[#211f1b] bg-[#f6edda] p-4 font-mono text-sm font-bold uppercase text-[#211f1b]">
        Chargement du Pokédex...
      </p>
    );
  }

  if (error) {
    return (
      <p className="border-4 border-[#211f1b] bg-[#f6edda] p-4 font-mono text-sm text-[#b5232f]">
        Impossible de charger les évolutions.
      </p>
    );
  }

  if (!evolutions.length) return null;

  return (
    <section
      aria-label="Chaîne d’évolution"
      className="border-4 border-[#211f1b] bg-[#d32f35] p-3 rounded-md sm:p-4"
    >
      <header className="mb-3 flex items-center justify-between border-b-4 border-[#211f1b] pb-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="relative h-9 w-9 shrink-0 rounded-full border-[3px] border-[#211f1b] bg-[#f6edda] before:absolute before:left-0 before:top-1/2 before:h-[3px] before:w-full before:-translate-y-1/2 before:bg-[#211f1b] after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-[3px] after:border-[#211f1b] after:bg-[#f6edda]"
          />

          <div className="font-mono text-[#fff4d4]">
            <p className="text-[9px] uppercase tracking-[0.3em]">
              Pokédex
            </p>
            <h2 className="text-sm font-black uppercase tracking-[0.15em]">
              Évolutions
            </h2>
          </div>
        </div>

       
      </header>

      <div className="max-h-[55vh] overflow-y-auto border-4 border-[#211f1b] bg-[#d9e5bd] p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {evolutions.map((pokemon, index) => {
            const isCurrent = pokemon.id === currentId;
            const isSelecting = pokemon.id === selectingId;

            return (
              <button
                type="button"
                key={pokemon.id}
                onClick={() => void handleSelect(pokemon)}
                disabled={selectingId !== null}
                aria-current={isCurrent ? "true" : undefined}
                className={`group relative flex min-h-[94px] items-center gap-3 border-[3px] border-[#211f1b] p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f3ca3e] disabled:cursor-wait disabled:opacity-70 ${
                  isCurrent
                    ? "bg-[#f3ca3e]"
                    : "bg-[#f6edda] hover:bg-[#b9d7ed] active:bg-[#8bbce0]"
                }`}
              >
                <span className="absolute -left-1 -top-1 bg-[#211f1b] px-1.5 py-0.5 font-mono text-[9px] text-[#fff4d4]">
                  N°{String(pokemon.id).padStart(3, "0")}
                </span>

                <span className="mt-3 flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[#211f1b] bg-[#d9e5bd]">
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    loading="lazy"
                    className="h-12 w-12 object-contain [image-rendering:pixelated]"
                  />
                </span>

                <span className="mt-3 min-w-0 flex-1 font-mono">
                  <span className="block truncate text-sm font-black uppercase text-[#211f1b]">
                    {pokemon.name}
                  </span>

                  {pokemon.method && (
                    <span className="mt-1 block truncate text-[10px] uppercase text-[#454237]">
                      {pokemon.method}
                    </span>
                  )}

                  {isCurrent && (
                    <span className="mt-1 inline-block bg-[#d32f35] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      Selected Pokemon
                    </span>
                  )}

                  {isSelecting && (
                    <span className="mt-1 block text-[10px] uppercase text-[#211f1b]">
                      Chargement...
                    </span>
                  )}
                </span>

                {index < evolutions.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="font-mono text-lg font-black text-[#2454a6]"
                  >
                    ▶
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <footer
        aria-hidden="true"
        className="mt-3 flex items-center justify-end gap-2"
      >
       
        <span className="h-2 w-10 rounded-full border-2 border-[#211f1b] bg-[#a8222b]" />
        <span className="h-5 w-5 rounded-full border-[3px] border-[#211f1b] bg-[#f3ca3e]" />
        <span className="h-5 w-5 rounded-full border-[3px] border-[#211f1b] bg-[#2454a6]" />
      </footer>
    </section>
  );
}
