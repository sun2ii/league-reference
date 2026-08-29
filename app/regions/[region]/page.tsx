"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface RegionInfo {
  name: string;
  description: string;
  champions: string[];
}

interface RegionsData {
  regions: Record<string, RegionInfo>;
}

interface RegionLore {
  fullDescription: string;
  geography: string;
  culture: string;
  history: string;
  factions: { name: string; description: string; champions: string[] }[];
  relationships: { champion1: string; champion2?: string; type: string; description: string }[];
  crossRegionRelationships: { champion: string; otherChampion?: string; otherRegion?: string; type: string; description: string }[];
}

interface RegionLoreData {
  regions: Record<string, RegionLore>;
}

interface ChampionBasic {
  id: string;
  name: string;
  title: string;
  image: string;
}

// Map coordinates for each region (percentage positions measured from labeled map image)
// Coordinates represent center of each region emblem
const REGION_COORDINATES: Record<string, { x: number; y: number }> = {
  "Ionia": { x: 71.7, y: 19.3 },
  "Noxus": { x: 42.8, y: 24.9 },
  "Demacia": { x: 20.0, y: 34.7 },
  "Freljord": { x: 23.9, y: 14.4 },
  "Piltover": { x: 53.1, y: 47.0 },
  "Zaun": { x: 53.1, y: 54.4 },
  "Bilgewater": { x: 73.0, y: 57.4 },
  "Shadow Isles": { x: 80.0, y: 76.3 },
  "Shurima": { x: 46.4, y: 73.1 },
  "Targon": { x: 30.1, y: 75.5 },
  "Ixtal": { x: 58.3, y: 71.0 },
  // These don't have markers on the map - approximate placements
  "Bandle City": { x: 50.0, y: 50.0 },
  "The Void": { x: 52.5, y: 78.0 },
  "Runeterra": { x: 50.0, y: 50.0 },
};

