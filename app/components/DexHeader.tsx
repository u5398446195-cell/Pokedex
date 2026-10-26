
import type { RefObject } from "react";
import type { PokemonDetails, PokemonSummary } from "../lib/pokeapi";
import { DexSearch } from "./DexSearch";
import Image from "next/image";

export function DexHeader({
  setOpenMenu,
  activePokemon,
  searchValue,
  suggestions,
  showSuggestions,
  allowSuggestions = true,
  searchRef,
  onSearchChange,
  onSelectSuggestion,
  onSearch,
}: {
  activePokemon: PokemonDetails | null;
  searchValue: string;
  suggestions: PokemonSummary[];
  showSuggestions: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  onSelectSuggestion: (pokemon: PokemonSummary) => void;
  setOpenMenu: (open: boolean) => void;
  onSearch: () => void;
  allowSuggestions?: boolean;
}) {
  return (
    <header className="relative z-40 shrink-0 border-b-[5px] border-[#870f20] bg-[#c81938] px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex justify-between items-center gap-3">
        <div className="hidden md:flex relative grid h-12 w-12 shrink-0 place-items-center border-[4px] border-white/90 bg-[#2bbbf4] shadow-[0_0_20px_rgba(43,187,244,0.55),inset_0_0_0_4px_#1685bd] sm:h-16 sm:w-16">
          <div className="absolute left-[22%] top-[18%] h-3 w-3 bg-white/65 blur-[1px] sm:h-4 sm:w-4" />
        </div>

        <div className="hidden md:block min-w-40 w-fit">
          <h1 className="truncate text-lg font-black uppercase tracking-[0.18em] text-white sm:text-2xl">
            Pokédex
          </h1>
        </div>

        <div className="flex justify-center w-full gap-2 sm:gap-3">
          <DexSearch
            value={searchValue}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            allowSuggestions={allowSuggestions}
            inputRef={searchRef}
            onChange={onSearchChange}
            onSelect={onSelectSuggestion}
            onSubmit={onSearch}
          />
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={undefined}
          className="flex items-center justify-center hover:bg-red-700 hover:scale-105 duration-500 font-black text-white w-10 bg-red-900 rounded-md p-1 h-10  active:translate-y-px"
          onClick={() => setOpenMenu(true)}
        >
          <Image
            src="/hamburger-svgrepo-com.svg"
            alt=""
            width={60}
            height={60}
          />
        </button>
      </div>
    </header>
  );
}
