"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  type ModalInstance = {
    uid: number;
    id: number;
    data: PokemonDetails;
    z: number;
  };

  const [openModals, setOpenModals] = useState<ModalInstance[]>([]);
  const nextUid = useRef(1);
  const nextZ = useRef(100);

  const [showSimModal, setShowSimModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const cacheRef = useRef<Record<number, PokemonDetails>>({});

  const loadPokemon = useCallback(
    async (id: number) => {
      if (id < startId || id > startId + count - 1) return;

      const cached = cacheRef.current[id];

      if (cached) {
        setActivePokemon(cached);
        setSearchValue(cached.englishName);
        setSearchDirty(false);
        setError("");
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

        if (cancelled) return;

        setPokemonList(list);
        await loadPokemon(startId);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(`Unable to load the ${title} index.`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [count, frenchNames, loadPokemon, startId, title]);

  const suggestions = useMemo(() => {
    if (!searchDirty || !searchValue.trim()) return [];

    return getSearchSuggestions(searchValue, pokemonList);
  }, [searchDirty, searchValue, pokemonList]);

  function findBestMatch(rawValue: string): PokemonSummary | null {
    const value = rawValue.trim().replace(/^#/, "");
    if (!value) return null;

    const normalized = normalize(value);
    const numericId = Number(value);

    if (
      Number.isInteger(numericId) &&
      numericId >= startId &&
      numericId <= startId + count - 1
    ) {
      return pokemonList.find((pokemon) => pokemon.id === numericId) ?? null;
    }

    const exactMatch = pokemonList.find(
      (pokemon) =>
        normalize(pokemon.englishName) === normalized ||
        normalize(pokemon.frenchName) === normalized,
    );

    if (exactMatch) return exactMatch;

    const startsWithMatch = [...pokemonList]
      .filter(
        (pokemon) =>
          normalize(pokemon.englishName).startsWith(normalized) ||
          normalize(pokemon.frenchName).startsWith(normalized),
      )
      .sort((a, b) => a.id - b.id)[0];

    if (startsWithMatch) return startsWithMatch;

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

    if (match) {
      setError("");
      void loadPokemon(match.id);
      return;
    }

    setError("No Pokémon found.");
  }

  function selectSuggestion(pokemon: PokemonSummary) {
    setSearchValue(pokemon.englishName);
    setSearchDirty(false);
    setError("");
    void loadPokemon(pokemon.id);
  }

  const showSuggestions =
    searchDirty &&
    searchValue.trim().length > 0 &&
    suggestions.length > 0 &&
    !loadingDetails;

  function openModalForActive() {
    if (!activePokemon) return;

    const uid = nextUid.current++;
    const z = nextZ.current++;
    const snapshot = JSON.parse(JSON.stringify(activePokemon));

    setOpenModals((current) => [
      ...current,
      { uid, id: activePokemon.id, data: snapshot, z },
    ]);
  }

  function closeModal(uid: number) {
    setOpenModals((current) => current.filter((modal) => modal.uid !== uid));
  }

  function bringModalToFront(uid: number) {
    const z = nextZ.current++;

    setOpenModals((current) =>
      current.map((modal) => (modal.uid === uid ? { ...modal, z } : modal)),
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#2c0914] md:h-[100dvh] md:overflow-hidden">
      <div
        className={[
          "absolute inset-1 z-[47] duration-500",
          openMenu ? "bg-black/40 backdrop-blur-xs" : "hidden",
        ].join(" ")}
      />

      <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1500px] flex-col border-[4px] border-[#7d0f1e] bg-[#c71938] shadow-[0_20px_60px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.18)] md:h-full md:min-h-0">
        <div className={showSuggestions ? "relative z-50 shrink-0" : "relative z-40 shrink-0"}>
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

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <section
            className="min-h-0 min-w-0 flex-1"
            style={{ backgroundColor: accent }}
          >
            <div className="grid min-h-0 grid-cols-1 md:h-full md:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]">
              {/* Colonne de gauche */}
              <div className="flex min-h-[55dvh] min-w-0 flex-col md:min-h-0">
                {/* Boutons mobiles */}
                <div className="flex shrink-0 flex-row gap-2 px-2 pt-2 lg:hidden">
                  <button
                    onClick={openModalForActive}
                    disabled={!activePokemon}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2 py-2 font-mono text-xs font-black uppercase text-white hover:bg-[#ff698f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Battle info
                  </button>

                  <button
                    onClick={() => setShowSimModal(true)}
                    disabled={!activePokemon}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2 py-2 font-mono text-xs font-black uppercase text-white hover:bg-[#ff698f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Simulate
                  </button>
                </div>

               <div className="flex min-h-0 flex-1 flex-col">
  {/* Écran Pokémon */}
 <div className="relative h-[clamp(220px,30vh,400px)] shrink-0 px-1.5 pb-1.5 pt-1 sm:h-[clamp(240px,34vh,430px)] sm:px-2 sm:pb-2 md:h-auto md:min-h-0 md:flex-1">
  <DexScreen
    activePokemon={activePokemon}
    loading={loading || loadingDetails}
    error={error}
  />
</div>

  {/* Description juste sous l'écran */}
  {activePokemon && (
    <div className="shrink-0 px-2 pb-2">
      <div className="relative">
        <p
          className="max-h-24 overflow-y-auto whitespace-pre-wrap break-words rounded-md p-2 text-center text-lg font-bold leading-relaxed text-white [scrollbar-width:thin] sm:text-base"
          style={{ backgroundColor: desFcolor }}
        >
          {activePokemon.description}
        </p>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-md bg-gradient-to-t from-black/40 to-transparent"
        />
      </div>
    </div>
  )}

  {/* Évolutions sur ordinateur */}
  <div className="hidden shrink-0 px-2 pb-2 md:block">
    {activePokemon && (
      <EvolutionChain
        startId={startId}
        endId={endId}
        onSelect={(pokemon) => void loadPokemon(pokemon.id)}
        speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${activePokemon.id}/`}
        currentId={activePokemon.id}
      />
    )}
  </div>
</div>
              </div>

              {/* Colonne de droite */}
              <div className="flex min-h-0 min-w-0 flex-col gap-0 border-t-[4px] border-[#8b1020] bg-[#d92f4d] p-1.5 sm:p-2 md:border-l-[4px] md:border-t-0 md:p-2">
                <div className="shrink-0">
                  <DexInfo activePokemon={activePokemon} />
                </div>

                <div className="mt-1 min-h-0 shrink-0">
                  <div className="max-h-[38vh] overflow-y-auto pr-1 md:max-h-[32vh] lg:max-h-[34vh]">
                    <DexStats
                      activePokemon={activePokemon}
                      statBarColor={statBarColor}
                    />
                  </div>
                </div>

                <div className="mt-2 hidden shrink-0 flex-row items-stretch gap-2 lg:flex">
                  <button
                    onClick={openModalForActive}
                    disabled={!activePokemon}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2.5 py-2 font-mono text-[10px] font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Battle info
                  </button>

                  <button
                    onClick={() => setShowSimModal(true)}
                    disabled={!activePokemon}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2.5 py-2 font-mono text-[10px] font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>
          </section>

          <DexList
            pokemonList={pokemonList}
            activePokemon={activePokemon}
            onSelect={(pokemon) => void loadPokemon(pokemon.id)}
            showMobileList={showMobileList}
            setShowMobileList={setShowMobileList}
          />
        </div>
      </div>

      {openModals.map((modal) => (
        <DexDetailsModal
          startId={startId}
          endId={endId}
          loadPokemon={loadPokemon}
          key={`modal-${modal.uid}`}
          activePokemon={modal.data}
          onClose={() => closeModal(modal.uid)}
          zIndex={modal.z}
          onFocus={() => bringModalToFront(modal.uid)}
        />
      ))}

      {showSimModal && (
        <SimulateBattle
          own={activePokemon}
          pokemonList={pokemonList}
          onClose={() => setShowSimModal(false)}
        />
      )}
    </main>
  );
}