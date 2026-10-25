"use client";

import Image from "next/image";
import type { PokemonDetails, PokemonSummary } from "../lib/pokeapi";

function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DexList({
  pokemonList,
  activePokemon,
  onSelect,
  showMobileList,
  setShowMobileList,
}: {
  pokemonList: PokemonSummary[];
  activePokemon: PokemonDetails | null;
  onSelect: (pokemon: PokemonSummary) => void;
  showMobileList?: boolean;
  setShowMobileList?: (show: boolean) => void;
}) {
  const visible = pokemonList;

  return (
    <>
      <aside
        className={[
          "fixed inset-y-0 right-0 z-41 flex w-[78vw] max-w-[360px] flex-col border-l-2 border-l-[#7f1020] bg-[#c61c38] transition-transform duration-300 ease-in-out md:static md:inset-auto md:right-auto md:w-[280px] md:max-w-none md:translate-x-0 md:border-l-2 md:border-[#7f1020] lg:w-[300px] xl:w-[330px]",
          showMobileList ? "translate-x-0" : "translate-x-[100%] md:translate-x-0",
        ].join(" ")}
      >
        <div className="shrink-0 border-b-4 relative border-[#7f1020] px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3">
        


      <button
        type="button"
        onClick={() => setShowMobileList?.(!showMobileList)}
        className="absolute bg-red-900 border-5 border-white/20 rounded-md  z-40 left-0 top-1/2  text-black -translate-x-full  translate-y-4/2 border-2 border-r-0 border-[#7f1020] bg-[#c61c38] px-2 py-4 font-black text-white transition-colors hover:bg-[#df2745] md:hidden"
        aria-label={showMobileList ? "Fermer la liste" : "Ouvrir la liste"}
      >
        {showMobileList ? ">" : "<"}
      </button>


            <div className="ml-auto md:ml-0">
              <h2 className="text-lg font-black uppercase tracking-wide text-white">Pokémon</h2>
            </div>
            <span className="font-mono text-xs font-black text-white/50 md:hidden">
              {visible.length}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
          <div className="grid gap-2">
            {visible.map((pokemon) => {
              const selected = activePokemon?.id === pokemon.id;
              
              // Contournement de TypeScript pour la propriété artwork absente de PokemonSummary
              const pokemonArtwork = (pokemon as any).artwork;
              const artwork =
                pokemonArtwork && pokemonArtwork.length > 0
                  ? pokemonArtwork
                  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

              return (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() =>{ onSelect(pokemon) ; setShowMobileList?.(false)}}
                  className={`group flex w-full items-center gap-2 border px-2 py-2 text-left text-xs ${
                    selected
                      ? "border-[#ffe178] bg-[#df2745] shadow-[inset_4px_0_0_#ffe178]"
                      : "border-[#7c1020]/70 bg-[#981026]/60 hover:border-white/20 hover:bg-[#bd1734]"
                  }`}
                >
                  <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden bg-white/90">
                    <Image
                      src={artwork}
                      alt={formatName(pokemon.englishName)}
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="min-w-0 flex-1 truncate font-black uppercase tracking-[0.1em] text-white">
                    {formatName(pokemon.englishName)}
                  </span>
                  <span
                    className={`h-2 w-2 shrink-0 ${
                      selected
                        ? "bg-[#ffe178] shadow-[0_0_10px_rgba(255,225,120,0.8)]"
                        : "bg-[#6f0d1c]"
                    }`}
                  />
                </button>
              );
            })}

            {visible.length === 0 && (
              <div className="px-4 py-12 text-center text-xs font-black uppercase tracking-[0.2em] text-white/45">
                No Pokémon found
              </div>
            )}
          </div>
        </div>
      </aside>

     
    </>
  );
}