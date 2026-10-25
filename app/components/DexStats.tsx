import type { PokemonDetails } from "../lib/pokeapi";
import { STAT_LABELS } from "../data/kanto";

export function DexStats({
  activePokemon,
  statBarColor = "bg-[#ffdc74]",
}: {
  activePokemon: PokemonDetails | null;
  statBarColor?: string;
}) {
  if (!activePokemon) return null;

  return (
    <section className="border-2 border-[#690c1b]/60 bg-[#8d1023] p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/65">Stats</h3>
      </div>

      <div className="space-y-3">
        {activePokemon.stats.map((stat) => {
          const percentage = Math.min(100, (stat.value / 255) * 100);

          return (
            <div key={stat.name} className="grid grid-cols-[45px_1fr_30px] items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
                {STAT_LABELS[stat.name] ?? stat.name}
              </span>
              <div className="h-3 overflow-hidden bg-black/40">
                <div className={`${statBarColor} h-full`} style={{ width: `${percentage}%` }} />
              </div>
              <span className="text-right font-mono text-[9px] font-black text-white">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
