"use client";

import type { PokemonDetails } from "../lib/pokeapi";
import Image from "next/image";
import { STAT_LABELS } from "../data/kanto";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || "#999999";
}

export function StatsModalPolaroid({
  activePokemon,
  onClose,
}: {
  activePokemon: PokemonDetails | null;
  onClose: () => void;
}) {
  if (!activePokemon) return null;

  const primaryType = Array.isArray(activePokemon.types)
    ? typeof activePokemon.types[0] === "string"
      ? (activePokemon.types[0] as string)
      : "normal"
    : "normal";

  const bgColor = getTypeColor(primaryType);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-2xl">

        {/* ===== HEADER ===== */}
        <div className="flex shrink-0 items-center justify-between border-b-4 border-gray-300 p-3 sm:p-4">
          <h2 className="text-xl font-black text-gray-800 sm:text-2xl">STATS</h2>
          <button
            onClick={onClose}
            className="text-2xl font-black text-gray-600 hover:text-red-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ===== CONTENU SCROLLABLE ===== */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div
            className="bg-white shadow-lg"
            style={{ borderColor: bgColor, borderWidth: "8px" }}
          >
            {/* Bandeau coloré */}
            <div
              style={{ backgroundColor: bgColor }}
              className="flex flex-col items-center gap-2 px-4 py-4"
            >
              <h3 className="text-xl font-black uppercase text-white sm:text-2xl">
                {activePokemon.englishName}
              </h3>
              <p className="font-mono text-sm text-white/90">
                #{String(activePokemon.id).padStart(3, "0")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {Array.isArray(activePokemon.types) &&
                  activePokemon.types.map((t) => {
                    const typeName = typeof t === "string" ? t : "unknown";
                    return (
                      <span
                        key={typeName}
                        className="rounded-full px-3 py-1 text-xs font-black text-white"
                        style={{ backgroundColor: getTypeColor(typeName) }}
                      >
                        {typeName.toUpperCase()}
                      </span>
                    );
                  })}
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center bg-gradient-to-b from-blue-100 to-white p-4 sm:p-6">
              <Image
                src={activePokemon.artwork}
                alt={activePokemon.englishName}
                width={180}
                height={180}
                className="h-32 w-32 object-contain sm:h-40 sm:w-40"
              />
            </div>

            {/* Stats */}
            <div className="border-t-4 border-gray-300  p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {activePokemon.stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="rounded border-2 border-gray-300 p-2"
                  >
                    <span className="text-[10px] font-black uppercase text-gray-600">
                      {STAT_LABELS[stat.name] || stat.name}
                    </span>
                    <p
                      className="font-mono text-lg font-black"
                      style={{ color: bgColor }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer du polaroid */}
            <div className="bg-gray-100 p-3 text-center font-mono text-xs text-gray-600 sm:p-4">
              {activePokemon.englishName.toUpperCase()}
            </div>
          </div>
        </div>

        {/* ===== FOOTER BOUTON ===== */}
        <div className="shrink-0 border-t-4 border-gray-300 p-3 sm:p-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg border-2 border-gray-400 bg-gray-200 px-4 py-2 font-black text-gray-800 hover:bg-gray-300"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}