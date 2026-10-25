
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
  statBarColor?: string;
  frenchNames?: Record<number, string>;
};

export default function RegionDex({
  title,
  startId,
  endId,
  count,
  accent = "#f62d5f",
  statBarColor = "bg-[#ffdc74]",
  frenchNames = {},
}: RegionDexProps) {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([]);
  const [activePokemon, setActivePokemon] = useState<PokemonDetails | null>(null);
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
  const [showStatsModal, setShowStatsModal] = useState(false);
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

    setOpenModals((s) => [
      ...s,
      { uid, id: activePokemon.id, data: snapshot, z },
    ]);
  }

  function closeModal(uid: number) {
    setOpenModals((s) => s.filter((m) => m.uid !== uid));
  }

  function bringModalToFront(uid: number) {
    const z = nextZ.current++;

    setOpenModals((s) =>
      s.map((m) => (m.uid === uid ? { ...m, z } : m)),
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden relative bg-[#2c0914] overflow-y-auto">
      <div
        className={[
          "absolute w-screen left-1 right-1 top-1 bottom-1 z-47 duration-500",
          openMenu ? "bg-black/40 backdrop-blur-xs" : "hidden",
        ].join(" ")}
      />

      <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} />

      <div className="relative mx-auto flex h-[100dvh] max-w-[1500px] flex-col border-[4px] border-[#7d0f1e] bg-[#c71938] shadow-[0_20px_60px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.18)]">
        <div className={showSuggestions ? "relative z-50" : "relative z-40"}>
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

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <section
            className="min-h-0 flex-1 bg-[#c71938]"
            style={{ backgroundColor: accent }}
          >
            <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]">
              <div className="flex min-h-0 min-w-0 flex-col">
                <div className="flex shrink-0 flex-row gap-2 px-2 pt-2 lg:hidden">
                  <button
                    onClick={openModalForActive}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2 py-2 font-mono text-xs font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f]"
                  >
                    Battle info
                  </button>

                  <button
                    onClick={() => setShowSimModal(true)}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2 py-2 font-mono text-xs font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f]"
                  >
                    Simulate
                  </button>
                </div>

                <div className="relative min-h-0 flex-1 px-1.5 pb-1.5 pt-1 sm:px-2 sm:pb-2">
                  <DexScreen
                    activePokemon={activePokemon}
                    loading={loading || loadingDetails}
                    error={error}
                  />
                </div>

                <div>
                  {activePokemon && (
                    <div className="px-2 pb-2 p-2">
                      <p className="text-center font-bold md:text-xl bg-[#770a25] text-white p-1 rounded-md">
                        {activePokemon.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="hidden shrink-0 md:block">
                  {activePokemon && (
                    <div className="px-2 pb-2 p-2">
                      <EvolutionChain
                        endId={endId}
                        onSelect={(pokemon) => void loadPokemon(pokemon.id)}
                        speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${activePokemon.id}/`}
                        currentId={activePokemon.id}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col gap-0 border-t-[4px] border-[#8b1020] bg-[#d92f4d] p-1.5 sm:p-2 md:border-l-[4px] md:border-t-0 md:p-2">
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
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2.5 py-2 font-mono text-[10px] font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f]"
                  >
                    Battle info
                  </button>

                  <button
                    onClick={() => setShowSimModal(true)}
                    className="flex-1 border-2 border-white/20 bg-[#b0173e] px-2.5 py-2 font-mono text-[10px] font-black uppercase text-white hover:border-transparent hover:bg-[#ff698f]"
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

      {openModals.map((m) => (
        <DexDetailsModal
          loadPokemon={loadPokemon}
          key={`modal-${m.uid}`}
          activePokemon={m.data}
          onClose={() => closeModal(m.uid)}
          zIndex={m.z}
          onFocus={() => bringModalToFront(m.uid)}
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
