export interface Ability {
  name: string;
  description: string;
  cooldown: number[];
  image: string;
}

export interface Passive {
  name: string;
  description: string;
  image: string;
}

export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "SUPPORT";

export interface Champion {
  id: string;
  name: string;
  title: string;
  roles: string[];
  positions: Position[];
  image: string;
  passive: Passive;
  abilities: {
    q: Ability;
    w: Ability;
    e: Ability;
    r: Ability;
  };
}

export interface ChampionData {
  version: string;
  generatedAt: string;
  champions: Champion[];
}

// Items
export interface ItemGold {
  base: number;
  purchasable: boolean;
  total: number;
  sell: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  gold: ItemGold;
  tags: string[];
  stats: Record<string, number>;
  into: string[];
  from: string[];
  image: string;
}

export interface ItemData {
  version: string;
  generatedAt: string;
  items: Item[];
}

// Runes
export interface Rune {
  id: number;
  key: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
}

export interface RuneSlot {
  slotIndex: number;
  isKeystone: boolean;
  runes: Rune[];
}

export interface RuneTree {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: RuneSlot[];
}

export interface RuneData {
  version: string;
  generatedAt: string;
  trees: RuneTree[];
}
