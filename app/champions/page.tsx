"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Champion, ChampionData, Position } from "../types";

const POSITIONS: { key: Position; label: string }[] = [
  { key: "TOP", label: "Top" },
  { key: "JUNGLE", label: "Jungle" },
  { key: "MIDDLE", label: "Mid" },
  { key: "BOTTOM", label: "Bot" },
  { key: "SUPPORT", label: "Support" },
];

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
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [champion1Id, setChampion1Id] = useState<string | null>(null);
  const [champion2Id, setChampion2Id] = useState<string | null>(null);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2>(2);

  // Update URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (champion1Id) params.set("c1", champion1Id);
    if (champion2Id) params.set("c2", champion2Id);
    const newUrl = params.toString() ? `?${params.toString()}` : "/champions";
    router.replace(newUrl, { scroll: false });
  }, [search, champion1Id, champion2Id, router]);

  useEffect(() => {
    fetch("/data/champions.json")
      .then((res) => res.json())
      .then((d: ChampionData) => {
        setData(d);
        const c1Param = searchParams.get("c1");
        const c2Param = searchParams.get("c2");

        if (c1Param) {
          const found = d.champions.find(
            (c) => c.id.toLowerCase() === c1Param.toLowerCase()
          );
          if (found) setChampion1Id(found.id);
        } else {
          // Default to Master Yi
          const masterYi = d.champions.find((c) => c.id === "MasterYi");
          setChampion1Id(masterYi?.id || d.champions[0]?.id || null);
        }

        if (c2Param) {
          const found = d.champions.find(
            (c) => c.id.toLowerCase() === c2Param.toLowerCase()
          );
          if (found) setChampion2Id(found.id);
        } else if (d.champions.length > 1) {
          setChampion2Id(d.champions[1].id);
        }
      });
  }, [searchParams]);

  const groupedByPosition = useMemo(() => {
    if (!data) return {};

    let championsToGroup = data.champions;

    if (search.trim()) {
      const q = search.toLowerCase();
      championsToGroup = championsToGroup.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.roles?.some((r) => r.toLowerCase().includes(q))
      );
    }

    const groups: Record<string, Champion[]> = {};

    for (const pos of POSITIONS) {
      const champs = championsToGroup.filter((c) =>
        c.positions?.includes(pos.key)
      );
      if (champs.length > 0) {
        groups[pos.key] = champs;
      }
    }

    return groups;
  }, [data, search]);

  const totalCount = useMemo(() => {
    return Object.values(groupedByPosition).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }, [groupedByPosition]);

  const champion1 = useMemo(() => {
    if (!data || !champion1Id) return null;
    return data.champions.find((c) => c.id === champion1Id) || null;
  }, [data, champion1Id]);

  const champion2 = useMemo(() => {
    if (!data || !champion2Id) return null;
    return data.champions.find((c) => c.id === champion2Id) || null;
  }, [data, champion2Id]);

  const handleChampionClick = (id: string) => {
    if (selectingSlot === 1) {
      setChampion1Id(id);
    } else {
      setChampion2Id(id);
    }
  };

  const swapChampions = () => {
    const temp = champion1Id;
    setChampion1Id(champion2Id);
    setChampion2Id(temp);
  };

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading champions...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] flex overflow-hidden">
      {/* Champion Grid */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-zinc-800">
        {/* Search */}
        <div className="p-2 border-b border-zinc-800">
          <input
            type="text"
            placeholder="Search champions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Slot Selection */}
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
          <span className="text-xs text-zinc-500">{totalCount}</span>
          <div className="flex-1" />
          <button
            onClick={() => setSelectingSlot(1)}
            className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
              selectingSlot === 1
                ? "bg-yellow-400 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Left
          </button>
          <button
            onClick={() => setSelectingSlot(2)}
            className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
              selectingSlot === 2
                ? "bg-red-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Right
          </button>
        </div>

        {/* Grouped by Position */}
        {POSITIONS.map((pos) => {
          const champs = groupedByPosition[pos.key];
          if (!champs || champs.length === 0) return null;

          return (
            <div key={pos.key}>
              <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm px-3 py-1 border-b border-zinc-800">
                <span className="text-[10px] font-bold text-yellow-400">
                  {pos.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-zinc-500 ml-1">
                  {champs.length}
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-0.5 p-1">
                {champs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleChampionClick(c.id)}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer ${
                      champion1Id === c.id
                        ? "border-yellow-400 ring-1 ring-yellow-400/50"
                        : champion2Id === c.id
                        ? "border-red-500 ring-1 ring-red-500/50"
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
      </aside>

      {/* Compare View */}
      <main className="min-w-0 min-h-0 flex-1 overflow-hidden p-2">
        {champion1 && champion2 ? (
          <CompareView
            champion1={champion1}
            champion2={champion2}
            onSwap={swapChampions}
          />
        ) : (
          <p className="text-zinc-500">Select two champions</p>
        )}
      </main>
    </div>
  );
}

function CompareView({
  champion1,
  champion2,
  onSwap,
}: {
  champion1: Champion;
  champion2: Champion;
  onSwap: () => void;
}) {
  const splash1 = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion1.id}_0.jpg`;
  const splash2 = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion2.id}_0.jpg`;

  const abilities = [
    { label: "P", a1: champion1.passive, a2: champion2.passive },
    { label: "Q", a1: champion1.abilities.q, a2: champion2.abilities.q },
    { label: "W", a1: champion1.abilities.w, a2: champion2.abilities.w },
    { label: "E", a1: champion1.abilities.e, a2: champion2.abilities.e },
    { label: "R", a1: champion1.abilities.r, a2: champion2.abilities.r },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden grid grid-rows-[80px_minmax(0,1fr)] gap-2">
      {/* Champion Header */}
      <div className="grid grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] gap-2 min-h-0">
        {/* Champion 1 */}
        <div className="relative min-w-0 overflow-hidden rounded-md border border-zinc-800">
          <img src={splash1} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative flex h-full flex-col justify-end p-2">
            <div className="text-sm font-bold text-yellow-400">{champion1.name}</div>
            <div className="flex gap-1">
              {champion1.positions?.map((p) => (
                <span key={p} className="text-[8px] px-1 bg-yellow-400/20 text-yellow-400 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onSwap}
            className="flex h-8 w-10 items-center justify-center rounded-md bg-red-500 text-xs font-bold text-white cursor-pointer hover:bg-red-600"
          >
            VS
          </button>
        </div>

        {/* Champion 2 */}
        <div className="relative min-w-0 overflow-hidden rounded-md border border-zinc-800">
          <img src={splash2} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative flex h-full flex-col justify-end p-2">
            <div className="text-sm font-bold text-red-400">{champion2.name}</div>
            <div className="flex gap-1">
              {champion2.positions?.map((p) => (
                <span key={p} className="text-[8px] px-1 bg-red-400/20 text-red-400 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Five Ability Rows */}
      <div className="min-h-0 grid grid-rows-5 gap-1">
        {abilities.map(({ label, a1, a2 }) => (
          <div
            key={label}
            className="min-h-0 grid grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] gap-2"
          >
            <AbilityCard ability={a1} side="left" />
            <div className="flex items-center justify-center text-[11px] font-bold text-zinc-500">
              {label}
            </div>
            <AbilityCard ability={a2} side="right" />
          </div>
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

function AutoFitText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const max = 14;
      const min = 9;
      let size = max;
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = "1.25";

      while (el.scrollHeight > el.clientHeight && size > min) {
        size -= 0.5;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <p ref={ref} className={`overflow-hidden ${className}`}>
      {children}
    </p>
  );
}

function AbilityCard({ ability, side }: { ability: { name: string; description: string; image: string; cooldown?: number[] }; side: "left" | "right" }) {
  return (
    <div className="min-h-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5">
      <div className="flex h-full min-h-0 gap-2">
        <img
          src={ability.image}
          alt=""
          className="h-9 w-9 shrink-0 rounded object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={`shrink-0 truncate text-sm font-semibold ${side === "left" ? "text-yellow-400" : "text-red-400"}`}>
            {ability.name}
          </div>
          {ability.cooldown && ability.cooldown.length > 0 && (
            <div className="shrink-0 text-xs text-cyan-400">
              {ability.cooldown.join(" / ")}s
            </div>
          )}
          <AutoFitText className="mt-1 flex-1 min-h-0 text-zinc-300">
            {normalizeDescription(ability.description)}
          </AutoFitText>
        </div>
      </div>
    </div>
  );
}
