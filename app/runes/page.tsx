"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Rune, RuneTree, RuneData } from "../types";

export default function RunesPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading runes...</div>}>
      <RunesContent />
    </Suspense>
  );
}

function RunesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<RuneData | null>(null);
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<number | null>(null);

  // Update URL when selection changes
  useEffect(() => {
    if (!selectedRune) return;
    const params = new URLSearchParams();
    params.set("r", selectedRune.key);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedRune, router]);

  useEffect(() => {
    fetch("/data/runes.json")
      .then((res) => res.json())
      .then((d: RuneData) => {
        setData(d);

        // Check URL for rune param
        const runeParam = searchParams.get("r");
        if (runeParam) {
          for (const tree of d.trees) {
            for (const slot of tree.slots) {
              const found = slot.runes.find(
                (r) => r.key.toLowerCase() === runeParam.toLowerCase()
              );
              if (found) {
                setSelectedRune(found);
                setSelectedTreeId(tree.id);
                return;
              }
            }
          }
        }

        // Default to first keystone
        if (d.trees.length > 0) {
          const firstTree = d.trees[0];
          setSelectedTreeId(firstTree.id);
          const firstKeystone = firstTree.slots[0]?.runes[0];
          if (firstKeystone) setSelectedRune(firstKeystone);
        }
      });
  }, [searchParams]);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading runes...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Rune Trees */}
      <aside className="lg:w-96 border-b lg:border-b-0 lg:border-r border-zinc-800 overflow-y-auto lg:h-[calc(100vh-57px)]">
        {data.trees.map((tree) => (
          <div key={tree.id}>
            {/* Tree Header */}
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-sm px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
              <img
                src={tree.icon}
                alt={tree.name}
                className="w-6 h-6"
              />
              <span className="text-sm font-bold text-purple-400">
                {tree.name.toUpperCase()}
              </span>
            </div>

            {/* Slots */}
            <div className="p-3 space-y-3">
              {tree.slots.map((slot, slotIndex) => (
                <div key={slotIndex}>
                  {/* Slot Label */}
                  <div className="text-[10px] text-zinc-500 mb-1.5">
                    {slot.isKeystone ? "KEYSTONE" : `ROW ${slotIndex}`}
                  </div>

                  {/* Runes in slot */}
                  <div className="flex gap-2">
                    {slot.runes.map((rune) => (
                      <button
                        key={rune.id}
                        onClick={() => {
                          setSelectedRune(rune);
                          setSelectedTreeId(tree.id);
                        }}
                        className={`relative rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          slot.isKeystone ? "w-12 h-12" : "w-10 h-10"
                        } ${
                          selectedRune?.id === rune.id
                            ? "border-purple-400 ring-2 ring-purple-400/50"
                            : "border-transparent hover:border-zinc-600"
                        }`}
                        title={rune.name}
                      >
                        <img
                          src={rune.icon}
                          alt={rune.name}
                          className="w-full h-full object-cover bg-zinc-800"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Rune Detail */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto lg:h-[calc(100vh-57px)]">
        {selectedRune ? (
          <RuneDetail
            rune={selectedRune}
            tree={data.trees.find((t) => t.id === selectedTreeId)}
          />
        ) : (
          <p className="text-zinc-500">Select a rune</p>
        )}
      </main>
    </div>
  );
}

function RuneDetail({ rune, tree }: { rune: Rune; tree?: RuneTree }) {
  // Clean HTML from description
  const cleanDesc = rune.longDesc
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="max-w-2xl">
      {/* Rune Header */}
      <div className="flex items-start gap-4 mb-6">
        <img
          src={rune.icon}
          alt={rune.name}
          className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-800"
        />
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{rune.name}</h1>
          {tree && (
            <div className="flex items-center gap-2 mt-1">
              <img src={tree.icon} alt={tree.name} className="w-4 h-4" />
              <span className="text-sm text-purple-400">{tree.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Short Description */}
      <div className="p-4 bg-purple-400/10 border border-purple-400/30 rounded-lg mb-6">
        <p className="text-sm text-zinc-200">
          {rune.shortDesc.replace(/<[^>]*>/g, "")}
        </p>
      </div>

      {/* Full Description */}
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
        <h2 className="text-xs font-bold text-zinc-500 mb-2">DETAILS</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">{cleanDesc}</p>
      </div>
    </div>
  );
}
