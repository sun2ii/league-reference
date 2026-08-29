"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Champion, ChampionData, Position } from "../types";

const POSITIONS: { key: Position; label: string }[] = [
  { key: "TOP", label: "Top" },
  { key: "JUNGLE", label: "Jungle" },
  { key: "MIDDLE", label: "Mid" },
  { key: "BOTTOM", label: "Bot" },
  { key: "SUPPORT", label: "Support" },
];

const REGIONS = [
  "Ionia", "Noxus", "Demacia", "Freljord", "Piltover", "Zaun",
  "Bilgewater", "Shadow Isles", "Shurima", "Targon", "The Void",
  "Bandle City", "Ixtal", "Runeterra"
];

interface RegionsData {
  championToRegion: Record<string, string>;
}

export default function ChampionsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading champions...</div>}>
      <ChampionsContent />
    </Suspense>
  );
}

function ChampionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ChampionData | null>(null);
  const [regionsData, setRegionsData] = useState<RegionsData | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [championId, setChampionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMiniSearch, setShowMiniSearch] = useState(false);

  // Update URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (championId) params.set("c", championId);
    const newUrl = params.toString() ? `?${params.toString()}` : "/champions";
    router.replace(newUrl, { scroll: false });
  }, [search, championId, router]);

  useEffect(() => {
    // Fetch champions
    fetch("/data/champions.json")
      .then((res) => res.json())
      .then((d: ChampionData) => {
        setData(d);
        const cParam = searchParams.get("c");

        if (cParam) {
          const found = d.champions.find(
            (c) => c.id.toLowerCase() === cParam.toLowerCase()
          );
          if (found) setChampionId(found.id);
        } else {
          // Default to Master Yi
          const masterYi = d.champions.find((c) => c.id === "MasterYi");
          setChampionId(masterYi?.id || d.champions[0]?.id || null);
        }
      });

    // Fetch regions
    fetch("/data/regions.json")
      .then((res) => res.json())
      .then((d: RegionsData) => setRegionsData(d));
  }, [searchParams]);

  const groupedByRegion = useMemo(() => {
    if (!data || !regionsData) return {};

    let championsToGroup = data.champions;

    if (search.trim()) {
      const q = search.toLowerCase();
      championsToGroup = championsToGroup.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.roles?.some((r) => r.toLowerCase().includes(q)) ||
          regionsData.championToRegion[c.id]?.toLowerCase().includes(q)
      );
    }

    const groups: Record<string, Champion[]> = {};

    for (const region of REGIONS) {
      const champs = championsToGroup.filter(
        (c) => regionsData.championToRegion[c.id] === region
      );
      if (champs.length > 0) {
        groups[region] = champs;
      }
    }

    return groups;
  }, [data, regionsData, search]);

  const totalCount = useMemo(() => {
    return Object.values(groupedByRegion).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }, [groupedByRegion]);

  const champion = useMemo(() => {
    if (!data || !championId) return null;
    return data.champions.find((c) => c.id === championId) || null;
  }, [data, championId]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading champions...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] flex overflow-hidden">
      {/* Champion Grid Sidebar */}
      <aside className={`relative shrink-0 border-r border-zinc-800 transition-all duration-200 flex flex-col ${sidebarCollapsed ? "w-12" : "w-72 overflow-y-auto"}`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full p-2 border-b border-zinc-800 flex items-center justify-center hover:bg-zinc-800 cursor-pointer shrink-0"
        >
          <span className="text-zinc-400 text-sm">{sidebarCollapsed ? "→" : "←"}</span>
        </button>

        {sidebarCollapsed ? (
          /* Collapsed: search icon button with popover */
          <div className="relative p-1.5">
            <button
              onClick={() => setShowMiniSearch((prev) => !prev)}
              className="w-full aspect-square bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center hover:bg-zinc-700 cursor-pointer"
            >
              <span className="text-zinc-400 text-sm">🔍</span>
            </button>
            {showMiniSearch && (
              <div className="absolute left-full top-0 ml-2 w-64 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50">
                <input
                  type="text"
                  placeholder="Search champions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-zinc-800 border-b border-zinc-700 rounded-t-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
                <div className="max-h-64 overflow-y-auto">
                  {data?.champions
                    .filter((c) =>
                      !search.trim() ||
                      c.name.toLowerCase().includes(search.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setChampionId(c.id);
                          setShowMiniSearch(false);
                          setSearch("");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 cursor-pointer text-left"
                      >
                        <img src={c.image} alt="" className="h-6 w-6 rounded" />
                        <span className="text-sm text-zinc-100">{c.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="p-2 border-b border-zinc-800 shrink-0">
              <input
                type="text"
                placeholder="Search champions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Count */}
            <div className="px-3 py-2 border-b border-zinc-800 shrink-0">
              <span className="text-xs text-zinc-500">{totalCount} champions</span>
            </div>

            {/* Grouped by Region */}
            <div className="flex-1 overflow-y-auto">
              {REGIONS.map((region) => {
                const champs = groupedByRegion[region];
                if (!champs || champs.length === 0) return null;

                return (
                  <div key={region}>
                    <Link
                      href={`/regions/${region.toLowerCase().replace(/ /g, "-")}`}
                      className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm px-3 py-1 border-b border-zinc-800 flex items-center hover:bg-zinc-800/50"
                    >
                      <span className="text-[10px] font-bold text-yellow-400">
                        {region.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">
                        {champs.length}
                      </span>
                    </Link>

                    <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-0.5 p-1">
                      {champs.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setChampionId(c.id)}
                          className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer ${
                            championId === c.id
                              ? "border-yellow-400 ring-1 ring-yellow-400/50"
                              : "border-transparent hover:border-zinc-600"
                          }`}
                          title={c.name}
                        >
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {totalCount === 0 && (
                <p className="text-zinc-500 text-sm p-4 text-center">
                  No champions found
                </p>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Champion View */}
      <main className="min-w-0 min-h-0 flex-1 overflow-hidden p-2">
        {champion ? (
          <ChampionView champion={champion} />
        ) : (
          <p className="text-zinc-500">Select a champion</p>
        )}
      </main>
    </div>
  );
}

function ChampionView({ champion }: { champion: Champion }) {
  const splash = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;

  const abilities = [
    { label: "P", ability: champion.passive },
    { label: "Q", ability: champion.abilities.q },
    { label: "W", ability: champion.abilities.w },
    { label: "E", ability: champion.abilities.e },
    { label: "R", ability: champion.abilities.r },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden grid grid-rows-[minmax(100px,1fr)_auto] gap-2">
      {/* Champion Header */}
      <div className="relative min-w-0 overflow-hidden rounded-md border border-zinc-800">
        <img src={splash} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-3">
          <Link href={`/champions/${champion.id}`} className="text-lg font-bold text-yellow-400 hover:underline">
            {champion.name}
          </Link>
          <div className="text-xs text-zinc-400 italic">{champion.title}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {champion.positions?.map((p) => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 rounded">{p}</span>
            ))}
            {champion.roles?.map((r) => (
              <span key={r} className="text-[10px] px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Abilities - always 5 columns */}
      <div className="grid grid-cols-5 gap-1">
        {abilities.map(({ label, ability }) => (
          <AbilityCard key={label} label={label} ability={ability} />
        ))}
      </div>
    </div>
  );
}

function normalizeDescription(text: string) {
  return text
    // Add space after sentence punctuation when missing
    .replace(/([.!?])([A-Z])/g, "$1 $2")
    // Collapse accidental duplicate whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function AbilityCard({ label, ability }: { label: string; ability: { name: string; description: string; image: string; cooldown?: number[] } }) {
  const cooldownText = ability.cooldown && ability.cooldown.length > 0
    ? (new Set(ability.cooldown).size === 1
        ? `${ability.cooldown[0]}s`
        : `${ability.cooldown.join(" / ")}s`)
    : null;

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 p-3 flex flex-col">
      {/* Header: icon centered with label */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <span className="text-xs font-bold text-zinc-500">{label}</span>
        <img
          src={ability.image}
          alt=""
          className="h-24 w-24 rounded object-cover"
          style={{ imageRendering: "auto", filter: "contrast(1.02) saturate(1.05)" }}
        />
      </div>
      {/* Name + cooldown (fixed height to align descriptions) */}
      <div className="text-center mb-2">
        <div className="text-sm font-semibold text-yellow-400">
          {ability.name}
        </div>
        <div className="text-sm text-cyan-400 font-medium h-5 whitespace-nowrap">
          {cooldownText ?? "\u00A0"}
        </div>
      </div>
      {/* Description */}
      <p className="text-xs text-zinc-300 leading-relaxed">
        {normalizeDescription(ability.description)}
      </p>
    </div>
  );
}
