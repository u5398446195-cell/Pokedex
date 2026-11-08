// Toutes les régions du Pokédex national (n° 1 à 1025).
// Kanto, Johto et Hoenn ont leurs propres pages (dossiers kanto/, johto/, Hoenn/) ;
// les autres passent par la page dynamique pokedex/[region].
// Les cartes (public/*PIC.*) sont des illustrations officielles des jeux, © Nintendo / Creatures / GAME FREAK.

export type RegionInfo = {
  slug: string;
  name: string;
  href: string;
  image: string;
  gen: string;
  startId: number;
  endId: number;
  starters: number[];
  accent: string;
  desFcolor: string;
  statBarColor: string;
};

export const REGIONS: RegionInfo[] = [
  { slug: "kanto", name: "Kanto", href: "/pokedex/kanto", image: "/KantoPIC.avif", gen: "GÉN. I", startId: 1, endId: 151, starters: [1, 4, 7], accent: "#d51e3c", desFcolor: "#710808", statBarColor: "bg-[#ffdc74]" },
  { slug: "johto", name: "Johto", href: "/pokedex/johto", image: "/JohtoPIC.webp", gen: "GÉN. II", startId: 152, endId: 251, starters: [152, 155, 158], accent: "#7C9A52", desFcolor: "#062148", statBarColor: "bg-green-400" },
  { slug: "hoenn", name: "Hoenn", href: "/pokedex/Hoenn", image: "/HoennPIC.webp", gen: "GÉN. III", startId: 252, endId: 386, starters: [252, 255, 258], accent: "#008080", desFcolor: "#004D4D", statBarColor: "bg-teal-500" },
  { slug: "sinnoh", name: "Sinnoh", href: "/pokedex/sinnoh", image: "/SinnohPIC.webp", gen: "GÉN. IV", startId: 387, endId: 493, starters: [387, 390, 393], accent: "#5b6bb5", desFcolor: "#232a5c", statBarColor: "bg-indigo-400" },
  { slug: "unova", name: "Unys", href: "/pokedex/unova", image: "/UnovaPIC.webp", gen: "GÉN. V", startId: 494, endId: 649, starters: [495, 498, 501], accent: "#3a3a3a", desFcolor: "#111111", statBarColor: "bg-zinc-400" },
  { slug: "kalos", name: "Kalos", href: "/pokedex/kalos", image: "/KalosPIC.webp", gen: "GÉN. VI", startId: 650, endId: 721, starters: [650, 653, 656], accent: "#2b6cb0", desFcolor: "#12325a", statBarColor: "bg-sky-400" },
  { slug: "alola", name: "Alola", href: "/pokedex/alola", image: "/AlolaPIC.webp", gen: "GÉN. VII", startId: 722, endId: 809, starters: [722, 725, 728], accent: "#e8743b", desFcolor: "#6b2a0c", statBarColor: "bg-orange-300" },
  { slug: "galar", name: "Galar", href: "/pokedex/galar", image: "/GalarPIC.webp", gen: "GÉN. VIII", startId: 810, endId: 898, starters: [810, 813, 816], accent: "#8e2a6b", desFcolor: "#3d0f2d", statBarColor: "bg-fuchsia-400" },
  { slug: "hisui", name: "Hisui", href: "/pokedex/hisui", image: "/HisuiPIC.webp", gen: "LÉGENDES", startId: 899, endId: 905, starters: [899, 900, 905], accent: "#7a6a3a", desFcolor: "#3a3016", statBarColor: "bg-amber-300" },
  { slug: "paldea", name: "Paldea", href: "/pokedex/paldea", image: "/PaldeaPIC.webp", gen: "GÉN. IX", startId: 906, endId: 1025, starters: [906, 909, 912], accent: "#c2410c", desFcolor: "#5a1d06", statBarColor: "bg-red-300" },
];

export const LAST_POKEMON_ID = 1025;

const pad = (n: number) => String(n).padStart(3, "0");
export const rangeLabel = (r: RegionInfo) => `${pad(r.startId)}-${pad(r.endId)}`;
export const countOf = (r: RegionInfo) => r.endId - r.startId + 1;

// Sprite animé (Noir & Blanc) jusqu'au n° 649, sprite fixe ensuite
const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
export const regionSprite = (id: number) =>
  id <= 649 ? `${SPRITES}/versions/generation-v/black-white/animated/${id}.gif` : `${SPRITES}/${id}.png`;
