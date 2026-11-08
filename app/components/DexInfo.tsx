import type { PokemonDetails } from "../lib/pokeapi";
import { TYPE_LABELS, TYPE_STYLES } from "../data/kanto";


function displayName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DexInfo({ activePokemon }: { activePokemon: PokemonDetails | null }) {
  if (!activePokemon) return null;

  return (

    <section className="border-2 border-[#7f1020]/60 bg-[#a9112a] p-4 ">
 <div className="flex items-start justify-between space-y-3">
        <div className="flex w-full justify-end shrink-0 gap-1.5">
          {activePokemon.types.map((type) => (
            <span
              key={type}
              className={`px-2 py-1  text-[8px] font-black uppercase ${TYPE_STYLES[type] ?? "bg-zinc-700 text-white"}`}
            >
              {TYPE_LABELS[type] ?? type}
            </span>
          ))}
        </div>
      </div>

       
        <div className="min-w-0">
          <p className="text-[20px] font-black uppercase tracking-[0.22em] text-white "> {activePokemon.englishName} </p>
      
        </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* PokéAPI donne la taille en décimètres et le poids en hectogrammes */}
        <DataBox label="Height" value={`${(activePokemon.height / 10).toLocaleString("fr-FR")} m`} />
        <DataBox label="Weight" value={`${(activePokemon.weight / 10).toLocaleString("fr-FR")} kg`} />
      </div>

   

 
    </section>
 
      



  );
}

function DataBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/8 bg-black/10 px-3 py-2.5">
      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</p>
      <p className="mt-1 font-mono text-sm font-black text-white">{value}</p>
    </div>



  );
}
