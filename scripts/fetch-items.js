#!/usr/bin/env node
/**
 * Fetches item data from Data Dragon
 * Run with: node scripts/fetch-items.js
 */

const fs = require('fs');
const path = require('path');

const DDRAGON_VERSION = '14.24.1';
const ITEMS_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/item.json`;
const OUTPUT_PATH = path.join(__dirname, '../public/data/items.json');

async function main() {
  console.log('Fetching items from Data Dragon...');
  const res = await fetch(ITEMS_URL);
  const data = await res.json();

  // Transform items into a cleaner format
  const items = Object.entries(data.data).map(([id, item]) => ({
    id,
    name: item.name,
    description: item.description,
    plaintext: item.plaintext || '',
    gold: item.gold,
    tags: item.tags || [],
    stats: item.stats || {},
    into: item.into || [],
    from: item.from || [],
    image: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${id}.png`,
    // Only include items purchasable on Summoner's Rift (map 11)
    maps: item.maps,
  })).filter(item => item.maps?.['11'] === true && item.gold?.purchasable);

  const output = {
    version: data.version,
    generatedAt: new Date().toISOString(),
    items,
  };

  console.log(`Writing ${items.length} items to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log('Done!');
}

main().catch(console.error);
