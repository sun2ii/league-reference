"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Item, ItemData } from "../types";

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading items...</div>}>
      <ItemsContent />
    </Suspense>
  );
}

const CATEGORIES = [
  { key: "Boots", label: "Boots" },
  { key: "Damage", label: "Damage" },
  { key: "CriticalStrike", label: "Crit" },
  { key: "AttackSpeed", label: "Attack Speed" },
  { key: "SpellDamage", label: "Ability Power" },
  { key: "Armor", label: "Armor" },
  { key: "SpellBlock", label: "Magic Resist" },
  { key: "Health", label: "Health" },
  { key: "Mana", label: "Mana" },
  { key: "LifeSteal", label: "Lifesteal" },
  { key: "Jungle", label: "Jungle" },
];

function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<ItemData | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Update URL when search/selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedId) params.set("i", selectedId);
    const newUrl = params.toString() ? `?${params.toString()}` : "/items";
    router.replace(newUrl, { scroll: false });
  }, [search, selectedId, router]);

  useEffect(() => {
    fetch("/data/items.json")
      .then((res) => res.json())
      .then((d: ItemData) => {
        setData(d);
        // Check URL for item param first
        const itemParam = searchParams.get("i");
        const queryParam = searchParams.get("q");

        if (itemParam) {
          const found = d.items.find((i) => i.id === itemParam);
          if (found) {
            setSelectedId(found.id);
            return;
          }
        }

        // If query param, try to select first match
        if (queryParam) {
          const q = queryParam.toLowerCase();
          const match = d.items.find((i) =>
            i.name.toLowerCase().includes(q)
          );
          if (match) {
            setSelectedId(match.id);
            return;
          }
        }

        if (d.items.length > 0) setSelectedId(d.items[0].id);
      });
  }, [searchParams]);

  const groupedByCategory = useMemo(() => {
    if (!data) return {};

    let itemsToGroup = data.items;

    if (search.trim()) {
      const q = search.toLowerCase();
      itemsToGroup = itemsToGroup.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.plaintext.toLowerCase().includes(q)
      );
    }

    const groups: Record<string, Item[]> = {};
    const categorized = new Set<string>();

    for (const cat of CATEGORIES) {
      const items = itemsToGroup.filter(
        (item) => item.tags.includes(cat.key) && !categorized.has(item.id)
      );
      if (items.length > 0) {
        groups[cat.key] = items;
        items.forEach((item) => categorized.add(item.id));
      }
    }

    // Add uncategorized items
    const other = itemsToGroup.filter((item) => !categorized.has(item.id));
    if (other.length > 0) {
      groups["Other"] = other;
    }

    return groups;
  }, [data, search]);

  const totalCount = useMemo(() => {
    return Object.values(groupedByCategory).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }, [groupedByCategory]);

  const selected = useMemo(() => {
    if (!data || !selectedId) return null;
    return data.items.find((item) => item.id === selectedId) || null;
  }, [data, selectedId]);

  const allItems = data?.items || [];

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading items...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Item Grid */}
      <aside className="lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-y-auto lg:h-[calc(100vh-57px)]">
        {/* Search */}
        <div className="p-2 border-b border-zinc-800">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        {/* Count */}
        <div className="text-xs text-zinc-500 px-3 py-2 border-b border-zinc-800">
          {totalCount} items
        </div>

        {/* Grouped by Category */}
        {CATEGORIES.map((cat) => {
          const items = groupedByCategory[cat.key];
          if (!items || items.length === 0) return null;

          return (
            <div key={cat.key}>
              <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 border-b border-zinc-800">
                <span className="text-xs font-bold text-cyan-400">
                  {cat.label.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500 ml-2">
                  {items.length}
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1 p-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedId === item.id
                        ? "border-cyan-400 ring-2 ring-cyan-400/50"
                        : "border-transparent hover:border-zinc-600"
                    }`}
                    title={item.name}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover bg-zinc-800"
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Other */}
        {groupedByCategory["Other"] && (
          <div>
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400">OTHER</span>
              <span className="text-xs text-zinc-500 ml-2">
                {groupedByCategory["Other"].length}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1 p-2">
              {groupedByCategory["Other"].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedId === item.id
                      ? "border-cyan-400 ring-2 ring-cyan-400/50"
                      : "border-transparent hover:border-zinc-600"
                  }`}
                  title={item.name}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover bg-zinc-800"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <p className="text-zinc-500 text-sm p-4 text-center">No items found</p>
        )}
      </aside>

      {/* Item Detail */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto lg:h-[calc(100vh-57px)]">
        {selected ? (
          <ItemDetail item={selected} allItems={allItems} />
        ) : (
          <p className="text-zinc-500">Select an item</p>
        )}
      </main>
    </div>
  );
}

