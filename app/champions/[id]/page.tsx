"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Champion, ChampionData } from "../../types";

interface ChampionLore {
  id: string;
  name: string;
  title: string;
  lore: string;
  blurb: string;
}

interface RegionsData {
  championToRegion: Record<string, string>;
  regions: Record<string, { name: string; description: string; champions: string[] }>;
}

interface ChampionMeta {
  releaseDate: string;
  age: string;
}

interface ChampionMetaData {
  champions: Record<string, ChampionMeta>;
}

export default function ChampionLorePage() {
  const params = useParams();
  const championId = params.id as string;
  const [champion, setChampion] = useState<Champion | null>(null);
  const [lore, setLore] = useState<ChampionLore | null>(null);
  const [region, setRegion] = useState<{ name: string; description: string } | null>(null);
  const [meta, setMeta] = useState<ChampionMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch champion data
    fetch("/data/champions.json")
      .then((res) => res.json())
      .then((d: ChampionData) => {
        const found = d.champions.find(
          (c) => c.id.toLowerCase() === championId.toLowerCase()
        );
        if (found) setChampion(found);
      });

    // Fetch regions data
    fetch("/data/regions.json")
      .then((res) => res.json())
      .then((d: RegionsData) => {
        const regionName = d.championToRegion[championId];
        if (regionName && d.regions[regionName]) {
          setRegion({
            name: regionName,
            description: d.regions[regionName].description,
          });
        }
      });

    // Fetch champion meta (release date, age)
    fetch("/data/champion-meta.json")
      .then((res) => res.json())
      .then((d: ChampionMetaData) => {
        if (d.champions[championId]) {
          setMeta(d.champions[championId]);
        }
      });

    // Fetch lore from Data Dragon
    fetch(`https://ddragon.leagueoflegends.com/cdn/14.10.1/data/en_US/champion/${championId}.json`)
      .then((res) => res.json())
      .then((d) => {
        const data = d.data[championId];
        if (data) {
          setLore({
            id: data.id,
            name: data.name,
            title: data.title,
            lore: data.lore,
            blurb: data.blurb,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [championId]);

  const splash = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
  const universeUrl = `https://universe.leagueoflegends.com/en_US/champion/${championId.toLowerCase()}/`;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!champion && !lore) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Champion not found</p>
        <Link href="/champions" className="text-yellow-400 hover:underline">
          Back to Champions
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-57px)] overflow-auto">
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <img
          src={splash}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Link
            href="/champions"
            className="text-zinc-400 hover:text-zinc-200 text-sm mb-2 inline-block"
          >
            ← Back to Champions
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400">
            {lore?.name || champion?.name}
          </h1>
          <p className="text-lg text-zinc-400 italic">
            {lore?.title || champion?.title}
          </p>
          {region && (
            <Link
              href={`/regions/${region.name.toLowerCase().replace(/ /g, "-")}`}
              className="inline-block mt-2 text-sm px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded hover:bg-yellow-400/30 transition-colors"
            >
              {region.name}
            </Link>
          )}
          {meta && (
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="text-zinc-500">Released: </span>
                <span className="text-zinc-300">{new Date(meta.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              <div>
                <span className="text-zinc-500">Lore Age: </span>
                <span className="text-zinc-300">{meta.age}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Lore */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Biography</h2>
          <p className="text-zinc-300 leading-relaxed text-base">
            {lore?.lore || "No lore available."}
          </p>
        </section>

        {/* Link to Universe */}
        <section className="mb-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <p className="text-zinc-400 text-sm mb-3">
            Read the full story, explore related champions, and discover more about the world of Runeterra.
          </p>
          <a
            href={universeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded font-medium hover:bg-yellow-300 transition-colors"
          >
            Explore on Universe
            <span>↗</span>
          </a>
        </section>

        {/* Abilities quick reference */}
        {champion && (
          <section>
            <h2 className="text-xl font-bold text-zinc-100 mb-4">Abilities</h2>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "P", ability: champion.passive, isPassive: true },
                { label: "Q", ability: champion.abilities.q, isPassive: false },
                { label: "W", ability: champion.abilities.w, isPassive: false },
                { label: "E", ability: champion.abilities.e, isPassive: false },
                { label: "R", ability: champion.abilities.r, isPassive: false },
              ].map(({ label, ability, isPassive }) => {
                const cooldown = isPassive ? null : (ability as { cooldown?: number[] }).cooldown;
                const cooldownText = cooldown && cooldown.length > 0
                  ? (new Set(cooldown).size === 1
                      ? `${cooldown[0]}s`
                      : `${cooldown.join(" / ")}s`)
                  : null;

                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-500 font-bold">{label}</span>
                    <img
                      src={ability.image}
                      alt={ability.name}
                      className="h-12 w-12 rounded"
                    />
                    <span className="text-xs text-yellow-400 text-center">{ability.name}</span>
                    {cooldownText && (
                      <span className="text-xs text-cyan-400">{cooldownText}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
