import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REGIONS } from "../../data/allRegions";
import RegionPage from "./RegionPage";

// Régions de Sinnoh à Paldea (Kanto, Johto et Hoenn ont leurs propres dossiers)
const DYNAMIC = REGIONS.filter((r) => r.startId > 386);

export function generateStaticParams() {
  return DYNAMIC.map((r) => ({ region: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const r = DYNAMIC.find((x) => x.slug === region);
  return { title: r ? `Pokédex de ${r.name}` : "Pokédex" };
}

export default async function Page({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  if (!DYNAMIC.some((r) => r.slug === region)) notFound();
  return <RegionPage slug={region} />;
}
