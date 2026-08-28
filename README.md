# League Reference

Quick reference app for League of Legends champions, items, and runes.

## Features

- **Champions**: Browse all 170+ champions grouped by position (Top, Jungle, Mid, Bot, Support). Compare two champions side-by-side with abilities, cooldowns, and descriptions.
- **Items**: Explore items by category with stats, passives, and build paths.
- **Runes**: View all rune trees and keystones with detailed descriptions.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data

Static JSON data in `public/data/`:

- `champions.json` - Champion data with abilities, positions, and images
- `items.json` - Item stats, descriptions, and build paths
- `runes.json` - Rune trees and keystones

Data sourced from Riot's Data Dragon API and Meraki Analytics.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS

## Scripts

- `scripts/update-champions.js` - Fetches latest champion data and merges position data from Meraki Analytics
