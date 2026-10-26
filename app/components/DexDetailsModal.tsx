"use client";
import { useEffect, useState, useRef } from "react";
import type {
  PokemonDetails,
  PokemonMove,
  PokemonAbilityDetails,
  PokemonMoveDetails,
} from "../lib/pokeapi";
import { fetchAbilityDetails, fetchMoveDetails } from "../lib/pokeapi";
import Image from "next/image";
import EvolutionChain2 from "./EvolutionChain2";

const TYPE_COLORS: Record<string, string> = {
  fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
  ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
  flying: "#A890F0", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", dark: "#705848", steel: "#B8B8D0",
  fairy: "#EE99AC", normal: "#A8A878",
};



const TYPE_GRADIENTS: Record<string, string> = {
  fire: "from-[#F08030] to-[#C03028]",
  water: "from-[#6890F0] to-[#3858A8]",
  grass: "from-[#78C850] to-[#3A8828]",
  electric: "from-[#F8D030] to-[#D0A000]",
  ice: "from-[#98D8D8] to-[#58A8A8]",
  fighting: "from-[#C03028] to-[#801010]",
  poison: "from-[#A040A0] to-[#602060]",
  ground: "from-[#E0C068] to-[#A08020]",
  flying: "from-[#A890F0] to-[#6858B0]",
  psychic: "from-[#F85888] to-[#B02858]",
  bug: "from-[#A8B820] to-[#687810]",
  rock: "from-[#B8A038] to-[#786000]",
  ghost: "from-[#705898] to-[#402860]",
  dragon: "from-[#7038F8] to-[#3818A8]",
  dark: "from-[#705848] to-[#302018]",
  steel: "from-[#B8B8D0] to-[#7878A0]",
  fairy: "from-[#EE99AC] to-[#B05868]",
  normal: "from-[#A8A878] to-[#686848]",
};