export default function RegionPage() {
  const params = useParams();
  const regionSlug = params.region as string;
  const [region, setRegion] = useState<RegionInfo | null>(null);
  const [regionLore, setRegionLore] = useState<RegionLore | null>(null);
  const [champions, setChampions] = useState<ChampionBasic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch regions data
    fetch("/data/regions.json")
      .then((res) => res.json())
      .then((d: RegionsData) => {
        const regionName = Object.keys(d.regions).find(
          (key) => key.toLowerCase().replace(/ /g, "-") === regionSlug.toLowerCase()
        );
        if (regionName) {
          setRegion(d.regions[regionName]);
        }
        setLoading(false);
      });

    // Fetch region lore data
    fetch("/data/region-lore.json")
      .then((res) => res.json())
      .then((d: RegionLoreData) => {
        const regionName = Object.keys(d.regions).find(
          (key) => key.toLowerCase().replace(/ /g, "-") === regionSlug.toLowerCase()
        );
        if (regionName) {
          setRegionLore(d.regions[regionName]);
        }
      });

    // Fetch champions data
    fetch("/data/champions.json")
      .then((res) => res.json())
      .then((d) => {
        setChampions(
          d.champions.map((c: any) => ({
            id: c.id,
            name: c.name,
            title: c.title,
            image: c.image,
          }))
        );
      });
  }, [regionSlug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!region) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Region not found</p>
        <Link href="/champions" className="text-yellow-400 hover:underline">
          Back to Champions
        </Link>
      </div>
    );
  }

  // Filter champions that belong to this region
  const regionChampions = champions.filter((c) =>
    region.champions.includes(c.id) || region.champions.includes(c.id.replace(/([A-Z])/g, " $1").trim())
  );

  // Helper to get champion by ID
  const getChampion = (id: string) => champions.find((c) => c.id === id || c.name === id);

  return (
    <div className="min-h-[calc(100vh-57px)] overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link
          href="/champions"
          className="text-zinc-400 hover:text-zinc-200 text-sm mb-4 inline-block"
        >
          ← Back to Champions
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Title + Description + Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-3">
                {region.name}
              </h1>
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {regionLore?.fullDescription || region.description}
              </p>
            </div>

            {/* Geography / Culture / History - compact */}
            <div className="grid sm:grid-cols-3 gap-4">
              {regionLore?.geography && (
                <div>
                  <h3 className="text-yellow-400 text-sm font-bold mb-1">Geography</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{regionLore.geography}</p>
                </div>
              )}
              {regionLore?.culture && (
                <div>
                  <h3 className="text-yellow-400 text-sm font-bold mb-1">Culture</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{regionLore.culture}</p>
                </div>
              )}
              {regionLore?.history && (
                <div>
                  <h3 className="text-yellow-400 text-sm font-bold mb-1">History</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">{regionLore.history}</p>
                </div>
              )}
            </div>

            {/* Factions - compact, no border */}
            {regionLore?.factions && regionLore.factions.length > 0 && (
              <div>
                <h3 className="text-yellow-400 text-sm font-bold mb-2">Factions</h3>
                <div className="space-y-2">
                  {regionLore.factions.map((faction) => (
                    <div key={faction.name} className="flex flex-wrap items-center gap-2">
                      <span className="text-zinc-100 text-sm font-medium">{faction.name}</span>
                      <span className="text-zinc-500 text-xs">—</span>
                      <span className="text-zinc-400 text-xs">{faction.description}</span>
                      {faction.champions.length > 0 && faction.champions.map((champId) => {
                        const champ = getChampion(champId);
                        return champ ? (
                          <Link key={champId} href={`/champions/${champ.id}`}>
                            <img src={champ.image} alt={champ.name} className="w-5 h-5 rounded hover:ring-1 hover:ring-yellow-400" title={champ.name} />
                          </Link>
                        ) : null;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Champion Relationships - compact inline */}
            {regionLore?.relationships && regionLore.relationships.length > 0 && (
              <div>
                <h3 className="text-yellow-400 text-sm font-bold mb-2">Relationships</h3>
                <div className="space-y-1.5">
                  {regionLore.relationships.map((rel, i) => {
                    const champ1 = getChampion(rel.champion1);
                    const champ2 = rel.champion2 ? getChampion(rel.champion2) : null;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {champ1 && (
                          <Link href={`/champions/${champ1.id}`} className="flex items-center gap-1 hover:text-yellow-400">
                            <img src={champ1.image} alt="" className="w-5 h-5 rounded" />
                            <span className="text-zinc-200">{champ1.name}</span>
                          </Link>
                        )}
                        {champ2 && (
                          <>
                            <span className="text-zinc-500 px-1">{rel.type.replace(/_/g, " ")}</span>
                            <Link href={`/champions/${champ2.id}`} className="flex items-center gap-1 hover:text-yellow-400">
                              <img src={champ2.image} alt="" className="w-5 h-5 rounded" />
                              <span className="text-zinc-200">{champ2.name}</span>
                            </Link>
                          </>
                        )}
                        <span className="text-zinc-500 hidden sm:inline">— {rel.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cross-Region - compact */}
            {regionLore?.crossRegionRelationships && regionLore.crossRegionRelationships.length > 0 && (
              <div>
                <h3 className="text-yellow-400 text-sm font-bold mb-2">Cross-Region</h3>
                <div className="space-y-1.5">
                  {regionLore.crossRegionRelationships.map((rel, i) => {
                    const champ = getChampion(rel.champion);
                    const otherChamp = rel.otherChampion ? getChampion(rel.otherChampion) : null;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {champ && (
                          <Link href={`/champions/${champ.id}`} className="flex items-center gap-1 hover:text-yellow-400">
                            <img src={champ.image} alt="" className="w-5 h-5 rounded" />
                            <span className="text-zinc-200">{champ.name}</span>
                          </Link>
                        )}
                        <span className="text-zinc-500 px-1">{rel.type.replace(/_/g, " ")}</span>
                        {otherChamp && (
                          <Link href={`/champions/${otherChamp.id}`} className="flex items-center gap-1 hover:text-yellow-400">
                            <img src={otherChamp.image} alt="" className="w-5 h-5 rounded" />
                            <span className="text-zinc-200">{otherChamp.name}</span>
                          </Link>
                        )}
                        {rel.otherRegion && (
                          <Link href={`/regions/${rel.otherRegion.toLowerCase().replace(/ /g, "-")}`} className="text-yellow-400 hover:underline">
                            {rel.otherRegion}
                          </Link>
                        )}
                        <span className="text-zinc-500 hidden sm:inline">— {rel.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Map + Champions */}
          <div className="space-y-4">
            {/* Map */}
            <div className="rounded-lg border border-zinc-700 overflow-hidden bg-zinc-900">
              <Link href="/map" className="block relative group">
                <img
                  src="/runeterra-map.png"
                  alt="Map of Runeterra"
                  className="w-full h-auto group-hover:brightness-110 transition-all"
                />
                {REGION_COORDINATES[region.name] && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${REGION_COORDINATES[region.name].x}%`,
                      top: `${REGION_COORDINATES[region.name].y}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <div className="px-1.5 py-0.5 bg-purple-600 rounded text-white text-[8px] font-bold whitespace-nowrap shadow-lg mb-0.5">
                      {region.name.toUpperCase()}
                    </div>
                  </div>
                )}
              </Link>
              <div className="p-2 border-t border-zinc-700 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  <span className="text-purple-400 font-bold">{region.name}</span> on Runeterra
                </span>
                <a
                  href="https://map.leagueoflegends.com/en_US"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-yellow-400 hover:text-yellow-300"
                >
                  3D Map ↗
                </a>
              </div>
            </div>

            {/* Champions */}
            <div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2">
                Champions <span className="text-zinc-500 font-normal">({regionChampions.length})</span>
              </h3>
              <div className="grid grid-cols-5 gap-1">
                {regionChampions.map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/champions/${champ.id}`}
                    className="group"
                  >
                    <div className="rounded overflow-hidden border border-transparent group-hover:border-yellow-400 transition-colors">
                      <img
                        src={champ.image}
                        alt={champ.name}
                        className="w-full aspect-square object-cover"
                        title={champ.name}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Universe Link */}
            <a
              href={`https://universe.leagueoflegends.com/en_US/region/${regionSlug.replace(/-/g, "")}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-yellow-400 text-zinc-900 px-3 py-2 rounded text-sm font-medium hover:bg-yellow-300 transition-colors"
            >
              Explore on Universe ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
