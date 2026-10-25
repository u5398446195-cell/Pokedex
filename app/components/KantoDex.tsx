"use client";

import { KANTO_COUNT, KANTO_FRENCH_NAMES } from "../data/kanto";
import RegionDex from "./RegionDex";

export const endId= 151;
export const startId=1;

export default function KantoDex() {
  return (
    <RegionDex
      endId={endId}
      title="Kanto"
      startId={startId}
      count={KANTO_COUNT}
      accent="#d51e3c"
      statBarColor="bg-[#ffdc74]"
      frenchNames={KANTO_FRENCH_NAMES}
    />
  );
}