const TYPE_ADVANTAGES: Record<string, string[]> = {
  fire: ["grass", "bug", "steel"],
  water: ["fire", "ground", "rock"],
  grass: ["water", "ground", "rock"],
  electric: ["water", "flying"],
  ice: ["grass", "flying", "ground", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
  normal: [],
};

function getWeaknesses(type: string): string[] {
  const weaknesses: string[] = [];
  for (const [t, advantages] of Object.entries(TYPE_ADVANTAGES)) {
    if (advantages.includes(type.toLowerCase())) weaknesses.push(t);
  }
  return weaknesses;
}

function getAdvantages(type: string): string[] {
  return TYPE_ADVANTAGES[type.toLowerCase()] || [];
}

function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatColor(value: number): string {
  if (value > 110) return "#00A000";
  if (value > 90) return "#6BCB00";
  if (value > 70) return "#FFB000";
  if (value > 50) return "#FF7800";
  return "#D00000";
}

export function DexDetailsModal({
  loadPokemon,
  activePokemon,
  onClose,
  endId,
  startId,
  zIndex = 100,
  onFocus,
}: {
  loadPokemon: (id: number) => Promise<void>;
  activePokemon: PokemonDetails | null;
  endId: number;
  startId: number;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}) {
  const [tab, setTab] = useState<"info" | "abilities" | "moves">("info");
  
  // Instant lazy-init for position to prevent jumping from (0,0)
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const w = Math.min(950, window.innerWidth - 48);
    const h = Math.min(720, window.innerHeight - 48);
    return {
      x: Math.max(24, Math.round((window.innerWidth - w) / 2)),
      y: Math.max(24, Math.round((window.innerHeight - h) / 2)),
    };
  });

  const [mounted, setMounted] = useState(false);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [selectedMove, setSelectedMove] = useState<PokemonMove | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, [activePokemon?.id]);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffsetRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffsetRef.current.y)),
      });
    }
    function onPointerUp(e: PointerEvent) {
      if (draggingRef.current) {
        draggingRef.current = false;
        try {
          (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        } catch {}
      }
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (!activePokemon) return null;

  const primaryType = Array.isArray(activePokemon.types)
    ? (typeof activePokemon.types[0] === "string" ? activePokemon.types[0] : "normal")
    : "normal";
  const typeColor = TYPE_COLORS[primaryType.toLowerCase()] || "#A8A878";
  const typeGradient = TYPE_GRADIENTS[primaryType.toLowerCase()] || TYPE_GRADIENTS.normal;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ zIndex: zIndex - 1, opacity: mounted ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="pointer-events-auto fixed flex max-h-[calc(100dvh-24px)] w-[min(950px,calc(100vw-32px))] max-w-[950px] flex-col overflow-hidden rounded-lg border-4 border-[#1a1a1a] bg-gradient-to-b from-[#f0f0f0] to-[#c8c8c8] shadow-2xl transition-all duration-300 ease-out"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex,
          boxShadow: "12px 12px 0 rgba(0,0,0,0.75), 0 0 60px rgba(0,0,0,0.3)",
          transform: mounted ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
          opacity: mounted ? 1 : 0,
        }}
      >
        <div className="h-1.5 shrink-0" style={{ backgroundColor: typeColor }} />

        <div
          onPointerDown={(e) => {
            const el = e.target as Element | null;
            if (el && (el.closest("button") || el.closest("a") || el.closest("input"))) {
              onFocus?.();
              return;
            }
            draggingRef.current = true;
            const rect = modalRef.current?.getBoundingClientRect();
            dragOffsetRef.current = {
              x: e.clientX - (rect?.left ?? 0),
              y: e.clientY - (rect?.top ?? 0),
            };
            try {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            } catch {}
            onFocus?.();
          }}
          className={`shrink-0 cursor-grab touch-none border-b-4 border-[#1a1a1a] bg-gradient-to-br ${typeGradient} px-4 py-3 text-white select-none sm:px-6 sm:py-4`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Image
                src={activePokemon.artwork}
                alt={activePokemon.englishName}
                width={80}
                height={80}
                className="h-12 w-12 shrink-0 object-contain drop-shadow-2xl sm:h-16 sm:w-16"
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black uppercase tracking-wide text-white drop-shadow-md sm:text-2xl">
                  {activePokemon.englishName}
                </h2>
                <p className="truncate font-mono text-xs text-white/90 drop-shadow-md sm:text-sm">
                  {String(activePokemon.id).padStart(3, "0")} · {activePokemon.genus}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-lg font-black text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/40 sm:h-10 sm:w-10 sm:text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex shrink-0 border-b-4 border-[#1a1a1a] bg-[#c0c0c0]">
          {(["info", "abilities", "moves"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 border-r-2 border-[#888] px-2 py-2 text-xs font-black uppercase tracking-wide transition-all sm:px-4 sm:py-3 sm:text-sm ${
                tab === t
                  ? "border-b-2 border-[#1a1a1a] bg-[#f0f0f0] text-[#000]"
                  : "bg-[#b0b0b0] text-[#333] hover:bg-[#c8c8c8]"
              }`}
            >
              {t}
              {tab === t && (
                <div
                  className="absolute bottom-0 left-0 h-1 w-full"
                  style={{ backgroundColor: typeColor }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f0f0f0] p-3 sm:p-4">
          {tab === "info" && (
            <div className="space-y-3">
              <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                <div className="mb-2 text-[11px] font-black tracking-wider text-[#333]">TYPE</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(activePokemon.types) &&
                    activePokemon.types.map((t) => {
                      const typeName = typeof t === "string" ? t : "unknown";
                      const bgColor = TYPE_COLORS[typeName.toLowerCase()] || "#A8A878";
                      return (
                        <span
                          key={typeName}
                          className="rounded-sm border-2 border-[#1a1a1a] px-3 py-1 text-xs font-black uppercase tracking-wide text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                          style={{ backgroundColor: bgColor }}
                        >
                          {typeName}
                        </span>
                      );
                    })}
                </div>
              </div>

              {Array.isArray(activePokemon.types) &&
                (() => {
                  const pt = typeof activePokemon.types[0] === "string"
                    ? activePokemon.types[0].toLowerCase()
                    : "normal";
                  const advantages = getAdvantages(pt);
                  const weaknesses = getWeaknesses(pt);

                  return (
                    <>
                      {advantages.length > 0 && (
                        <div className="rounded border-2 border-[#1a1a1a] bg-gradient-to-br from-[#f0fff0] to-[#d8ffd8] p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                          <div className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-wider text-[#0A5A0A]">
                            <span>▲</span>
                            <span>STRONG AGAINST</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {advantages.map((type) => (
                              <span
                                key={type}
                                className="rounded-sm border-2 border-[#1a1a1a] px-2 py-1 text-[10px] font-black uppercase text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                                style={{ backgroundColor: TYPE_COLORS[type] || "#A8A878" }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {weaknesses.length > 0 && (
                        <div className="rounded border-2 border-[#1a1a1a] bg-gradient-to-br from-[#fff0f0] to-[#ffd8d8] p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                          <div className="mb-2 flex items-center gap-2 text-[11px] font-black tracking-wider text-[#8A0A0A]">
                            <span>▼</span>
                            <span>WEAK TO</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {weaknesses.map((type) => (
                              <span
                                key={type}
                                className="rounded-sm border-2 border-[#1a1a1a] px-2 py-1 text-[10px] font-black uppercase text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                                style={{ backgroundColor: TYPE_COLORS[type] || "#A8A878" }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              <div className="rounded border-2  border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                                  <EvolutionChain2 
                                    startId={startId}
                                    endId={ endId}
                                    onSelect={(pokemon) => void loadPokemon(pokemon.id)}
                                    speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${activePokemon.id}/`}
                                    currentId={activePokemon.id}
                                    onClose={onClose}
                                
                                  />
              </div>

              <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                <div className="mb-2 text-[11px] font-black tracking-wider text-[#333]">BASE STATS</div>
                <div className="space-y-2">
                  {activePokemon.stats.map((stat) => {
                    const statColor = getStatColor(stat.value);
                    const pct = Math.min((stat.value / 150) * 100, 100);
                    return (
                      <div key={stat.name} className="flex items-center gap-2">
                        <div className="w-16 text-[10px] font-black tracking-wide text-[#333] sm:w-20">
                          {stat.name.toUpperCase()}
                        </div>
                        <div className="relative h-5 flex-1 overflow-hidden rounded-sm border border-[#1a1a1a] bg-[#e8e8e8]">
                          <div
                            className="h-full transition-all duration-700 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: statColor,
                              boxShadow: `inset 0 0 8px rgba(0,0,0,0.2)`,
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                        </div>
                        <div
                          className="w-10 text-right text-[11px] font-black sm:w-12"
                          style={{ color: statColor }}
                        >
                          {stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                  <div className="text-[11px]  font-black tracking-wider text-[#333]">HEIGHT</div>
                  <p className="text-lg font-black text-black">{(activePokemon.height / 10).toFixed(1)}m</p>
                </div>
                <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                  <div className="text-[11px]  font-black tracking-wider text-[#333]">WEIGHT</div>
                  <p className="text-lg font-black text-black">{(activePokemon.weight / 10).toFixed(1)}kg</p>
                </div>
              </div>

              <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                <div className="mb-2 text-[11px] font-black tracking-wider text-[#333]">
                  POKÉDEX ENTRY
                </div>
                <p className="text-sm leading-relaxed text-[#333]">{activePokemon.description}</p>
              </div>
            </div>
          )}

          {tab === "abilities" && (
            <div className="space-y-2">
              {activePokemon.abilities && activePokemon.abilities.length > 0 ? (
                activePokemon.abilities.map((ability) => (
                  <button
                    key={ability.name}
                    type="button"
                    className="group flex w-full items-center justify-between rounded border-2 border-[#1a1a1a] bg-white p-3 text-left shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
                    onClick={() => setSelectedAbility(ability.name)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase tracking-wide text-[#333]">
                          {formatName(ability.name)}
                        </p>
                        {ability.isHidden && (
                          <span
                            className="rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
                            style={{ backgroundColor: typeColor }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="ml-2 shrink-0 text-lg text-[#888] transition-transform group-hover:translate-x-1 group-hover:text-[#333]">
                      →
                    </span>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-[#999]">No abilities</p>
              )}
            </div>
          )}

          {tab === "moves" && (
            <div className="space-y-2">
              {activePokemon.moves && activePokemon.moves.length > 0 ? (
                activePokemon.moves.map((move, idx) => {
                  // Fixed move level interpretation bug (e.g., Solar Beam appearing at level 35 incorrectly)
                  const isLevelUp = move.level > 0;
                  const labelText = isLevelUp ? `LVL ${move.level}` : "TM/OTHER";
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="group flex w-full items-center justify-between rounded border-2 border-[#1a1a1a] bg-white p-2 text-left shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)]"
                      onClick={() => setSelectedMove(move)}
                    >
                      <p className="truncate text-sm font-black uppercase tracking-wide text-[#333]">
                        {formatName(move.name)}
                      </p>
                      
                      <div className="flex flex-col items-center">
                      <div className="ml-2 shrink-0 text-[10px] font-black tracking-wider text-[#333]">
                        {labelText}
                      </div>

                     <span className="ml-2 shrink-0 text-lg text-[#888] transition-transform group-hover:translate-x-1 group-hover:text-[#333]">
                      →
                    </span>

                      </div>
                      
                    </button>
                  );
                })
              ) : (
                <p className="py-4 text-center text-[#999]">No moves found for this pokemon.</p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t-4 border-[#1a1a1a] bg-[#c0c0c0] px-3 py-2 sm:px-4 sm:py-3">
          <button
            onClick={onClose}
            className="w-full rounded-sm border-2 border-[#1a1a1a] bg-[#e8e8e8] px-4 py-2 text-sm font-black uppercase tracking-wide text-[#333] shadow-[2px_2px_0_rgba(0,0,0,0.3)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-[#d0d0d0] hover:shadow-[1px_1px_0_rgba(0,0,0,0.3)]"
          >
            CLOSE
          </button>
        </div>
      </div>

      {selectedAbility && (
        <AbilityModal
          abilityName={selectedAbility}
          typeColor={typeColor}
          typeGradient={typeGradient}
          onClose={() => setSelectedAbility(null)}
          zIndex={zIndex + 10}
          onFocus={onFocus}
        />
      )}

      {selectedMove && (
        <MoveModal
          move={selectedMove}
          allMoves={activePokemon.moves}
          onClose={() => setSelectedMove(null)}
          zIndex={zIndex + 10}
          onFocus={onFocus}
        />
      )}
    </>
  );
}

/* ================= ABILITY MODAL ================= */
function AbilityModal({
  abilityName,
  typeColor,
  typeGradient,
  onClose,
  zIndex,
  onFocus,
}: {
  abilityName: string;
  typeColor: string;
  typeGradient: string;
  onClose: () => void;
  zIndex: number;
  onFocus?: () => void;
}) {
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const w = 500;
    const h = 340;
    return {
      x: Math.max(24, Math.round((window.innerWidth - w) / 2 + 40)),
      y: Math.max(24, Math.round((window.innerHeight - h) / 2 + 40)),
    };
  });
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<PokemonAbilityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAbilityDetails(abilityName)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [abilityName]);

  return (
    <div
      ref={modalRef}
      className="pointer-events-auto fixed flex max-h-[calc(100dvh-24px)] w-[min(500px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border-4 border-[#1a1a1a] bg-gradient-to-b from-[#fffbe0] to-[#f0e68c] shadow-2xl transition-all duration-300 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex,
        boxShadow: "10px 10px 0 rgba(0,0,0,0.65)",
        transform: mounted ? "scale(1)" : "scale(0.9)",
        opacity: mounted ? 1 : 0,
      }}
    >
      <div className="h-1.5 shrink-0" style={{ backgroundColor: typeColor }} />

      <div
        onPointerDown={(e) => {
          const el = e.target as Element | null;
          if (el && el.closest("button")) {
            onFocus?.();
            return;
          }
          draggingRef.current = true;
          const rect = modalRef.current?.getBoundingClientRect();
          dragOffsetRef.current = {
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
          };
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
          onFocus?.();
        }}
        className={`flex relative cursor-grab touch-none items-center justify-between border-b-4 border-[#1a1a1a] bg-gradient-to-br ${typeGradient} px-4 py-3 select-none`}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
            Ability
          </p>
          <h3 className="truncate text-lg font-black uppercase tracking-wide text-white drop-shadow-md">
            {formatName(abilityName)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-lg font-black text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/40"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fffacd] px-3 py-1">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-6 text-[#666]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c8b860] border-t-transparent" />
            <p className="text-xs font-black uppercase tracking-widest">Loading…</p>
          </div>
        ) : (
          <>
            <p className="text-lg max-h-32 overflow-auto px-3 leading-relaxed text-[#333] ">
              {details?.effect ?? "No description available."}
            </p>
            <div className="absolute left-0 border-b-2 border-black -mt-5 bg-gradient-to-b from-black/0 to-black/30 via-black/10  w-full  h-5  flex items-end"></div>

            {details?.generation && (
              <div className="mt-4 rounded border-2 border-[#1a1a1a] bg-white/60 p-2 shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#666]">
                  Introduced
                </p>
                <p className="mt-1 text-[15px] font-bold uppercase text-[#444]">
                  {details.generation.replace("generation-", "Generation ")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= MOVE MODAL ================= */
function MoveModal({
  move,
  allMoves,
  onClose,
  zIndex,
  onFocus,
}: {
  move: PokemonMove;
  allMoves: PokemonMove[];
  onClose: () => void;
  zIndex: number;
  onFocus?: () => void;
}) {
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const w = 660;
    const h = 500;
    return {
      x: Math.max(24, Math.round((window.innerWidth - w) / 2 + 80)),
      y: Math.max(24, Math.round((window.innerHeight - h) / 2 + 60)),
    };
  });
  const [mounted, setMounted] = useState(false);
  const [details, setDetails] = useState<PokemonMoveDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareName, setCompareName] = useState("");
  const [compareDetails, setCompareDetails] = useState<PokemonMoveDetails | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMoveDetails(move.name)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [move.name]);

  useEffect(() => {
    if (!compareName) {
      setCompareDetails(null);
      return;
    }
    let cancelled = false;
    setCompareLoading(true);
    fetchMoveDetails(compareName)
      .then((d) => {
        if (!cancelled) setCompareDetails(d);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setCompareLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [compareName]);

  const catColor =
    details?.damageClass === "physical"
      ? "#C03028"
      : details?.damageClass === "special"
        ? "#6890F0"
        : "#A8A878";

  const renderStat = (
    label: string,
    a: number | null | undefined,
    b: number | null | undefined,
  ) => {
    const aVal = a ?? 0;
    const bVal = b ?? 0;
    const aWins = aVal > bVal;
    const bWins = bVal > aVal;
    return (
      <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2 border-b border-[#1a1a1a]/20 py-1.5 last:border-b-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#666]">
          {label}
        </span>
        <span
          className={`text-center font-mono text-sm font-black ${
            aWins ? "text-[#00A000]" : "text-[#333]"
          }`}
        >
          {a ?? "—"}
        </span>
        <span
          className={`text-center font-mono text-sm font-black ${
            bWins ? "text-[#00A000]" : "text-[#333]"
          }`}
        >
          {b ?? "—"}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={modalRef}
      className="pointer-events-auto fixed flex max-h-[calc(100dvh-24px)] w-[min(660px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border-4 border-[#1a1a1a] bg-gradient-to-b from-[#f0f0ff] to-[#d8d8f0] shadow-2xl transition-all duration-300 ease-out"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex,
        boxShadow: "10px 10px 0 rgba(0,0,0,0.65)",
        transform: mounted ? "scale(1)" : "scale(0.9)",
        opacity: mounted ? 1 : 0,
      }}
    >
      <div className="h-1.5 shrink-0" style={{ backgroundColor: catColor }} />

      <div
        onPointerDown={(e) => {
          const el = e.target as Element | null;
          if (el && el.closest("button")) {
            onFocus?.();
            return;
          }
          draggingRef.current = true;
          const rect = modalRef.current?.getBoundingClientRect();
          dragOffsetRef.current = {
            x: e.clientX - (rect?.left ?? 0),
            y: e.clientY - (rect?.top ?? 0),
          };
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {}
          onFocus?.();
        }}
        className="flex cursor-grab touch-none items-center justify-between border-b-4 border-[#1a1a1a] bg-gradient-to-br from-[#6060d0] to-[#3030a0] px-4 py-3 text-white select-none"
      >
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black uppercase tracking-wide text-white drop-shadow-md">
            {formatName(move.name)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 text-lg font-black text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/40"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f5f5ff] p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-8 text-[#666]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6060d0] border-t-transparent" />
            <p className="text-xs font-black uppercase tracking-widest">Loading…</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {details?.type && (
                <span
                  className="rounded-sm border-2 border-[#1a1a1a] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                  style={{
                    backgroundColor: TYPE_COLORS[details.type.toLowerCase()] || "#A8A878",
                  }}
                >
                  {details.type}
                </span>
              )}
              {details?.damageClass && (
                <span
                  className="rounded-sm border-2 border-[#1a1a1a] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)]"
                  style={{ backgroundColor: catColor }}
                >
                  {details.damageClass}
                </span>
              )}
              {move.level > 0 && (
                <span className="rounded-sm border-2 border-[#1a1a1a] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#333]">
                  Learned at Lv. {move.level}
                </span>
              )}
              {details?.priority && details.priority !== 0 && (
                <span className="rounded-sm border-2 border-[#1a1a1a] bg-[#ffe0a0] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#333]">
                  Priority {details.priority > 0 ? "+" : ""}
                  {details.priority}
                </span>
              )}
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded border-2 border-[#1a1a1a] bg-white p-2 text-center shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#666]">
                  Power
                </p>
                <p className="font-mono text-lg font-black text-[#333]">
                  {details?.power ?? "—"}
                </p>
              </div>
              <div className="rounded border-2 border-[#1a1a1a] bg-white p-2 text-center shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#666]">
                  Accuracy
                </p>
                <p className="font-mono text-lg font-black text-[#333]">
                  {details?.accuracy != null ? `${details.accuracy}%` : "—"}
                </p>
              </div>
              <div className="rounded border-2 border-[#1a1a1a] bg-white p-2 text-center shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#666]">
                  PP
                </p>
                <p className="font-mono text-lg font-black text-[#333]">
                  {details?.pp ?? "—"}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-[#666]">
                Effect
              </p>
              <p className="text-lg leading-relaxed text-[#333]">
                {details?.effect ?? "No effect description available."}
              </p>
            </div>

            <div className="rounded border-2 border-[#1a1a1a] bg-white p-3 shadow-[2px_2px_0_rgba(0,0,0,0.15)]">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#666]">
                Compare with
              </p>
              <select
                value={compareName}
                onChange={(e) => setCompareName(e.target.value)}
                className="w-full rounded-sm border-2 border-[#1a1a1a] bg-white p-2 text-[11px] font-black uppercase tracking-wide text-[#333]"
              >
                <option value="">— Select a move —</option>
                {allMoves
                  .filter((m) => m.name !== move.name)
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((m) => (
                    <option key={m.name} value={m.name}>
                      {formatName(m.name)}
                    </option>
                  ))}
              </select>

              {compareLoading && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#666]">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#6060d0] border-t-transparent" />
                  Loading comparison…
                </div>
              )}

              {compareDetails && !compareLoading && (
                <div className="mt-3">
                  <div className="mb-2 grid grid-cols-[80px_1fr_1fr] gap-2 border-b-2 border-[#1a1a1a] pb-1">
                    <span />
                    <span className="text-center text-[10px] font-black uppercase tracking-wider text-[#333]">
                      {formatName(move.name)}
                    </span>
                    <span className="text-center text-[10px] font-black uppercase tracking-wider text-[#333]">
                      {formatName(compareDetails.name)}
                    </span>
                  </div>
                  {renderStat("Power", details?.power, compareDetails.power)}
                  {renderStat("Accuracy", details?.accuracy, compareDetails.accuracy)}
                  {renderStat("PP", details?.pp, compareDetails.pp)}
                  {renderStat("Priority", details?.priority, compareDetails.priority)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}