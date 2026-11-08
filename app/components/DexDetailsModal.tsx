"use client";
import { useEffect, useState, useRef } from "react";
import type {
  PokemonDetails,
  PokemonMove,
  PokemonAbilityDetails,
  PokemonMoveDetails,
} from "../lib/pokeapi";
import type { PokemonFormDetails, PokemonSpeciesExtras } from "../lib/pokeapi";
import {
  fetchAbilityDetails,
  fetchCosmeticSprite,
  fetchFormDetails,
  fetchMoveDetails,
  fetchSpeciesExtras,
} from "../lib/pokeapi";
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

// Nom lisible d'une forme : "charizard-mega-x" → "MÉGA X", forme par défaut → "NORMALE"
function formLabel(name: string, baseName: string) {
  if (name === baseName) return "NORMALE";
  const rest = name.startsWith(`${baseName}-`) ? name.slice(baseName.length + 1) : name;
  return rest
    .split("-")
    .map((w) => (w === "mega" ? "MÉGA" : w === "alola" ? "ALOLA" : w === "galar" ? "GALAR" : w === "hisui" ? "HISUI" : w === "paldea" ? "PALDEA" : w.toUpperCase()))
    .join(" ");
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

  // Position de la fenêtre (ordinateur). Sur téléphone, le CSS l'affiche en plein écran.
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const w = Math.min(980, window.innerWidth - 48);
    const h = Math.min(760, window.innerHeight - 48);
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

  // ── Formes, sexe, chromatique ──
  const [extras, setExtras] = useState<PokemonSpeciesExtras | null>(null);
  const [variety, setVariety] = useState<string | null>(null);
  const [form, setForm] = useState<PokemonFormDetails | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [cosmetic, setCosmetic] = useState<string | null>(null);
  const [cosmeticSprites, setCosmeticSprites] = useState<{ sprite: string; spriteShiny: string } | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [shiny, setShiny] = useState(false);

  const pokemonId = activePokemon?.id;

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, [pokemonId]);

  // Infos de l'espèce : taux de sexe, différences mâle/femelle, liste des formes
  useEffect(() => {
    if (!pokemonId) return;
    let cancelled = false;
    setExtras(null);
    setVariety(null);
    setForm(null);
    setCosmetic(null);
    setShiny(false);
    fetchSpeciesExtras(pokemonId)
      .then((x) => {
        if (cancelled) return;
        setExtras(x);
        setVariety(x.varieties.find((v) => v.isDefault)?.name ?? x.varieties[0]?.name ?? null);
        setGender(x.genderRate === 8 ? "female" : "male");
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [pokemonId]);

  // Détails de la forme choisie (types, stats, talents et images changent)
  useEffect(() => {
    if (!variety) return;
    let cancelled = false;
    setFormLoading(true);
    fetchFormDetails(variety)
      .then((f) => !cancelled && setForm(f))
      .catch(console.error)
      .finally(() => !cancelled && setFormLoading(false));
    return () => {
      cancelled = true;
    };
  }, [variety]);

  // Forme seulement visuelle (ex. Zarbi B) : on récupère juste son sprite
  useEffect(() => {
    if (!cosmetic) {
      setCosmeticSprites(null);
      return;
    }
    let cancelled = false;
    fetchCosmeticSprite(cosmetic)
      .then((sp) => !cancelled && setCosmeticSprites(sp))
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [cosmetic]);

  // Déplacement de la fenêtre à la souris (ordinateur seulement)
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffsetRef.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffsetRef.current.y)),
      });
    }
    function onPointerUp() {
      draggingRef.current = false;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!activePokemon) return null;

  // Ce qu'on affiche : la forme choisie si elle est chargée, sinon la fiche de base
  const types = form?.types ?? activePokemon.types;
  const stats = form?.stats ?? activePokemon.stats;
  const abilities = form?.abilities ?? activePokemon.abilities;
  const height = form?.height ?? activePokemon.height;
  const weight = form?.weight ?? activePokemon.weight;

  const primaryType = (types[0] ?? "normal").toLowerCase();
  const typeColor = TYPE_COLORS[primaryType] || "#A8A878";
  const typeGradient = TYPE_GRADIENTS[primaryType] || TYPE_GRADIENTS.normal;

  const baseName = extras?.varieties.find((v) => v.isDefault)?.name ?? activePokemon.englishName;
  const isDefaultForm = !variety || variety === baseName;

  // Sexe
  const genderRate = extras?.genderRate ?? -1;
  const genderless = genderRate === -1;
  const femalePct = genderless ? 0 : (genderRate / 8) * 100;
  const canBeMale = !genderless && genderRate < 8;
  const canBeFemale = !genderless && genderRate > 0;
  const showFemaleSprite = gender === "female" && Boolean(extras?.hasGenderDifferences) && Boolean(form?.spriteFemale);

  // Image : forme visuelle > sprite femelle (seul cas où l'apparence change) > illustration officielle
  let image = activePokemon.artwork;
  let pixel = false;
  if (cosmetic && cosmeticSprites?.sprite) {
    image = shiny ? cosmeticSprites.spriteShiny || cosmeticSprites.sprite : cosmeticSprites.sprite;
    pixel = true;
  } else if (showFemaleSprite && form) {
    image = shiny ? form.spriteShinyFemale || form.spriteFemale : form.spriteFemale;
    pixel = true;
  } else if (form) {
    image = (shiny ? form.artworkShiny : form.artwork) || activePokemon.artwork;
  }

  const advantages = getAdvantages(primaryType);
  const weaknesses = getWeaknesses(primaryType);
  const total = stats.reduce((sum, st) => sum + st.value, 0);

  const TAB_LABELS = { info: "INFOS", abilities: "TALENTS", moves: "ATTAQUES" } as const;

  return (
    <>
      <div
        className="gbm-backdrop"
        style={{ zIndex: zIndex - 1, opacity: mounted ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-label={`Fiche de ${formatName(activePokemon.englishName)}`}
        className="gb-window gbm"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex,
          ["--type" as string]: typeColor,
          opacity: mounted ? 1 : 0,
        }}
        onPointerDown={() => onFocus?.()}
      >
        {/* Barre de titre (on peut la glisser sur ordinateur) */}
        <div
          onPointerDown={(e) => {
            const el = e.target as Element | null;
            if (el?.closest("button")) return;
            if (!window.matchMedia("(min-width: 641px)").matches) return;
            draggingRef.current = true;
            const rect = modalRef.current?.getBoundingClientRect();
            dragOffsetRef.current = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
          }}
          className={`gbm-head bg-gradient-to-br ${typeGradient}`}
        >
          <div className="gbm-head-id">
            <span className="gbm-no">N° {String(activePokemon.id).padStart(3, "0")}</span>
            <h2 className="gbm-name">{activePokemon.frenchName || formatName(activePokemon.englishName)}</h2>
            <span className="gbm-genus">
              {formatName(activePokemon.englishName)}
              {activePokemon.genus ? ` · ${activePokemon.genus}` : ""}
            </span>
          </div>
          <button type="button" onClick={onClose} className="gbm-close" aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Onglets */}
        <div className="gbm-tabs" role="tablist">
          {(["info", "abilities", "moves"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`gbm-tab ${tab === t ? "is-on" : ""}`}
            >
              {tab === t && <span aria-hidden="true">▶ </span>}
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="gbm-body">
          {tab === "info" && (
            <div className="gbm-info">
              {/* ── Colonne gauche : vitrine + formes + sexe ── */}
              <div className="gbm-col">
                <div className="gbm-card gbm-show">
                  <div className="gbm-stage">
                    {image && (
                      <Image
                        key={image}
                        src={image}
                        alt={formatName(activePokemon.englishName)}
                        width={300}
                        height={300}
                        unoptimized={pixel}
                        className={`gbm-art ${pixel ? "is-pixel" : ""}`}
                      />
                    )}
                    {formLoading && <span className="gbm-loading">...</span>}
                    {shiny && <span className="gbm-sparkle" aria-hidden="true">✦</span>}
                  </div>

                  <div className="gbm-toggles">
                    <button
                      type="button"
                      className={`gbm-chip ${shiny ? "is-on" : ""}`}
                      aria-pressed={shiny}
                      onClick={() => setShiny((v) => !v)}
                    >
                      ✦ CHROMATIQUE
                    </button>
                  </div>
                </div>

                {/* Formes */}
                {extras && (extras.varieties.length > 1 || extras.cosmeticForms.length > 0) && (
                  <div className="gbm-card">
                    <p className="gbm-label">FORMES</p>
                    <div className="gbm-chips">
                      {extras.varieties.map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          className={`gbm-chip ${variety === v.name && !cosmetic ? "is-on" : ""}`}
                          aria-pressed={variety === v.name && !cosmetic}
                          onClick={() => {
                            setCosmetic(null);
                            setVariety(v.name);
                          }}
                        >
                          {formLabel(v.name, baseName)}
                        </button>
                      ))}
                      {extras.cosmeticForms.slice(1).map((f) => (
                        <button
                          key={f.name}
                          type="button"
                          className={`gbm-chip ${cosmetic === f.name ? "is-on" : ""}`}
                          aria-pressed={cosmetic === f.name}
                          onClick={() => setCosmetic(cosmetic === f.name ? null : f.name)}
                        >
                          {f.formName.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {!isDefaultForm && <p className="gbm-note">Types, stats et talents de cette forme.</p>}
                  </div>
                )}

                {/* Sexe */}
                {extras && (
                  <div className="gbm-card">
                    <p className="gbm-label">SEXE</p>
                    {genderless ? (
                      <p className="gbm-text">Asexué — ni mâle ni femelle.</p>
                    ) : (
                      <>
                        <div className="gbm-chips">
                          {canBeMale && (
                            <button
                              type="button"
                              className={`gbm-chip gbm-male ${gender === "male" ? "is-on" : ""}`}
                              aria-pressed={gender === "male"}
                              onClick={() => setGender("male")}
                            >
                              ♂ MÂLE
                            </button>
                          )}
                          {canBeFemale && (
                            <button
                              type="button"
                              className={`gbm-chip gbm-female ${gender === "female" ? "is-on" : ""}`}
                              aria-pressed={gender === "female"}
                              onClick={() => setGender("female")}
                            >
                              ♀ FEMELLE
                            </button>
                          )}
                        </div>
                        <div className="gbm-ratio" aria-label={`${100 - femalePct} % mâles, ${femalePct} % femelles`}>
                          <span className="gbm-ratio-m" style={{ width: `${100 - femalePct}%` }} />
                          <span className="gbm-ratio-f" style={{ width: `${femalePct}%` }} />
                        </div>
                        <p className="gbm-text">
                          ♂ {Math.round((100 - femalePct) * 10) / 10} % · ♀ {Math.round(femalePct * 10) / 10} %
                          {extras.hasGenderDifferences ? " — le mâle et la femelle sont différents." : " — même apparence."}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Types */}
                <div className="gbm-card">
                  <p className="gbm-label">TYPE</p>
                  <div className="gbm-chips">
                    {types.map((t) => (
                      <span key={t} className="gbm-type" style={{ backgroundColor: TYPE_COLORS[t] || "#A8A878" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {advantages.length > 0 && (
                    <>
                      <p className="gbm-label gbm-good">▲ EFFICACE CONTRE</p>
                      <div className="gbm-chips">
                        {advantages.map((t) => (
                          <span key={t} className="gbm-type is-small" style={{ backgroundColor: TYPE_COLORS[t] || "#A8A878" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {weaknesses.length > 0 && (
                    <>
                      <p className="gbm-label gbm-bad">▼ FAIBLE CONTRE</p>
                      <div className="gbm-chips">
                        {weaknesses.map((t) => (
                          <span key={t} className="gbm-type is-small" style={{ backgroundColor: TYPE_COLORS[t] || "#A8A878" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Colonne droite : stats, taille, description, évolutions ── */}
              <div className="gbm-col">
                <div className="gbm-card">
                  <p className="gbm-label">
                    STATS DE BASE <span className="gbm-total">TOTAL {total}</span>
                  </p>
                  <div className="gbm-stats">
                    {stats.map((stat) => (
                      <div key={stat.name} className="gbm-stat">
                        <span className="gbm-stat-name">{stat.name}</span>
                        <span className="gbm-stat-track">
                          <span
                            className="gbm-stat-fill"
                            style={{ width: `${Math.min((stat.value / 180) * 100, 100)}%`, backgroundColor: getStatColor(stat.value) }}
                          />
                        </span>
                        <span className="gbm-stat-val">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="gbm-duo">
                  <div className="gbm-card">
                    <p className="gbm-label">TAILLE</p>
                    <p className="gbm-big">{(height / 10).toLocaleString("fr-FR")} m</p>
                  </div>
                  <div className="gbm-card">
                    <p className="gbm-label">POIDS</p>
                    <p className="gbm-big">{(weight / 10).toLocaleString("fr-FR")} kg</p>
                  </div>
                </div>

                {activePokemon.description && (
                  <div className="gbm-card">
                    <p className="gbm-label">POKÉDEX</p>
                    <p className="gbm-text">{activePokemon.description}</p>
                  </div>
                )}

                <div className="gbm-card">
                  <p className="gbm-label">ÉVOLUTIONS</p>
                  <EvolutionChain2
                    startId={startId}
                    endId={endId}
                    onSelect={(pokemon) => void loadPokemon(pokemon.id)}
                    speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${activePokemon.id}/`}
                    currentId={activePokemon.id}
                    onClose={onClose}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "abilities" && (
            <div className="gbm-list">
              {!isDefaultForm && <p className="gbm-note">Talents de la forme {formLabel(variety ?? "", baseName)}.</p>}
              {abilities.length > 0 ? (
                abilities.map((ability) => (
                  <button
                    key={ability.name}
                    type="button"
                    className="gbm-row"
                    onClick={() => setSelectedAbility(ability.name)}
                  >
                    <span className="gbm-row-name">{formatName(ability.name)}</span>
                    {ability.isHidden && <span className="gbm-hidden">CACHÉ</span>}
                    <span className="gbm-row-arrow" aria-hidden="true">▶</span>
                  </button>
                ))
              ) : (
                <p className="gbm-text">Aucun talent.</p>
              )}
            </div>
          )}

          {tab === "moves" && (
            <div className="gbm-list">
              {!isDefaultForm && <p className="gbm-note">Attaques de la forme normale.</p>}
              {activePokemon.moves.length > 0 ? (
                activePokemon.moves.map((move, idx) => (
                  <button key={`${move.name}-${idx}`} type="button" className="gbm-row" onClick={() => setSelectedMove(move)}>
                    <span className="gbm-row-name">{formatName(move.name)}</span>
                    <span className="gbm-row-lv">{move.level > 0 ? `N.${move.level}` : "CT"}</span>
                    <span className="gbm-row-arrow" aria-hidden="true">▶</span>
                  </button>
                ))
              ) : (
                <p className="gbm-text">Aucune attaque trouvée.</p>
              )}
            </div>
          )}
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
    // grande fenêtre (presque toute la hauteur) pour lire la description en entier
    const w = Math.min(760, window.innerWidth - 48);
    return {
      x: Math.max(24, Math.round((window.innerWidth - w) / 2)),
      y: 24,
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

  const generation = details?.generation?.replace("generation-", "").toUpperCase();

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-label={`Talent ${formatName(abilityName)}`}
      className="gb-window gbm gbm-talent"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex,
        ["--type" as string]: typeColor,
        opacity: mounted ? 1 : 0,
      }}
      onPointerDown={() => onFocus?.()}
    >
      <div
        onPointerDown={(e) => {
          const el = e.target as Element | null;
          if (el?.closest("button")) return;
          if (!window.matchMedia("(min-width: 641px)").matches) return;
          draggingRef.current = true;
          const rect = modalRef.current?.getBoundingClientRect();
          dragOffsetRef.current = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
        }}
        className={`gbm-head bg-gradient-to-br ${typeGradient}`}
      >
        <div className="gbm-head-id">
          <span className="gbm-no">TALENT</span>
          <h2 className="gbm-name">{details?.frenchName || formatName(abilityName)}</h2>
          {details?.frenchName && <span className="gbm-genus">{formatName(abilityName)}</span>}
        </div>
        <button type="button" onClick={onClose} className="gbm-close" aria-label="Fermer">
          ✕
        </button>
      </div>

      {/* Tout le texte est visible : la fenêtre prend la hauteur de l'écran et défile si besoin */}
      <div className="gbm-body gbm-talent-body">
        {loading ? (
          <p className="gbm-loading-big">CHARGEMENT...</p>
        ) : (
          <>
            {details?.frenchText && (
              <div className="gbm-dialog">
                <p>{details.frenchText}</p>
                <span className="gbm-dialog-next" aria-hidden="true">▼</span>
              </div>
            )}

            {/* cette carte s'étire pour occuper toute la hauteur restante de l'écran */}
            <div className="gbm-card gbm-talent-main">
              <p className="gbm-label">EFFET EN COMBAT</p>
              <p className="gbm-talent-text">{details?.effect ?? "Pas de description."}</p>
            </div>

            {details?.shortEffect && details.shortEffect !== details.effect && (
              <div className="gbm-card">
                <p className="gbm-label">EN BREF</p>
                <p className="gbm-text">{details.shortEffect}</p>
              </div>
            )}

            <div className="gbm-duo">
              {generation && (
                <div className="gbm-card">
                  <p className="gbm-label">APPARU EN</p>
                  <p className="gbm-big">GÉN. {generation}</p>
                </div>
              )}
              {details?.pokemonCount ? (
                <div className="gbm-card">
                  <p className="gbm-label">POKÉMON</p>
                  <p className="gbm-big">{details.pokemonCount}</p>
                </div>
              ) : null}
            </div>
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
      className="gb-window pointer-events-auto fixed flex max-h-[calc(100dvh-24px)] w-[min(660px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border-4 border-[#1a1a1a] bg-gradient-to-b from-[#f0f0ff] to-[#d8d8f0] shadow-2xl transition-all duration-300 ease-out"
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