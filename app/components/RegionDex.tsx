"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  fetchPokemonDetails,
  fetchRegionList,
  type PokemonDetails,
  type PokemonSummary,
} from "../lib/pokeapi";

import { DexHeader } from "./DexHeader";
import { DexInfo } from "./DexInfo";
import { DexList } from "./DexList";
import { DexScreen } from "./DexScreen";
import { DexStats } from "./DexStats";
import { DexDetailsModal } from "./DexDetailsModal";
import SimulateBattle from "./SimulateBattle";
import { getSearchSuggestions, normalize } from "./DexSearch";
import EvolutionChain from "./Evolutionchain";
import Menu from "./Menu.jsx";

type RegionDexProps = {
  title: string;
  startId: number;
  endId: number;
  count: number;
  accent?: string;
  desFcolor: string;
  statBarColor?: string;
  frenchNames?: Record<number, string>;
};

type ModalInstance = {
  uid: number;
  id: number;
  snapshot: PokemonDetails;
  z: number;
};

export default function RegionDex({
  title,
  startId,
  endId,
  count,
  accent = "#f62d5f",
  desFcolor,
  statBarColor = "bg-[#ffdc74]",
  frenchNames = {},
}: RegionDexProps) {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([]);
  const [activePokemon, setActivePokemon] =
    useState<PokemonDetails | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [searchDirty, setSearchDirty] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  const [openModals, setOpenModals] = useState<ModalInstance[]>([]);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const cacheRef = useRef<Record<number, PokemonDetails>>({});
  const nextUid = useRef(1);
  const nextZ = useRef(100);

  const loadPokemon = useCallback(
    async (id: number) => {
      const lastId = startId + count - 1;

      if (id < startId || id > lastId) {
        return;
      }

      const cached = cacheRef.current[id];

      if (cached) {
        setActivePokemon(cached);
        setSearchValue(cached.englishName);
        setSearchDirty(false);
        return;
      }

      try {
        setLoadingDetails(true);
        setError("");

        const details = await fetchPokemonDetails(id, frenchNames);

        cacheRef.current[id] = details;
        setActivePokemon(details);
        setSearchValue(details.englishName);
        setSearchDirty(false);
      } catch (err) {
        console.error(err);
        setError("Unable to read this Pokémon's data.");
      } finally {
        setLoadingDetails(false);
      }
    },
    [count, frenchNames, startId],
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const list = await fetchRegionList({
          startId,
          limit: count,
          frenchNames,
        });

        if (cancelled) {
          return;
        }

        setPokemonList(list);
        await loadPokemon(startId);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(`Unable to load the ${title} index.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [count, frenchNames, loadPokemon, startId, title]);

  const suggestions = useMemo(() => {
    if (!searchDirty || !searchValue.trim()) {
      return [];
    }

    return getSearchSuggestions(searchValue, pokemonList);
  }, [pokemonList, searchDirty, searchValue]);

  const showSuggestions =
    searchDirty &&
    searchValue.trim().length > 0 &&
    suggestions.length > 0 &&
    !loadingDetails;

  function findBestMatch(rawValue: string): PokemonSummary | null {
    const value = rawValue.trim().replace(/^#/, "");

    if (!value) {
      return null;
    }

    const normalized = normalize(value);
    const numericId = Number(value);
    const lastId = startId + count - 1;

    if (
      Number.isInteger(numericId) &&
      numericId >= startId &&
      numericId <= lastId
    ) {
      return (
        pokemonList.find((pokemon) => pokemon.id === numericId) ?? null
      );
    }

    const exactMatch = pokemonList.find(
      (pokemon) =>
        normalize(pokemon.englishName) === normalized ||
        normalize(pokemon.frenchName) === normalized,
    );

    if (exactMatch) {
      return exactMatch;
    }

    const startsWithMatch = [...pokemonList]
      .filter(
        (pokemon) =>
          normalize(pokemon.englishName).startsWith(normalized) ||
          normalize(pokemon.frenchName).startsWith(normalized),
      )
      .sort((a, b) => a.id - b.id)[0];

    if (startsWithMatch) {
      return startsWithMatch;
    }

    const includesMatch = [...pokemonList]
      .filter(
        (pokemon) =>
          normalize(pokemon.englishName).includes(normalized) ||
          normalize(pokemon.frenchName).includes(normalized) ||
          String(pokemon.id).includes(normalized),
      )
      .sort((a, b) => a.id - b.id)[0];

    return includesMatch ?? null;
  }

  function runSearch() {
    const match = findBestMatch(searchValue);

    if (!match) {
      setError("No Pokémon found.");
      return;
    }

    setError("");
    void loadPokemon(match.id);
  }

  function selectSuggestion(pokemon: PokemonSummary) {
    setSearchValue(pokemon.englishName);
    setSearchDirty(false);
    setError("");
    void loadPokemon(pokemon.id);
  }

  function openModalForActive() {
    if (!activePokemon) {
      return;
    }

    const uid = nextUid.current++;
    const z = nextZ.current++;

    const snapshot = JSON.parse(
      JSON.stringify(activePokemon),
    ) as PokemonDetails;

    setOpenModals((current) => [
      ...current,
      {
        uid,
        id: activePokemon.id,
        snapshot,
        z,
      },
    ]);
  }

  function closeModal(uid: number) {
    setOpenModals((current) =>
      current.filter((modal) => modal.uid !== uid),
    );
  }

  function bringModalToFront(uid: number) {
    const z = nextZ.current++;

    setOpenModals((current) =>
      current.map((modal) =>
        modal.uid === uid ? { ...modal, z } : modal,
      ),
    );
  }

  return (
    <main
      className="
        relative flex h-[100dvh] min-h-0 flex-col
        overflow-hidden bg-[#2c0914]
      "
      style={
        {
          "--dex-header-height": "80px",
        } as React.CSSProperties
      }
    >
      {/* Fond du menu mobile */}
      <div
        className={[
          "fixed inset-0 z-[47] transition duration-500",
          openMenu
            ? "pointer-events-auto bg-black/40 backdrop-blur-sm"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
      />

      <Menu
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      {/* Conteneur général */}
      <div
        className="
          relative mx-auto flex min-h-0 w-full max-w-[1500px]
          flex-1 flex-col overflow-hidden border-x-[4px]
          border-[#7d0f1e] bg-[#c71938]
          shadow-[0_20px_60px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.18)]
        "
      >
        {/* Header fixe */}
        <div
          className="
            fixed inset-x-0 top-0 z-[60] mx-auto
            h-[var(--dex-header-height)] max-w-[1500px]
          "
        >
          <DexHeader
            setOpenMenu={setOpenMenu}
            activePokemon={activePokemon}
            searchValue={searchValue}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            allowSuggestions={false}
            searchRef={searchRef}
            onSearchChange={(value) => {
              setSearchValue(value);
              setSearchDirty(value.trim().length > 0);
              setError("");
            }}
            onSelectSuggestion={selectSuggestion}
            onSearch={runSearch}
          />
        </div>

        {/* Zone située sous le header fixe */}
        <div
          className="
            flex min-h-0 flex-1 flex-col
            pt-[var(--dex-header-height)]
          "
        >
          {/* Zone principale scrollable */}
          <div
            className="
              flex min-h-0 flex-1 flex-col
              overflow-y-auto md:flex-row md:overflow-hidden
            "
          >
            {/* Zone principale du Pokédex */}
            <section
              className="min-h-0 min-w-0 flex-1"
              style={{ backgroundColor: accent }}
            >
              <div
                className="
                  grid min-h-0 grid-cols-1
                  md:h-full
                  md:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]
                "
              >
                {/* Colonne du Pokédex */}
                <div className="relative z-10 flex min-h-0 min-w-0 flex-col">
                  {/* Boutons mobiles */}
                  <div
                    className="
                      sticky top-0 z-30 flex shrink-0 flex-row
                      gap-2 border-b-2 border-[#8b1020]
                      bg-[#c71938] px-2 pb-2 pt-3
                      lg:hidden
                    "
                  >
                    <button
                      type="button"
                      onClick={openModalForActive}
                      disabled={!activePokemon}
                      className="
                        min-h-11 min-w-0 flex-1 border-2
                        border-white/20 bg-[#b0173e] px-2 py-2
                        font-mono text-xs font-black uppercase text-white
                        hover:border-transparent hover:bg-[#ff698f]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      Battle info
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSimModal(true)}
                      disabled={!activePokemon}
                      className="
                        min-h-11 min-w-0 flex-1 border-2
                        border-white/20 bg-[#b0173e] px-2 py-2
                        font-mono text-xs font-black uppercase text-white
                        hover:border-transparent hover:bg-[#ff698f]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      Simulate
                    </button>
                  </div>

                  {/* Écran et contenu */}
                  <div className="flex min-h-0 min-w-0 flex-col md:flex-1">
                    {/* Écran avec une taille équilibrée sur mobile (h-[220px] / sm:h-[260px]) pour laisser de la place à la description */}
                    <div
                      className="
                        relative z-0 isolate h-[220px] shrink-0
                        overflow-hidden px-1.5 pb-1.5 pt-1
                        sm:h-[260px] sm:px-2 sm:pb-2
                        md:h-auto md:min-h-0 md:flex-1
                      "
                    >
                      <DexScreen
                        activePokemon={activePokemon}
                        loading={loading || loadingDetails}
                        error={error}
                      />
                    </div>

                    {/* Description (visible et bien calée) */}
                    {activePokemon && (
                      <div className="relative z-10 shrink-0 p-2">
                        <p
                          style={{ backgroundColor: desFcolor }}
                          className="
                            max-h-24 overflow-y-auto whitespace-pre-wrap
                            break-words rounded-md p-2 text-center
                            font-bold text-white lg:text-xl
                          "
                        >
                          {activePokemon.description}
                        </p>
                      </div> 
                    )}

                    {/* Chaîne d'évolution */}
                    <div className="relative z-10 hidden shrink-0 md:block">
                      {activePokemon && (
                        <div className="p-2">
                          <EvolutionChain
                            startId={startId}
                            endId={endId}
                            currentId={activePokemon.id}
                            speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${activePokemon.id}/`}
                            onSelect={(pokemon) =>
                              void loadPokemon(pokemon.id)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne des statistiques */}
                <div
                  className="
                    relative z-10 flex min-h-0 min-w-0 flex-col
                    gap-0 border-t-[4px] border-[#8b1020]
                    bg-[#d92f4d] p-1.5
                    sm:p-2
                    md:border-l-[4px] md:border-t-0 md:p-2
                  "
                >
                  {/* Informations générales */}
                  <div className="shrink-0">
                    <DexInfo activePokemon={activePokemon} />
                  </div>

                  {/* Statistiques */}
                  <div className="mt-1 min-h-0 shrink-0">
                    <div
                      className="
                        max-h-[38vh] overflow-y-auto pr-1
                        md:max-h-[32vh]
                        lg:max-h-[34vh]
                      "
                    >
                      <DexStats
                        activePokemon={activePokemon}
                        statBarColor={statBarColor}
                      />
                    </div>
                  </div>

                  {/* Boutons desktop */}
                  <div
                    className="
                      mt-2 hidden shrink-0
                      flex-row items-stretch gap-2
                      lg:flex
                    "
                  >
                    <button
                      type="button"
                      onClick={openModalForActive}
                      disabled={!activePokemon}
                      className="
                        flex-1 border-2 border-white/20
                        bg-[#b0173e] px-2.5 py-2
                        font-mono text-[10px] font-black
                        uppercase text-white
                        hover:border-transparent hover:bg-[#ff698f]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      Battle info
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSimModal(true)}
                      disabled={!activePokemon}
                      className="
                        flex-1 border-2 border-white/20
                        bg-[#b0173e] px-2.5 py-2
                        font-mono text-[10px] font-black
                        uppercase text-white
                        hover:border-transparent hover:bg-[#ff698f]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    >
                      Simulate
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Liste des Pokémon */}
            <DexList
              pokemonList={pokemonList}
              activePokemon={activePokemon}
              onSelect={(pokemon) => void loadPokemon(pokemon.id)}
              showMobileList={showMobileList}
              setShowMobileList={setShowMobileList}
            />
          </div>
        </div>

        {/* Modales de détails */}
        {openModals.map((modal) => (
          <DexDetailsModal
            key={`modal-${modal.uid}`}
            startId={startId}
            endId={endId}
            loadPokemon={loadPokemon}
            activePokemon={modal.snapshot}
            onClose={() => closeModal(modal.uid)}
            zIndex={modal.z}
            onFocus={() => bringModalToFront(modal.uid)}
          />
        ))}

        {/* Modal de simulation */}
        {showSimModal && (
          <SimulateBattle
            own={activePokemon}
            pokemonList={pokemonList}
            onClose={() => setShowSimModal(false)}
          />
        )}
      </div>
    </main>
  );
}