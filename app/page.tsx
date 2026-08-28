import Link from "next/link";

const SECTIONS = [
  {
    href: "/champions",
    title: "Champions",
    description: "Browse all 170+ champions grouped by position",
    color: "yellow",
  },
  {
    href: "/items",
    title: "Items",
    description: "Explore items, stats, and build paths",
    color: "cyan",
  },
  {
    href: "/runes",
    title: "Runes",
    description: "View all rune trees and keystones",
    color: "purple",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-zinc-100 mb-2 text-center">
          League Reference
        </h1>
        <p className="text-zinc-500 text-center mb-12">
          Quick reference for champions, items, and runes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`group block p-6 rounded-xl border border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60 transition-all cursor-pointer hover:border-${section.color}-400/50`}
            >
              <h2
                className={`text-xl font-bold mb-2 text-${section.color}-400`}
              >
                {section.title}
              </h2>
              <p className="text-zinc-400 text-sm">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