function parseItemDescription(html: string) {
  // Extract stats section
  const statsMatch = html.match(/<stats>([\s\S]*?)<\/stats>/);
  const stats = statsMatch
    ? statsMatch[1]
        .replace(/<attention>/g, "")
        .replace(/<\/attention>/g, "")
        .replace(/<br>/g, "\n")
        .replace(/<[^>]*>/g, "")
        .trim()
    : "";

  // Extract passive/active abilities
  const passives: { name: string; description: string }[] = [];
  const passiveRegex = /<passive>(.*?)<\/passive><br>([\s\S]*?)(?=<passive>|<active>|<\/mainText>|$)/g;
  let match;
  while ((match = passiveRegex.exec(html)) !== null) {
    passives.push({
      name: match[1],
      description: match[2]
        .replace(/<br><br>/g, "\n")
        .replace(/<br>/g, " ")
        .replace(/<[^>]*>/g, "")
        .trim(),
    });
  }

  const activeRegex = /<active>(.*?)<\/active><br>([\s\S]*?)(?=<passive>|<active>|<\/mainText>|$)/g;
  while ((match = activeRegex.exec(html)) !== null) {
    passives.push({
      name: `Active: ${match[1]}`,
      description: match[2]
        .replace(/<br><br>/g, "\n")
        .replace(/<br>/g, " ")
        .replace(/<[^>]*>/g, "")
        .trim(),
    });
  }

  return { stats, passives };
}

function ItemDetail({ item, allItems }: { item: Item; allItems: Item[] }) {
  const { stats, passives } = parseItemDescription(item.description);

  return (
    <div className="max-w-2xl">
      {/* Item Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-lg border border-zinc-700 bg-zinc-800"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-100">{item.name}</h1>
          {item.plaintext && (
            <p className="text-zinc-400 text-sm">{item.plaintext}</p>
          )}
          <div className="flex gap-3 mt-2">
            <span className="text-sm text-yellow-400 font-medium">
              {item.gold.total}g
            </span>
            {item.gold.total !== item.gold.base && (
              <span className="text-sm text-zinc-500">
                ({item.gold.base}g + components)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800 mb-4">
          <h2 className="text-xs font-bold text-zinc-500 mb-2">STATS</h2>
          <div className="text-sm text-cyan-400 whitespace-pre-line">{stats}</div>
        </div>
      )}

      {/* Passives/Actives */}
      {passives.length > 0 && (
        <div className="space-y-3 mb-6">
          {passives.map((passive, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800"
            >
              <h3 className="text-sm font-bold text-yellow-400 mb-1">
                {passive.name}
              </h3>
              <p className="text-sm text-zinc-300 whitespace-pre-line">
                {passive.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-zinc-500 mb-2">TAGS</h2>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Builds From */}
      {item.from.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-zinc-500 mb-2">BUILDS FROM</h2>
          <div className="flex gap-2">
            {item.from.map((componentId, idx) => {
              const component = allItems.find((i) => i.id === componentId);
              if (!component) return null;
              return (
                <div key={`from-${idx}`} className="text-center">
                  <img
                    src={component.image}
                    alt={component.name}
                    className="w-10 h-10 rounded border border-zinc-700 bg-zinc-800"
                    title={component.name}
                  />
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {component.gold.total}g
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Builds Into */}
      {item.into.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-zinc-500 mb-2">BUILDS INTO</h2>
          <div className="flex flex-wrap gap-2">
            {item.into.map((upgradeId, idx) => {
              const upgrade = allItems.find((i) => i.id === upgradeId);
              if (!upgrade) return null;
              return (
                <div key={`into-${idx}`} className="text-center">
                  <img
                    src={upgrade.image}
                    alt={upgrade.name}
                    className="w-10 h-10 rounded border border-zinc-700 bg-zinc-800"
                    title={upgrade.name}
                  />
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {upgrade.gold.total}g
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
