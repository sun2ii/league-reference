#!/usr/bin/env node

/**
 * Fetches champion data from Riot's Data Dragon and transforms it
 * into a normalized JSON file for the frontend.
 *
 * Usage: node scripts/fetch-champions.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://ddragon.leagueoflegends.com';

async function getLatestVersion() {
  const res = await fetch(`${BASE_URL}/api/versions.json`);
  const versions = await res.json();
  return versions[0];
}

async function getChampionList(version) {
  const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion.json`);
  const data = await res.json();
  return Object.keys(data.data);
}

async function getChampionDetail(version, championId) {
  const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`);
  const data = await res.json();
  return data.data[championId];
}

function stripHtmlTags(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function transformChampion(raw, version) {
  const spells = raw.spells;

  return {
    id: raw.id,
    name: raw.name,
    title: raw.title,
    roles: raw.tags,
    image: `${BASE_URL}/cdn/${version}/img/champion/${raw.image.full}`,

    passive: {
      name: raw.passive.name,
      description: stripHtmlTags(raw.passive.description),
      image: `${BASE_URL}/cdn/${version}/img/passive/${raw.passive.image.full}`
    },

    abilities: {
      q: {
        name: spells[0].name,
        description: stripHtmlTags(spells[0].description),
        cooldown: spells[0].cooldown,
        image: `${BASE_URL}/cdn/${version}/img/spell/${spells[0].image.full}`
      },
      w: {
        name: spells[1].name,
        description: stripHtmlTags(spells[1].description),
        cooldown: spells[1].cooldown,
        image: `${BASE_URL}/cdn/${version}/img/spell/${spells[1].image.full}`
      },
      e: {
        name: spells[2].name,
        description: stripHtmlTags(spells[2].description),
        cooldown: spells[2].cooldown,
        image: `${BASE_URL}/cdn/${version}/img/spell/${spells[2].image.full}`
      },
      r: {
        name: spells[3].name,
        description: stripHtmlTags(spells[3].description),
        cooldown: spells[3].cooldown,
        image: `${BASE_URL}/cdn/${version}/img/spell/${spells[3].image.full}`
      }
    },

    vsMasterYi: {
      watch: null,
      reason: null
    }
  };
}

async function main() {
  console.log('Fetching latest Data Dragon version...');
  const version = await getLatestVersion();
  console.log(`Version: ${version}`);

  console.log('Fetching champion list...');
  const championIds = await getChampionList(version);
  console.log(`Found ${championIds.length} champions`);

  console.log('Fetching champion details...');
  const champions = [];

  for (let i = 0; i < championIds.length; i++) {
    const id = championIds[i];
    process.stdout.write(`\r  [${i + 1}/${championIds.length}] ${id}...`);

    const raw = await getChampionDetail(version, id);
    const transformed = transformChampion(raw, version);
    champions.push(transformed);
  }

  console.log('\nSorting champions alphabetically...');
  champions.sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    version,
    generatedAt: new Date().toISOString(),
    champions
  };

  const outPath = path.join(__dirname, '..', 'public', 'data', 'champions.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\nWrote ${champions.length} champions to ${outPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
