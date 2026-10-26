import RegionDex from "../../components/RegionDex";

export const endId = 251;
export const JOHTO_COUNT = 100;
export const JOHTO_FRENCH_NAMES: Record<number, string> = {
  152: "Germignon", 153: "Macronium", 154: "Méganium",
  155: "Héricendre", 156: "Feurisson", 157: "Typhlosion",
  158: "Kaiminus", 159: "Crocconaw", 160: "Totodile",
  161: "Fouinette", 162: "Fouinar", 163: "Hoothoot", 164: "Noct", 165: "Noigrume", 166: "Charmillon",
  167: "Aspicot", 168: "Coconfort", 169: "Dardargnan",
  170: "Toutou", 171: "Malosse", 172: "Loupio", 173: "Piverdoux", 174: "Élekid", 175: "Magby",
  176: "Bouloupéen", 177: "Feuforêve", 178: "Capumain", 179: "Polymag", 180: "Polyravo", 181: "Polytoed",
  182: "Tarinorme", 183: "Tarpaud", 184: "Marcacrin", 185: "Cochignon", 186: "Coléodile",
  187: "Marill", 188: "Azumarill", 189: "Tétarte", 190: "Tétarenko",
  191: "Granivol", 192: "Floravol", 193: "Cotovol", 194: "Wattouat", 195: "Électrode", 196: "Natu",
  197: "Pharamp", 198: "Rhinocorne", 199: "Rhinoféros", 200: "Leveinard", 201: "Saquedeneu",
  202: "Kangourex", 203: "Hypotrempe", 204: "Hypocéan", 205: "Poissirène", 206: "Poissoroy",
  207: "Stari", 208: "Staross", 209: "M. Mime", 210: "Insécateur", 211: "Lippoutou",
  212: "Élektek", 213: "Magby", 214: "Scarabrute", 215: "Tauros", 216: "Magicarpe",
  217: "Léviator", 218: "Lokhlass", 219: "Métamorph", 220: "Évoli", 221: "Aquali",
  222: "Voltali", 223: "Pyroli", 224: "Porygon", 225: "Amonita", 226: "Amonistar",
  227: "Kabuto", 228: "Kabutops", 229: "Ptéra", 230: "Ronflex", 231: "Artikodin",
  232: "Électhor", 233: "Sulfura", 234: "Minidraco", 235: "Draco", 236: "Dracolosse",
  237: "Mewtwo", 238: "Mew", 239: "Suicune", 240: "Raikou", 241: "Entei",
  242: "Hohou", 243: "Lugia", 244: "Hooh", 245: "Célébi", 246: "Tygnon", 247: "Kicklee",
  248: "Excelangue", 249: "Smogo", 250: "Smogogo", 251: "Rhinocorne"
};

export default function JohtoDex() {
  return (
    <RegionDex
      endId={endId}
      title="Johto"
      startId={152}
      count={JOHTO_COUNT}
      accent="#7C9A52"
      desFcolor="#062148"
      statBarColor="bg-green-400"
      frenchNames={JOHTO_FRENCH_NAMES}
    />
  ); 
} 
