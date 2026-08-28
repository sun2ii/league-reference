#!/usr/bin/env node
/**
 * Updates champions.json with latest data from Meraki Analytics
 * Run with: node scripts/update-champions.js
 *
 * This fetches position data (TOP, JUNGLE, MID, etc.) and merges it
 * into the existing champions.json file.
 */

const fs = require('fs');
const path = require('path');

const MERAKI_URL = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json';
const CHAMPIONS_PATH = path.join(__dirname, '../public/data/champions.json');

async function main() {
  console.log('Fetching Meraki data...');
  const res = await fetch(MERAKI_URL);
  const merakiData = await res.json();

  console.log('Reading current champions.json...');
  const championsFile = JSON.parse(fs.readFileSync(CHAMPIONS_PATH, 'utf-8'));

  console.log('Merging position data...');
  let updated = 0;
  let notFound = [];

  for (const champion of championsFile.champions) {
    const meraki = merakiData[champion.id];

    if (meraki) {
      // Add positions from Meraki
      champion.positions = meraki.positions || [];
      // Update roles with more detailed Meraki roles
      champion.roles = meraki.roles || champion.roles;
      updated++;
    } else {
      notFound.push(champion.id);
    }

    // Remove vsMasterYi field
    delete champion.vsMasterYi;
  }

  console.log(`Updated ${updated} champions`);
  if (notFound.length > 0) {
    console.log(`Not found in Meraki: ${notFound.join(', ')}`);
  }

  console.log('Writing updated champions.json...');
  fs.writeFileSync(CHAMPIONS_PATH, JSON.stringify(championsFile, null, 2));

  console.log('Done!');
}

main().catch(console.error);
