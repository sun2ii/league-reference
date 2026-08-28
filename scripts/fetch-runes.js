#!/usr/bin/env node
/**
 * Fetches rune data from Data Dragon
 * Run with: node scripts/fetch-runes.js
 */

const fs = require('fs');
const path = require('path');

const DDRAGON_VERSION = '14.24.1';
const RUNES_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/runesReforged.json`;
const OUTPUT_PATH = path.join(__dirname, '../public/data/runes.json');

async function main() {
  console.log('Fetching runes from Data Dragon...');
  const res = await fetch(RUNES_URL);
  const data = await res.json();

  // Transform runes into a cleaner format
  const trees = data.map(tree => ({
    id: tree.id,
    key: tree.key,
    name: tree.name,
    icon: `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`,
    slots: tree.slots.map((slot, slotIndex) => ({
      slotIndex,
      isKeystone: slotIndex === 0,
      runes: slot.runes.map(rune => ({
        id: rune.id,
        key: rune.key,
        name: rune.name,
        shortDesc: rune.shortDesc,
        longDesc: rune.longDesc,
        icon: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`,
      })),
    })),
  }));

  const output = {
    version: DDRAGON_VERSION,
    generatedAt: new Date().toISOString(),
    trees,
  };

  console.log(`Writing ${trees.length} rune trees to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log('Done!');
}

main().catch(console.error);
