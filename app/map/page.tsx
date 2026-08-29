"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REGIONS_NORTH = [
  { name: "Freljord", slug: "freljord" },
  { name: "Demacia", slug: "demacia" },
  { name: "Noxus", slug: "noxus" },
  { name: "Ionia", slug: "ionia" },
];

const REGIONS_SOUTH = [
  { name: "Piltover & Zaun", slug: "piltover", displayName: "Piltover & Zaun" },
  { name: "Bilgewater", slug: "bilgewater" },
  { name: "Targon", slug: "targon" },
  { name: "Shurima", slug: "shurima" },
  { name: "Ixtal", slug: "ixtal" },
  { name: "Shadow Isles", slug: "shadow-isles" },
];

const REGIONS_NOT_ON_MAP = [
  { name: "Bandle City", slug: "bandle-city" },
  { name: "The Void", slug: "the-void" },
];

// Invisible hitbox rectangles for hover detection (percentages)
const REGION_HITBOXES: Record<string, { x1: number; y1: number; x2: number; y2: number; slug: string }> = {
  "Ionia": { x1: 67.5, y1: 15.5, x2: 76.0, y2: 27.0, slug: "ionia" },
  "Noxus": { x1: 38.5, y1: 21.0, x2: 47.5, y2: 32.0, slug: "noxus" },
  "Demacia": { x1: 15.5, y1: 30.5, x2: 25.5, y2: 42.0, slug: "demacia" },
  "Freljord": { x1: 19.5, y1: 9.5, x2: 28.5, y2: 21.5, slug: "freljord" },
  "Piltover & Zaun": { x1: 50.0, y1: 43.5, x2: 66.0, y2: 57.5, slug: "piltover" },
  "Bilgewater": { x1: 67.5, y1: 53.5, x2: 78.0, y2: 64.0, slug: "bilgewater" },
  "Shadow Isles": { x1: 74.0, y1: 72.0, x2: 86.5, y2: 83.0, slug: "shadow-isles" },
  "Shurima": { x1: 41.5, y1: 69.0, x2: 51.5, y2: 80.0, slug: "shurima" },
  "Targon": { x1: 26.0, y1: 71.0, x2: 34.5, y2: 82.5, slug: "targon" },
  "Ixtal": { x1: 55.0, y1: 67.0, x2: 62.5, y2: 78.0, slug: "ixtal" },
};

// Icon center coordinates for glow effect (percentages)
const ICON_CENTERS: Record<string, { x: number; y: number }> = {
  "Ionia": { x: 71.7, y: 19.3 },
  "Noxus": { x: 42.8, y: 24.9 },
  "Demacia": { x: 20.0, y: 34.7 },
  "Freljord": { x: 23.9, y: 14.4 },
  "Piltover & Zaun": { x: 53.1, y: 47.0 },
  "Bilgewater": { x: 73.0, y: 57.4 },
  "Shadow Isles": { x: 80.0, y: 76.3 },
  "Shurima": { x: 46.4, y: 73.1 },
  "Targon": { x: 30.1, y: 75.5 },
  "Ixtal": { x: 58.3, y: 71.0 },
};

export default function MapPage() {
  const router = useRouter();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-57px)] flex">
      {/* Sidebar with regions */}
      <aside className="w-48 shrink-0 border-r border-zinc-800 p-4 overflow-y-auto">
        {/* North */}
        <h2 className="text-xs font-bold text-zinc-500 mb-2">NORTH</h2>
        <div className="flex flex-col gap-1 mb-4">
          {REGIONS_NORTH.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className={`text-sm py-1 px-2 rounded transition-colors ${
                hoveredRegion === r.name
                  ? "text-purple-400 bg-purple-500/20"
                  : "text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800"
              }`}
              onMouseEnter={() => setHoveredRegion(r.name)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {r.name}
            </Link>
          ))}
        </div>

        {/* South */}
        <h2 className="text-xs font-bold text-zinc-500 mb-2">SOUTH</h2>
        <div className="flex flex-col gap-1 mb-4">
          {REGIONS_SOUTH.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className={`text-sm py-1 px-2 rounded transition-colors ${
                hoveredRegion === r.name || hoveredRegion === "Piltover & Zaun"
                  ? "text-purple-400 bg-purple-500/20"
                  : "text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800"
              }`}
              onMouseEnter={() => setHoveredRegion(r.name)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {r.name}
            </Link>
          ))}
        </div>

        {/* Not on Map */}
        <h2 className="text-xs font-bold text-zinc-500 mb-2">NOT ON MAP</h2>
        <div className="flex flex-col gap-1">
          {REGIONS_NOT_ON_MAP.map((r) => (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className="text-sm py-1 px-2 rounded transition-colors text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800"
            >
              {r.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <a
            href="https://map.leagueoflegends.com/en_US"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300"
          >
            Interactive 3D Map
            <span>↗</span>
          </a>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="relative max-w-4xl w-full">
          <img
            src="/runeterra-map.png"
            alt="Map of Runeterra"
            className="w-full h-auto rounded-lg border border-zinc-700"
          />

          {/* Invisible hitboxes for hover detection */}
          {Object.entries(REGION_HITBOXES).map(([name, box]) => (
            <div
              key={name}
              className="absolute cursor-pointer"
              style={{
                left: `${box.x1}%`,
                top: `${box.y1}%`,
                width: `${box.x2 - box.x1}%`,
                height: `${box.y2 - box.y1}%`,
              }}
              onMouseEnter={() => setHoveredRegion(name)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => router.push(`/regions/${box.slug}`)}
            />
          ))}

          {/* Tooltip on hovered region */}
          {hoveredRegion && ICON_CENTERS[hoveredRegion] && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${ICON_CENTERS[hoveredRegion].x}%`,
                top: `${ICON_CENTERS[hoveredRegion].y}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="px-3 py-1.5 bg-purple-600 rounded text-white text-sm font-bold whitespace-nowrap shadow-lg mb-2">
                {hoveredRegion}
              </div>
            </div>
          )}

          <p className="text-center text-zinc-500 text-xs mt-4">
            Hover over a region to highlight it. Click to explore.
          </p>
        </div>
      </main>
    </div>
  );
}
