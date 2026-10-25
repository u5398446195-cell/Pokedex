export type DexRegionKey = "kanto" | "johto";

export type DexRegion = {
  key: DexRegionKey;
  label: string;
  startId: number;
  count: number;
  accent: string;
  description: string;
  frenchNames: Record<number, string>;
};

export const REGION_CONFIG: Record<DexRegionKey, DexRegion> = {
  kanto: {
    key: "kanto",
    label: "Kanto",
    startId: 1,
    count: 151,
    accent: "#f62d5f",
    description: "Première région et berceau des Pokémon.",
    frenchNames: {},
  },
  johto: {
    key: "johto",
    label: "Johto",
    startId: 152,
    count: 251,
    accent: "#7C9A52",
    description: "Une seconde région riche en mystères et en légendes.",
    frenchNames: {},
  },
};
