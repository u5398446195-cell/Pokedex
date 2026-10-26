import RegionDex from "../../components/RegionDex";

export const endId = 386;
export const HOENN_COUNT = 135;
export const HOENN_FRENCH_NAMES: Record<number, string> = {
  252: "Arcko", 253: "Massko", 254: "Jungko",
  255: "Poussifeu", 256: "Galifeu", 257: "Braségali",
  258: "Gobou", 259: "Flobio", 260: "Laggron",
  261: "Medhyèna", 262: "Grahyèna", 263: "Zigzaton", 264: "Linearctan",
  265: "Chenipotte", 266: "Armulys", 267: "Charmillon", 268: "Blindalys", 269: "Papinox",
  270: "Nénupiot", 271: "Lombre", 272: "Ludicolo",
  273: "Grainipiot", 274: "Pifeuil", 275: "Mongrain",
  276: "Nirondelle", 277: "Héledelle", 278: "Goélise", 279: "Bekipan",
  280: "Tarsal", 281: "Kirlia", 282: "Gardevoir",
  283: "Arakdo", 284: "Masquerad", 285: "Balignon", 286: "Chapignon",
  287: "Parecool", 288: "Vigoroth", 289: "Monaflèmit",
  290: "Nincada", 291: "Ninjask", 292: "Munja",
  293: "Chuchmur", 294: "Rabbitchu", 295: "Brouhabam",
  296: "Makuhita", 297: "Hariyama", 298: "Azurill",
  299: "Tarinor", 300: "Skitty", 301: "Delcatty",
  302: "Ténéfix", 303: "Mysdibule", 304: "Galekid", 305: "Galegon", 306: "Galeking",
  307: "Méditikka", 308: "Charmina", 309: "Dynavolt", 310: "Élecsprint",
  311: "Posipi", 312: "Négapi", 313: "Muciole", 314: "Lumivole",
  315: "Rosélia", 316: "Gloupti", 317: "Avaltout", 318: "Carvanha", 319: "Sharpedo",
  320: "Wailmer", 321: "Wailord", 322: "Chamallot", 323: "Camérupt",
  324: "Chartor", 325: "Spoink", 326: "Groret", 327: "Spinda",
  328: "Kraknoix", 329: "Vibraninf", 330: "Libégon",
  331: "Cacnea", 332: "Cacturne", 333: "Tylton", 334: "Altaria",
  335: "Mangriff", 336: "Séviper", 337: "Séléroc", 338: "Solaroc",
  339: "Barloche", 340: "Barbicha", 341: "Écrapince", 342: "Colhomard",
  343: "Balbuto", 344: "Kaorine", 345: "Lilia", 346: "Vacilys",
  347: "Anorith", 348: "Armaldo", 349: "Barpau", 350: "Milobellus",
  351: "Morphéo", 352: "Kecleon", 353: "Polichombr", 354: "Branette",
  355: "Skelénox", 356: "Téraclope", 357: "Tropius", 358: "Étargette",
  359: "Absol", 360: "Okéoké", 361: "Stalgamin", 362: "Oniglali",
  363: "Obalia", 364: "Phogleur", 365: "Kaimorse", 366: "Coquiperl", 367: "Serpang", 368: "Rosabyss",
  369: "Relicanth", 370: "Lovdisc", 371: "Draby", 372: "Drackhaus", 373: "Drattak",
  374: "Terhal", 375: "Métang", 376: "Métagross",
  377: "Regirock", 378: "Regice", 379: "Registeel",
  380: "Latias", 381: "Latios", 382: "Kyogre", 383: "Groudon", 384: "Rayquaza",
  385: "Jirachi", 386: "Deoxys"
};

export default function HoennDex() {
  return (
    <RegionDex
      endId={endId}
      title="Hoenn"
      startId={252}
      count={HOENN_COUNT}
      accent="#008080"
      desFcolor="#004D4D"
      statBarColor="bg-teal-500"
      frenchNames={HOENN_FRENCH_NAMES}
    />
  );
}