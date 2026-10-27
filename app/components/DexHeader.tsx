
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
   <header className="fixed inset-x-0 top-0 z-40 border-b-[5px] border-[#870f20] bg-[#c81938] px-3 py-3 sm:px-5 sm:py-4">
  <div className="flex items-center justify-between gap-3">
    <div className="relative hidden h-12 w-12 shrink-0 place-items-center border-[4px] border-white/90 bg-[#2bbbf4] shadow-[0_0_20px_rgba(43,187,244,0.55),inset_0_0_0_4px_#1685bd] md:grid sm:h-16 sm:w-16">
      <div className="absolute left-[22%] top-[18%] h-3 w-3 bg-white/65 blur-[1px] sm:h-4 sm:w-4" />
    </div>

    <div className="hidden min-w-40 w-fit md:block">
      <h1 className="truncate text-lg font-black uppercase tracking-[0.18em] text-white sm:text-2xl">
        Pokédex
      </h1>
    </div>

    <div className="flex w-full justify-center gap-2 sm:gap-3">
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-900 p-1 font-black text-white duration-300 hover:scale-105 hover:bg-red-700 active:translate-y-px"
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
