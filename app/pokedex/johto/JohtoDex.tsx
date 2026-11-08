import RegionDex from "../../components/RegionDex";

export const endId = 251;
export const JOHTO_COUNT = 100;
export const JOHTO_FRENCH_NAMES: Record<number, string> = {
  152: "Germignon", 153: "Macronium", 154: "Méganium", 155: "Héricendre", 156: "Feurisson", 157: "Typhlosion",
  158: "Kaiminus", 159: "Crocrodil", 160: "Aligatueur", 161: "Fouinette", 162: "Fouinar", 163: "Hoothoot",
  164: "Noarfang", 165: "Coxy", 166: "Coxyclaque", 167: "Mimigal", 168: "Migalos", 169: "Nostenfer",
  170: "Loupio", 171: "Lanturn", 172: "Pichu", 173: "Mélo", 174: "Toudoudou", 175: "Togepi",
  176: "Togetic", 177: "Natu", 178: "Xatu", 179: "Wattouat", 180: "Lainergie", 181: "Pharamp",
  182: "Joliflor", 183: "Marill", 184: "Azumarill", 185: "Simularbre", 186: "Tarpaud", 187: "Granivol",
  188: "Floravol", 189: "Cotovol", 190: "Capumain", 191: "Tournegrin", 192: "Héliatronc", 193: "Yanma",
  194: "Axoloto", 195: "Maraiste", 196: "Mentali", 197: "Noctali", 198: "Cornèbre", 199: "Roigada",
  200: "Feuforêve", 201: "Zarbi", 202: "Qulbutoké", 203: "Girafarig", 204: "Pomdepik", 205: "Foretress",
  206: "Insolourdo", 207: "Scorplane", 208: "Steelix", 209: "Snubbull", 210: "Granbull", 211: "Qwilfish",
  212: "Cizayox", 213: "Caratroc", 214: "Scarhino", 215: "Farfuret", 216: "Teddiursa", 217: "Ursaring",
  218: "Limagma", 219: "Volcaropod", 220: "Marcacrin", 221: "Cochignon", 222: "Corayon", 223: "Rémoraid",
  224: "Octillery", 225: "Cadoizo", 226: "Démanta", 227: "Airmure", 228: "Malosse", 229: "Démolosse",
  230: "Hyporoi", 231: "Phanpy", 232: "Donphan", 233: "Porygon2", 234: "Cerfrousse", 235: "Queulorior",
  236: "Debugant", 237: "Kapoera", 238: "Lippouti", 239: "Élekid", 240: "Magby", 241: "Écrémeuh",
  242: "Leuphorie", 243: "Raikou", 244: "Entei", 245: "Suicune", 246: "Embrylex", 247: "Ymphect",
  248: "Tyranocif", 249: "Lugia", 250: "Ho-Oh", 251: "Celebi",
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
