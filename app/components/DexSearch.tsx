import type { RefObject } from "react";
import Image from "next/image";
import type { PokemonSummary } from "../lib/pokeapi";

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getSearchSuggestions(query: string, pokemonList: PokemonSummary[]) {
  const normalized = normalize(query);
  if (!normalized) return [];

  return pokemonList
    .filter((pokemon) => {
      const english = normalize(pokemon.englishName);
      const french = normalize(pokemon.frenchName);
      return english.includes(normalized) || french.includes(normalized) || String(pokemon.id).includes(normalized);
    })
    .sort((a, b) => {
      const aExact = [a.englishName, a.frenchName, String(a.id)].some((value) => normalize(value) === normalized);
      const bExact = [b.englishName, b.frenchName, String(b.id)].some((value) => normalize(value) === normalized);
      if (aExact !== bExact) return aExact ? -1 : 1;

      const aStarts = [a.englishName, a.frenchName].some((value) => normalize(value).startsWith(normalized));
      const bStarts = [b.englishName, b.frenchName].some((value) => normalize(value).startsWith(normalized));
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      return a.id - b.id;
    })
    .slice(0, 5);
}

export function DexSearch({
  value,
  suggestions,
  showSuggestions,
  allowSuggestions = true,
  inputRef,
  onChange,
  onSelect,
  onSubmit,
  
}: {
  value: string;
  suggestions: PokemonSummary[];
  showSuggestions: boolean;
  allowSuggestions?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSelect: (pokemon: PokemonSummary) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="relative  w-full sm:w-[500px]">
      <div className="flex items-center border-[3px] rounded-full border-[#730d1b] bg-[#351116] py-2 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
            if (event.key === "Escape") onChange("");
          }}
          placeholder="SEARCH A POKÉMON NAME..."
          aria-label="Search Pokémon"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[15px] font-bold uppercase tracking-[0.14em] text-white outline-none placeholder:text-white/25"
        />
        <button
          type="button"
          onClick={onSubmit}
          aria-label="Search"
          className="grid h-9 w-10 shrink-0 rounded-full  place-items-center bg-[#ea2747] text-white transition hover:brightness-110 active:translate-y-px"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </button>
      </div>

      {allowSuggestions && showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden border-2 border-[#781020] bg-[#651020] shadow-[0_18px_35px_rgba(45,0,8,0.45)]">
          {suggestions.map((pokemon) => (
            <button
              key={pokemon.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(pokemon)}
              className="flex w-full items-center gap-3 border-b border-white/6 px-3 py-2.5 text-left last:border-b-0 hover:bg-[#82162a]"
            >
              <span className="w-9 font-mono text-[9px] font-black text-white/35">
                {String(pokemon.id).padStart(3, "0")}
              </span>
              {pokemon.sprite ? (
                <Image
                  src={pokemon.sprite}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="h-8 w-8" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-black uppercase tracking-[0.1em] text-white">
                  {formatName(pokemon.englishName)}
                </span>
                <span className="block truncate text-[9px] font-medium text-white/40">
                  {pokemon.frenchName}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
