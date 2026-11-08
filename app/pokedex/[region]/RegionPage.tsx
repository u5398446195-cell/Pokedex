"use client";

import RegionDex from "../../components/RegionDex";
import { REGIONS } from "../../data/allRegions";
import { FRENCH_NAMES } from "../../data/frenchNames";

export default function RegionPage({ slug }: { slug: string }) {
  const r = REGIONS.find((x) => x.slug === slug)!;
  return (
    <RegionDex
      title={r.name}
      startId={r.startId}
      endId={r.endId}
      count={r.endId - r.startId + 1}
      accent={r.accent}
      desFcolor={r.desFcolor}
      statBarColor={r.statBarColor}
      frenchNames={FRENCH_NAMES}
    />
  );
}
