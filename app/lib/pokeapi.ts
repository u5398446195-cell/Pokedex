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

const cache: Record<string, any> = {};

// Groupe de versions préféré pour chaque génération.
const VERSION_GROUPS: Record<number, string[]> = {
  1: ["red-blue", "yellow"],
  2: ["gold-silver", "crystal"],
  3: ["ruby-sapphire", "emerald", "firered-leafgreen"],
  4: ["diamond-pearl", "platinum", "heartgold-soulsilver"],
  5: ["black-white", "black-2-white-2"],
  6: ["x-y", "omega-ruby-alpha-sapphire"],
  7: ["sun-moon", "ultra-sun-ultra-moon"],
  8: ["sword-shield", "brilliant-diamond-and-shining-pearl"],
  9: ["scarlet-violet"],
};

async function cachedFetch(url: string): Promise<any> {
  if (cache[url]) return cache[url];

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const data = await res.json();
  cache[url] = data;

  return data;
}

function getPreferredVersionGroups(generation: number): string[] {
  const groups = VERSION_GROUPS[generation];
  if (groups) return groups;
  return VERSION_GROUPS[9];
}

export async function fetchPokemonDetails(
  id: number,
  frenchNames: Record<number, string> = {}, // <--- Repris en optionnel pour éviter l'erreur TypeScript
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
    (entry: any) => entry.language.name === "en",
  );

  const englishGenus = species.genera?.find(
    (entry: any) => entry.language.name === "en",
  );

  // Récupération du vrai nom français depuis l'API
  const frenchNameEntry = species.names?.find(
    (entry: any) => entry.language.name === "fr",
  );

  // Choisit les groupes de versions en fonction de la génération d'origine
  const generationNumber = Number(
    species.generation?.name?.replace("generation-", ""),
  );

  const preferredGroups = getPreferredVersionGroups(generationNumber);

  const seen = new Set<string>();
  const levelUpMoves: PokemonMove[] = [];

  for (const moveEntry of pokemon.moves ?? []) {
    const details = moveEntry.version_group_details ?? [];

    const levelUpDetails = details.filter(
      (detail: any) =>
        detail.move_learn_method?.name === "level-up",
    );

    let selectedDetail = levelUpDetails.find(
      (detail: any) =>
        preferredGroups.includes(detail.version_group?.name),
    );

    if (!selectedDetail) {
      selectedDetail = levelUpDetails
        .filter(
          (detail: any) =>
            detail.version_group?.name !== undefined,
        )
        .sort((a: any, b: any) => {
          const indexA = preferredGroups.indexOf(
            a.version_group?.name,
          );
          const indexB = preferredGroups.indexOf(
            b.version_group?.name,
          );

          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;

          return indexA - indexB;
        })[0];
    }

    if (!selectedDetail) continue;

    const name = moveEntry.move.name;

    if (seen.has(name)) continue;
    seen.add(name);

    levelUpMoves.push({
      name,
      level: selectedDetail.level_learned_at ?? 0,
    });
  }

  levelUpMoves.sort(
    (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  );

  return {
    id,
    englishName: pokemon.name,
    // Priorité au dictionnaire s'il est fourni, sinon l'API, sinon l'anglais
    frenchName: frenchNames[id] ?? frenchNameEntry?.name ?? pokemon.name,
    artwork:
      pokemon.sprites?.other?.["official-artwork"]?.front_default ??
      pokemon.sprites?.front_default ??
      "",
    types: pokemon.types.map((entry: any) => entry.type.name),
    stats: pokemon.stats.map((entry: any) => ({
      name: statsMap[entry.stat.name] ?? entry.stat.name,
      value: entry.base_stat,
    })),
    abilities: pokemon.abilities.map((entry: any) => ({
      name: entry.ability.name,
      isHidden: entry.is_hidden,
      slot: entry.slot,
    })),
    moves: levelUpMoves,
    description:
      englishEntry?.flavor_text?.replace(/[\f\n\r]/g, " ") ?? "",
    genus: englishGenus?.genus ?? "",
    height: pokemon.height,
    weight: pokemon.weight,
  };
}

export async function fetchAbilityDetails(
  name: string,
): Promise<PokemonAbilityDetails> {
  const data = await cachedFetch(`${API}/ability/${name}`);

  const en = data.effect_entries?.find(
    (entry: any) => entry.language.name === "en",
  );

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

  const en = data.effect_entries?.find(
    (entry: any) => entry.language.name === "en",
  );

  return {
    name: data.name,
    type: data.type?.name ?? "normal",
    damageClass: data.damage_class?.name ?? "status",
    power: data.power ?? null,
    accuracy: data.accuracy ?? null,
    pp: data.pp ?? null,
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
  const ids = Array.from(
    { length: limit },
    (_, index) => startId + index,
  );

  return Promise.all(
    ids.map(async (id) => {
      const data = await cachedFetch(`${API}/pokemon/${id}`);

      return {
        id,
        englishName: data.name,
        frenchName: frenchNames[id] ?? data.name,
        sprite: data.sprites?.front_default ?? "",
      };
    }),
  );
}