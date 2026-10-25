import { KANTO_COUNT } from "../data/kanto";
import type { PokemonDetails } from "../lib/pokeapi";

export function DexControls({
  activePokemon,
  onPrevious,
  onNext,
}: {
  activePokemon: PokemonDetails | null;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <section className="flex shrink-0 items-center justify-between gap-3 border-t-4 border-[#8a1020] bg-[#b4122b] px-2 py-3 sm:px-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!activePokemon || activePokemon.id === 1}
        className="border-2 border-[#7c0f1e] bg-[#971125] px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#a8162d] disabled:cursor-not-allowed disabled:opacity-25 sm:px-5"
      >
        <span aria-hidden>←</span>
        <span className="hidden sm:inline"> Previous</span>
      </button>

      <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-[#650919] bg-[#efefef] shadow-[inset_0_2px_5px_rgba(0,0,0,0.12)] sm:h-16 sm:w-16">
        <div className="h-6 w-6 rounded-full border-4 border-[#96152b] bg-[#db2342] sm:h-7 sm:w-7" />
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[#650919]" />
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!activePokemon || activePokemon.id === KANTO_COUNT}
        className="border-2 border-[#7c0f1e] bg-[#971125] px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#a8162d] disabled:cursor-not-allowed disabled:opacity-25 sm:px-5"
      >
        <span className="hidden sm:inline">Next </span>
        <span aria-hidden>→</span>
      </button>
    </section>
  );
}
