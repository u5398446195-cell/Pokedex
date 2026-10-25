"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { PokemonDetails, PokemonSummary } from "../lib/pokeapi";
import { fetchPokemonDetails, fetchMoveDetails } from "../lib/pokeapi";
import Image from "next/image";

type BattleState = "idle" | "intro" | "fighting" | "finished";

type MoveInfo = {
  name: string;
  power: number | null;
  type: string;
  damageClass: string;
};

type Particle = {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  color: string;
  delay: number;
  size: number;
  opacity: number;
};

const TYPE_COLORS: Record<string, string> = {
  fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
  ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
  flying: "#A890F0", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
  ghost: "#705898", dragon: "#7038F8", dark: "#705848", steel: "#B8B8D0",
  fairy: "#EE99AC", normal: "#A8A878",
};

const TYPE_CHART: Record<string, Record<string, number>> = {
  fire: { grass: 2, bug: 2, ice: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
  normal: { rock: 0.5, steel: 0.5, ghost: 0 },
};

const BASE_STAGE = new Set<number>([
  1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43,
  46, 48, 50, 52, 54, 56, 58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 83,
  84, 86, 90, 92, 95, 96, 98, 100, 102, 104, 108, 109, 111, 113, 114,
  115, 116, 118, 120, 122, 123, 124, 125, 126, 127, 128, 129, 131,
  132, 133, 137, 138, 140, 142, 143, 147, 150, 151,
]);
const MID_STAGE = new Set<number>([
  2, 5, 8, 11, 14, 17, 20, 22, 24, 26, 28, 30, 33, 36, 38, 40, 42, 44,
  47, 49, 51, 53, 55, 57, 59, 61, 64, 67, 70, 73, 75, 78, 80, 82, 85,
  87, 89, 91, 93, 97, 99, 101, 103, 105, 110, 112, 117, 119, 121,
  130, 139, 141, 144, 145, 146, 149,
]);

function getRealisticLevel(id: number): number {
  if (BASE_STAGE.has(id)) return 15;
  if (MID_STAGE.has(id)) return 35;
  return 50;
}

function getTypes(pokemon: PokemonDetails): string[] {
  if (!pokemon || !pokemon.types) return ["normal"];
  return pokemon.types.map((t: any) => {
    if (typeof t === "string") return t.toLowerCase();
    if (t && typeof t.name === "string") return t.name.toLowerCase();
    return "normal";
  });
}

function getPrimaryType(pokemon: PokemonDetails): string {
  const t = getTypes(pokemon);
  return t[0] ?? "normal";
}

function getTypeMultiplier(attackType: string, defenderTypes: string[]): number {
  let mult = 1;
  const chart = TYPE_CHART[attackType.toLowerCase()] || {};
  for (const dt of defenderTypes) {
    const m = chart[dt.toLowerCase()];
    if (m !== undefined) mult *= m;
  }
  return mult;
}

function getStat(pokemon: PokemonDetails, name: string): number {
  return pokemon.stats.find((s) => s.name === name)?.value ?? 50;
}

function formatMoveName(name: string) {
  return name.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function computeDamage(
  attacker: PokemonDetails,
  defender: PokemonDetails,
  move: MoveInfo | null,
): { damage: number; multiplier: number } {
  const atk = getStat(attacker, "ATK");
  const spa = getStat(attacker, "SP. ATK");
  const def = getStat(defender, "DEF");
  const spd = getStat(defender, "SP. DEF");

  const userOffense =
    move?.damageClass === "special" ? spa : move?.damageClass === "physical" ? atk : (atk + spa) / 2;
  const targetDefense =
    move?.damageClass === "special" ? spd : move?.damageClass === "physical" ? def : (def + spd) / 2;

  const basePower = move?.power ?? 40;
  const typeMult = move ? getTypeMultiplier(move.type, getTypes(defender)) : 1;

  const raw =
    ((2 * 50) / 5 + 2) * basePower * (userOffense / Math.max(1, targetDefense)) / 50 + 2;
  const withType = raw * typeMult;
  const withRandom = withType * (0.85 + Math.random() * 0.15);

  const percent = Math.round((withRandom / 150) * 100);
  return {
    damage: Math.max(5, Math.min(40, percent)),
    multiplier: typeMult,
  };
}

export default function SimulateBattle({
  own,
  pokemonList = [],
  onClose,
}: {
  own: PokemonDetails | null;
  pokemonList?: PokemonSummary[];
  onClose: () => void;
}) {
  const [opponent, setOpponent] = useState<PokemonDetails | null>(null);
  const [showChooser, setShowChooser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [battleState, setBattleState] = useState<BattleState>("idle");
  const [ownHp, setOwnHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [log, setLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  
  const [ownAction, setOwnAction] = useState<"none" | "attack" | "shake">("none");
  const [opponentAction, setOpponentAction] = useState<"none" | "attack" | "shake">("none");

  const [ownBestMove, setOwnBestMove] = useState<MoveInfo | null>(null);
  const [opponentBestMove, setOpponentBestMove] = useState<MoveInfo | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const logRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);

  const filteredPokemonList = useMemo(() => {
    if (!searchQuery) return pokemonList.slice(0, 80);
    const q = searchQuery.toLowerCase();
    return pokemonList.filter((p) => {
      const name = (p as any).englishName || p.englishName || `#${p.id}`;
      return name.toLowerCase().includes(q);
    });
  }, [searchQuery, pokemonList]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, showLog]);

  const clearAllTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    let cancelled = false;

    async function findBest(pokemon: PokemonDetails): Promise<MoveInfo | null> {
      const moves = pokemon.moves ?? [];
      if (moves.length === 0) return null;

      const maxLevel = getRealisticLevel(pokemon.id);
      const legal = moves.filter((m) => m.level <= maxLevel);
      if (legal.length === 0) return null;

      const candidates = [...legal].sort((a, b) => b.level - a.level).slice(0, 15);

      const results = await Promise.all(
        candidates.map(async (mv) => {
          try {
            const d = await fetchMoveDetails(mv.name);
            if (!d.power || d.power <= 0) return null;
            const moveType = d.type && TYPE_COLORS[d.type.toLowerCase()] ? d.type.toLowerCase() : getPrimaryType(pokemon);
            return { name: mv.name, power: d.power, type: moveType, damageClass: d.damageClass } as MoveInfo;
          } catch {
            return null;
          }
        }),
      );

      const valid = results.filter((r): r is MoveInfo => r !== null);
      if (valid.length === 0) return null;
      valid.sort((a, b) => (b.power ?? 0) - (a.power ?? 0));
      return valid[0];
    }

    if (own) findBest(own).then((m) => !cancelled && setOwnBestMove(m));
    else setOwnBestMove(null);

    if (opponent) findBest(opponent).then((m) => !cancelled && setOpponentBestMove(m));
    else setOpponentBestMove(null);

    return () => {
      cancelled = true;
    };
  }, [own, opponent]);

  const pickFromList = useCallback(
    async (id: number) => {
      clearAllTimers();
      try {
        const details = await fetchPokemonDetails(id, {});
        setOpponent(details);
        setShowChooser(false);
        setSearchQuery("");
        setBattleState("idle");
        setOwnHp(100);
        setOpponentHp(100);
        setLog([]);
        setWinner(null);
        setParticles([]);
      } catch {
        setOpponent(null);
      }
    },
    [clearAllTimers],
  );

  const triggerParticles = (fromWho: "own" | "opp", type: string) => {
    const attackerObj = fromWho === "own" ? own : opponent;
    const fallbackType = attackerObj ? getPrimaryType(attackerObj) : "normal";
    const validTypeName = type && TYPE_COLORS[type.toLowerCase()] ? type.toLowerCase() : fallbackType;
    const rawColor = TYPE_COLORS[validTypeName] || TYPE_COLORS["normal"];

    const newParticles: Particle[] = Array.from({ length: 20 }).map(() => {
      const startX = fromWho === "own" ? 28 : 72;
      const startY = fromWho === "own" ? 68 : 32;
      const endX = fromWho === "own" ? 72 : 28;
      const endY = fromWho === "own" ? 32 : 68;

      const controlX = (startX + endX) / 2 + (Math.random() * 36 - 18);
      const controlY = Math.min(startY, endY) - 15 - Math.random() * 25;

      return {
        id: Math.random(),
        startX,
        startY,
        endX,
        endY,
        controlX,
        controlY,
        color: rawColor,
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 10,
        opacity: 0.5 + Math.random() * 0.5,
      };
    });

    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  const executeAttack = (
    attacker: "own" | "opp",
    moveLabel: string,
    moveType: string,
    damage: number,
    multiplier: number,
  ) => {
    if (cancelledRef.current) return;

    if (attacker === "own") {
      setOwnAction("attack");
      setTimeout(() => setOwnAction("none"), 400);
    } else {
      setOpponentAction("attack");
      setTimeout(() => setOpponentAction("none"), 400);
    }

    triggerParticles(attacker, moveType);

    timeoutsRef.current.push(
      setTimeout(() => {
        if (cancelledRef.current) return;
        if (attacker === "own") {
          setOpponentHp((prev) => Math.max(0, prev - damage));
          setOpponentAction("shake");
          setTimeout(() => setOpponentAction("none"), 300);
        } else {
          setOwnHp((prev) => Math.max(0, prev - damage));
          setOwnAction("shake");
          setTimeout(() => setOwnAction("none"), 300);
        }
      }, 700),
    );
  };

  const runSimulation = useCallback(() => {
    if (!own || !opponent) return;
    clearAllTimers();
    cancelledRef.current = false;

    setBattleState("intro");
    setWinner(null);
    setOwnHp(100);
    setOpponentHp(100);
    setParticles([]);

    const ownMoveLabel = ownBestMove ? formatMoveName(ownBestMove.name).toUpperCase() : "TACKLE";
    const oppMoveLabel = opponentBestMove ? formatMoveName(opponentBestMove.name).toUpperCase() : "TACKLE";
    
    const ownFaster = getStat(own, "SPD") >= getStat(opponent, "SPD");

    let currentOwnHp = 100;
    let currentOppHp = 100;
    let turn = 0;
    const maxTurns = 20;

    setLog([
      `A wild ${opponent.englishName.toUpperCase()} appeared!`,
      `Go! ${own.englishName.toUpperCase()}!`,
    ]);

    const introTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      setBattleState("fighting");

      const tick = () => {
        if (cancelledRef.current) return;
        if (currentOwnHp <= 0 || currentOppHp <= 0 || turn >= maxTurns) {
          const finalWinner = currentOwnHp > 0 ? own.englishName : opponent.englishName;
          setWinner(finalWinner);
          setBattleState("finished");
          setLog((prev) => [
            ...prev,
            finalWinner === own.englishName
              ? `${own.englishName.toUpperCase()} wins the battle!`
              : `${opponent.englishName.toUpperCase()} won the battle!`,
          ]);
          return;
        }

        turn++;
        const order = ownFaster ? (["own", "opp"] as const) : (["opp", "own"] as const);

        const first = order[0];
        const logBatch: string[] = [];

        if (first === "own" && currentOppHp > 0) {
          const moveType = ownBestMove?.type || getPrimaryType(own);
          const { damage, multiplier } = computeDamage(own, opponent, ownBestMove);
          currentOppHp = Math.max(0, currentOppHp - damage);

          executeAttack("own", ownMoveLabel, moveType, damage, multiplier);

          let msg = `${own.englishName.toUpperCase()} used ${ownMoveLabel}!`;
          if (multiplier > 1) msg += " It's super effective!";
          else if (multiplier < 1 && multiplier > 0) msg += " It's not very effective...";
          else if (multiplier === 0) msg += " It had no effect...";
          logBatch.push(msg);
        } else if (first === "opp" && currentOwnHp > 0) {
          const moveType = opponentBestMove?.type || getPrimaryType(opponent);
          const { damage, multiplier } = computeDamage(opponent, own, opponentBestMove);
          currentOwnHp = Math.max(0, currentOwnHp - damage);

          executeAttack("opp", oppMoveLabel, moveType, damage, multiplier);

          let msg = `${opponent.englishName.toUpperCase()} used ${oppMoveLabel}!`;
          if (multiplier > 1) msg += " It's super effective!";
          else if (multiplier < 1 && multiplier > 0) msg += " It's not very effective...";
          else if (multiplier === 0) msg += " It had no effect...";
          logBatch.push(msg);
        }
        if (logBatch.length) setLog((prev) => [...prev, ...logBatch]);

        timeoutsRef.current.push(
          setTimeout(() => {
            if (cancelledRef.current) return;
            if (currentOwnHp <= 0 || currentOppHp <= 0) {
              tick();
              return;
            }

            const second = order[1];
            const log2: string[] = [];

            if (second === "own" && currentOppHp > 0) {
              const moveType = ownBestMove?.type || getPrimaryType(own);
              const { damage, multiplier } = computeDamage(own, opponent, ownBestMove);
              currentOppHp = Math.max(0, currentOppHp - damage);

              executeAttack("own", ownMoveLabel, moveType, damage, multiplier);

              let msg = `${own.englishName.toUpperCase()} used ${ownMoveLabel}!`;
              if (multiplier > 1) msg += " It's super effective!";
              else if (multiplier < 1 && multiplier > 0) msg += " It's not very effective...";
              else if (multiplier === 0) msg += " It had no effect...";
              log2.push(msg);
            } else if (second === "opp" && currentOwnHp > 0) {
              const moveType = opponentBestMove?.type || getPrimaryType(opponent);
              const { damage, multiplier } = computeDamage(opponent, own, opponentBestMove);
              currentOwnHp = Math.max(0, currentOwnHp - damage);

              executeAttack("opp", oppMoveLabel, moveType, damage, multiplier);

              let msg = `${opponent.englishName.toUpperCase()} used ${oppMoveLabel}!`;
              if (multiplier > 1) msg += " It's super effective!";
              else if (multiplier < 1 && multiplier > 0) msg += " It's not very effective...";
              else if (multiplier === 0) msg += " It had no effect...";
              log2.push(msg);
            }
            if (log2.length) setLog((prev) => [...prev, ...log2]);

            timeoutsRef.current.push(setTimeout(tick, 1000));
          }, 1000),
        );
      };

      tick();
    }, 600);

    timeoutsRef.current.push(introTimer);
  }, [own, opponent, ownBestMove, opponentBestMove, clearAllTimers]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    clearAllTimers();
    setOpponent(null);
    setBattleState("idle");
    setOwnHp(100);
    setOpponentHp(100);
    setLog([]);
    setWinner(null);
    setShowChooser(false);
    setParticles([]);
    setOwnAction("none");
    setOpponentAction("none");
  }, [clearAllTimers]);

  const frontSprite = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const backSprite = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;

  const ownTypeColor = own ? TYPE_COLORS[getPrimaryType(own)] ?? "#A8A878" : "#A8A878";
  const opponentTypeColor = opponent ? TYPE_COLORS[getPrimaryType(opponent)] ?? "#A8A878" : "#A8A878";

  const hpColor = (hp: number) => (hp > 60 ? "#4ade80" : hp > 30 ? "#facc15" : "#ef4444");

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full max-h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-4 border-[#1a1a1a] bg-white shadow-[0_0_80px_rgba(0,0,0,0.95)]">
        
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b-4 border-[#1a1a1a] bg-[#c71938] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#1a1a1a] bg-[#ffcb05] sm:h-10 sm:w-10">
              <div className="h-2 w-2 rounded-full bg-[#1a1a1a] sm:h-3 sm:w-3" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black uppercase tracking-widest text-white sm:text-xl">
                Battle Arena
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
                {battleState === "idle" && "› Select your opponent"}
                {battleState === "intro" && "› Battle starting..."}
                {battleState === "fighting" && "› Battle in progress"}
                {battleState === "finished" && "› Battle finished"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLog((v) => !v)}
              className="flex h-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3.5 text-xs font-bold tracking-wide text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            >
              {showLog ? "Hide Log" : "Log"}
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ARENA */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-50">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(circle at 20% 70%, ${ownTypeColor}66 0%, transparent 50%),
                radial-gradient(circle at 80% 30%, ${opponentTypeColor}66 0%, transparent 50%)
              `,
              filter: "blur(60px)",
            }}
          />

          {/* PARTICLES OVERLAY */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none z-20 animate-particle-curve"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.opacity,
                boxShadow: `0 0 12px ${p.color}, inset 0 0 4px rgba(255,255,255,0.8)`,
                filter: Math.random() > 0.5 ? "brightness(1.4)" : "brightness(0.7)",
                "--start-x": `${p.startX}%`,
                "--start-y": `${p.startY}%`,
                "--control-x": `${p.controlX}%`,
                "--control-y": `${p.controlY}%`,
                "--end-x": `${p.endX}%`,
                "--end-y": `${p.endY}%`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties}
            />
          ))}

          {/* Opponent UI */}
          {opponent && (
            <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1 sm:right-8 sm:top-6">
              <div className="relative w-[220px] rounded-xl border-3 border-[#1a1a1a] bg-[#f8f8e8] px-3 py-1.5 shadow-[4px_4px_0_#1a1a1a] sm:w-[280px]">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-black sm:text-sm">
                  <span className="truncate">{opponent.englishName}</span>
                  <span className="ml-2 shrink-0">Lv{getRealisticLevel(opponent.id)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-black text-black">HP</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[#1a1a1a] bg-stone-300">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{ width: `${opponentHp}%`, backgroundColor: hpColor(opponentHp) }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-[10px] font-black text-black">
                    {opponentHp}%
                  </span>
                </div>
              </div>

              <div className={`relative h-32 w-32 sm:h-44 sm:w-44 ${opponentAction === "shake" ? "animate-shake" : opponentAction === "attack" ? "animate-vibrate-opp" : ""}`}>
                <Image
                  src={frontSprite(opponent.id)}
                  alt={opponent.englishName}
                  fill
                  sizes="(max-width: 640px) 128px, 176px"
                  className="object-contain drop-shadow-md"
                  style={{ imageRendering: "pixelated" }}
                  unoptimized
                />
              </div>
            </div>
          )}

          {!opponent && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-black/60">
                No opponent selected
              </p>
              <button
                onClick={() => setShowChooser(true)}
                className="rounded-xl border border-black/10 bg-black/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black backdrop-blur-md transition hover:bg-black/10 active:scale-95 sm:text-sm"
              >
                Choose Opponent
              </button>
            </div>
          )}

          {/* Own UI */}
          {own && (
            <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-1 sm:bottom-6 sm:left-8">
              <div className={`relative h-36 w-36 sm:h-52 sm:w-52 ${ownAction === "shake" ? "animate-shake" : ownAction === "attack" ? "animate-vibrate-own" : ""}`}>
                <Image
                  src={backSprite(own.id)}
                  alt={own.englishName}
                  fill
                  sizes="(max-width: 640px) 144px, 208px"
                  className="object-contain drop-shadow-md"
                  style={{ imageRendering: "pixelated" }}
                  unoptimized
                />
              </div>

              <div className="relative w-[220px] rounded-xl border-3 border-[#1a1a1a] bg-[#f8f8e8] px-3 py-1.5 shadow-[4px_4px_0_#1a1a1a] sm:w-[280px]">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-black sm:text-sm">
                  <span className="truncate">{own.englishName}</span>
                  <span className="ml-2 shrink-0">Lv{getRealisticLevel(own.id)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-black text-black">HP</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[#1a1a1a] bg-stone-300">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{ width: `${ownHp}%`, backgroundColor: hpColor(ownHp) }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-[10px] font-black text-black">{ownHp}%</span>
                </div>
              </div>
            </div>
          )}

          {winner && battleState === "finished" && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center">
              <div className="mx-auto inline-block rounded-xl border-4 border-[#1a1a1a] bg-[#ffcb05] px-6 py-3 shadow-[6px_6px_0_#1a1a1a]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/70">
                  ★ Winner ★
                </p>
                <p className="text-xl font-black uppercase tracking-wider text-[#1a1a1a] sm:text-3xl">
                  {winner}
                </p>
              </div>
            </div>
          )}

          {/* Chooser Modal */}
          {showChooser && (
            <div className="absolute inset-0 z-30 flex flex-col bg-black/80 p-3 backdrop-blur-sm sm:p-6">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border-4 border-[#1a1a1a] bg-[#f8f8e8] shadow-[8px_8px_0_#1a1a1a]">
                <div className="flex shrink-0 items-center justify-between border-b-4 border-[#1a1a1a] bg-[#c71938] px-4 py-3">
                  <h3 className="text-base font-black uppercase tracking-widest text-white sm:text-lg">
                    Choose Opponent
                  </h3>
                  <button
                    onClick={() => setShowChooser(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white/60 bg-white/20 text-base font-black text-white transition hover:bg-white/40 active:scale-90"
                  >
                    ✕
                  </button>
                </div>
                <div className="shrink-0 border-b-2 border-[#1a1a1a]/20 p-3 sm:p-4">
                  <input
                    type="text"
                    placeholder="Search a Pokémon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#1a1a1a] bg-white px-3 py-2 text-sm font-bold text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:ring-2 focus:ring-[#c71938]"
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                    {filteredPokemonList.slice(0, 120).map((p) => {
                      const pokemonName = (p as any).englishName || p.englishName || `#${p.id}`;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => pickFromList(p.id)}
                          className="group flex flex-col items-center gap-1 rounded-xl border-2 border-[#1a1a1a] bg-white p-2 transition hover:bg-[#fff5d0] active:scale-95"
                        >
                          <Image
                            src={frontSprite(p.id)}
                            alt={pokemonName}
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain"
                            style={{ imageRendering: "pixelated" }}
                            unoptimized
                          />
                          <span className="line-clamp-1 text-center text-[9px] font-black uppercase tracking-wider text-[#1a1a1a]">
                            {pokemonName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LOG DRAWER */}
        {showLog && (
          <div
            ref={logRef}
            className="h-28 shrink-0 overflow-y-auto border-t-4 border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 font-mono text-[11px] text-[#c8ffa8] sm:h-32 sm:px-6 sm:py-3 sm:text-xs"
          >
            {log.length === 0 ? (
              <p className="text-white/40">— Awaiting battle start —</p>
            ) : (
              log.map((line, i) => (
                <p key={i} className="leading-relaxed">
                  <span className="text-white/30">›</span> {line}
                </p>
              ))
            )}
          </div>
        )}

        {/* FOOTER CONTROLS */}
        <div className="flex shrink-0 gap-2.5 border-t-4 border-[#1a1a1a] bg-[#c71938] px-4 py-3 sm:px-6 sm:py-4">
          <button
            onClick={runSimulation}
            disabled={!own || !opponent || battleState === "fighting" || battleState === "intro"}
            className="flex-1 rounded-xl border-3 border-[#1a1a1a] bg-[#ffcb05] px-4 py-2.5 text-sm font-black uppercase tracking-widest text-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] transition hover:bg-[#ffe040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
          >
            {battleState === "fighting" || battleState === "intro"
              ? "⚔ Battling..."
              : battleState === "finished"
                ? "↻ Fight Again"
                : "⚔ Start Battle"}
          </button>

          {opponent && battleState !== "fighting" && battleState !== "intro" && (
            <>
              <button
                onClick={() => setShowChooser(true)}
                className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 sm:text-sm"
              >
                Change
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/25 active:scale-95 sm:text-sm"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}