export type PokemonSummary = {
  id: number;
  englishName: string;
  frenchName: string;
  sprite: string; 
};

export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonAbilityRef = {
  name: string;
  isHidden: boolean;
  slot: number;
};

export type PokemonMove = {
  name: string;
  level: number;
};

export type PokemonDetails = {
  id: number;
  englishName: string;
  frenchName: string;
  artwork: string;
  types: string[];
  stats: PokemonStat[];
  abilities: PokemonAbilityRef[];
  moves: PokemonMove[];
  description: string;
  genus: string;
  height: number;
  weight: number;
};

export type PokemonAbilityDetails = {
  name: string;
  effect: string;
  shortEffect: string;
  generation: string;
};

export type PokemonMoveDetails = {
  name: string;
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effect: string;
  shortEffect: string;
};

const API = "https://pokeapi.co/api/v2";

// Version de référence UNIQUE pour tous les movesets level-up.
// "red-blue" = movesets originaux Kanto (Bulbizarre n'a PAS Solar Beam avant N.48).
// Si tu veux la gen moderne, remplace par "scarlet-violet" (mais Solar Beam y est N.36).
const REFERENCE_VERSION = "red-blue";

const cache: Record<string, any> = {};

async function cachedFetch(url: string) {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url}`);
  const data = await res.json();
  cache[url] = data;
  return data;
}

export async function fetchPokemonDetails(
  id: number,
  frenchNames: Record<number, string> = {},
): Promise<PokemonDetails> {
  const [pokemon, species] = await Promise.all([
    cachedFetch(`${API}/pokemon/${id}`),
    cachedFetch(`${API}/pokemon-species/${id}`),
  ]);

  const statsMap: Record<string, string> = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SP. ATK",
    "special-defense": "SP. DEF",
    speed: "SPD",
  };

  const englishEntry = species.flavor_text_entries?.find(
    (e: any) => e.language.name === "en",
  );
  const englishGenus = species.genera?.find(
    (g: any) => g.language.name === "en",
  );

  // ===== MOVES =====
  // 1. Uniquement les moves appris par level-up
  // 2. Dans la version de référence (red-blue)
  // 3. Dédupliqués par nom
  // 4. Triés par niveau croissant
  const seen = new Set<string>();
  const levelUpMoves: PokemonMove[] = [];

  for (const m of pokemon.moves ?? []) {
    const levelUp = m.version_group_details?.find(
      (v: any) =>
        v.move_learn_method?.name === "level-up" &&
        v.version_group?.name === REFERENCE_VERSION,
    );
    if (!levelUp) continue;
    if (seen.has(m.move.name)) continue;

    seen.add(m.move.name);
    levelUpMoves.push({
      name: m.move.name,
      level: levelUp.level_learned_at ?? 0,
    });
  }

  levelUpMoves.sort((a, b) => a.level - b.level);

  return {
    id,
    englishName: pokemon.name,
    frenchName: frenchNames[id] ?? pokemon.name,
    artwork:
      pokemon.sprites?.other?.["official-artwork"]?.front_default ??
      pokemon.sprites?.front_default,
    types: pokemon.types.map((t: any) => t.type.name),
    stats: pokemon.stats.map((s: any) => ({
      name: statsMap[s.stat.name] ?? s.stat.name,
      value: s.base_stat,
    })),
    abilities: pokemon.abilities.map((a: any) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
    })),
    moves: levelUpMoves,
    description: englishEntry?.flavor_text?.replace(/\f|\n/g, " ") ?? "",
    genus: englishGenus?.genus ?? "",
    height: pokemon.height,
    weight: pokemon.weight,
  };
}

export async function fetchAbilityDetails(
  name: string,
): Promise<PokemonAbilityDetails> {
  const data = await cachedFetch(`${API}/ability/${name}`);
  const en = data.effect_entries?.find((e: any) => e.language.name === "en");
  return {
    name: data.name,
    effect: en?.effect ?? "No description available.",
    shortEffect: en?.short_effect ?? "",
    generation: data.generation?.name ?? "",
  };
}

export async function fetchMoveDetails(
  name: string,
): Promise<PokemonMoveDetails> {
  const data = await cachedFetch(`${API}/move/${name}`);
  const en = data.effect_entries?.find((e: any) => e.language.name === "en");
  return {
    name: data.name,
    type: data.type?.name ?? "normal",
    damageClass: data.damage_class?.name ?? "status",
    power: data.power,
    accuracy: data.accuracy,
    pp: data.pp,
    priority: data.priority ?? 0,
    effect: en?.effect ?? "No effect description available.",
    shortEffect: en?.short_effect ?? "",
  };
}

export async function fetchRegionList({
  startId,
  limit,
  frenchNames = {},
}: {
  startId: number;
  limit: number;
  frenchNames?: Record<number, string>;
}): Promise<PokemonSummary[]> {
  const ids = Array.from({ length: limit }, (_, i) => startId + i);
  const results = await Promise.all(
    ids.map(async (id) => {
      const data = await cachedFetch(`${API}/pokemon/${id}`);
      return {
        id,
        englishName: data.name,
        frenchName: frenchNames[id] ?? data.name,
        sprite: data.sprites?.front_default ?? "", // <-- Et récupéré ici
      };
    }),
  );
  return results;
}