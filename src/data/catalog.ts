// src/data/catalog.ts
//
// The full editable catalog (tabs → service cards → sections → items, plus
// Genshin exploration regions) that the admin saves to the server.
// Shared by the browser and api/prices.ts, so it must not import anything at
// runtime (Vercel's ESM loader needs .js on relative imports).

export const CATALOG_SCHEMA_VERSION = 3;

export type CatalogGame = "genshin" | "hsr";

export interface CatalogPrice {
  php: number;
  usd: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: CatalogPrice;
  isQuantity?: boolean;
  isBundle?: boolean;
  max?: number;
}

export interface CatalogGroup {
  name: string;
  items: CatalogItem[];
}

export interface CatalogService {
  id: string;
  type: "nested-list";
  name: string;
  description: string;
  basePrice: number;
  tag?: string;
  groups: CatalogGroup[];
}

export interface CatalogCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  services: CatalogService[];
}

export interface CatalogSubArea {
  id: string;
  name: string;
  pricePerPct: CatalogPrice;
}

export interface CatalogRegion {
  id: string;
  name: string;
  tag: string;
  subAreas: CatalogSubArea[];
  bundlePrice?: CatalogPrice;
}

export interface Catalog {
  schemaVersion: typeof CATALOG_SCHEMA_VERSION;
  game: CatalogGame;
  categories: CatalogCategory[];
  regions: CatalogRegion[];
  primoResourceRates: Record<string, CatalogPrice>;
}

export type CatalogResult = { ok: true; catalog: Catalog } | { ok: false; error: string };

// Top-level tabs are fixed in code; the admin edits what's inside them.
export const CATALOG_TAB_IDS: Record<CatalogGame, string[]> = {
  genshin: ["maintenance", "exploration", "quests", "character", "others"],
  hsr: ["maintenance", "exploration", "quests", "endgame", "memoir"],
};

// Items the calculator's code depends on: names and prices are editable,
// but they can't be deleted or change behaviour.
export const PRIMO_ITEM_IDS = ["hunt_primo_10", "hunt_primo_20", "hunt_primo_30", "hunt_primo_40", "hunt_primo_50"];
const BUNDLE_ITEM_IDS: Record<CatalogGame, string[]> = {
  genshin: ["tc_spring_bundle", "tc_canopy_bundle", "tc_echoes_bundle", "tc_feather_bundle", "tc_nightwind_bundle"],
  hsr: [],
};
export const PROTECTED_ITEM_IDS: Record<CatalogGame, Set<string>> = {
  genshin: new Set([...PRIMO_ITEM_IDS, ...BUNDLE_ITEM_IDS.genshin]),
  hsr: new Set(BUNDLE_ITEM_IDS.hsr),
};
const PRIMO_RATE_KEYS = ["mid", "high"];

export const LIMITS = {
  name: 120,
  description: 300,
  tag: 40,
  emoji: 8,
  items: 3000,
  regions: 100,
  json: 400_000,
  max: 9999,
};

// a-z, 0-9, _ and -; no "__" (exploration keys are region__area) and none of
// the prefixes the receipt code reserves for its own line items.
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
export function isValidCatalogId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    ID_PATTERN.test(id) &&
    !id.includes("__") &&
    !id.startsWith("compass_") &&
    !id.startsWith("exploration_bundle")
  );
}

// Random ids: never derived from names, so renaming never changes them.
export function makeCatalogId(prefix: string, taken: Set<string>): string {
  for (;;) {
    const id = `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
    if (isValidCatalogId(id) && !taken.has(id)) {
      taken.add(id);
      return id;
    }
  }
}

export function collectCatalogIds(catalog: Pick<Catalog, "categories" | "regions">): Set<string> {
  const ids = new Set<string>();
  for (const c of catalog.categories) {
    ids.add(c.id);
    for (const s of c.services) {
      ids.add(s.id);
      for (const g of s.groups) for (const i of g.items) ids.add(i.id);
    }
  }
  for (const r of catalog.regions) {
    ids.add(r.id);
    for (const a of r.subAreas) ids.add(a.id);
  }
  return ids;
}

class CatalogError extends Error {}

function fail(message: string): never {
  throw new CatalogError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number, where: string, { required = true } = {}): string {
  if (value === undefined && !required) return "";
  if (typeof value !== "string") fail(`${where} must be text`);
  const trimmed = value.trim();
  if (required && !trimmed) fail(`${where} is empty`);
  if (trimmed.length > max) fail(`${where} is longer than ${max} characters`);
  return trimmed;
}

function amount(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(`${where} must be a number ≥ 0`);
  return value;
}

function price(value: unknown, where: string): CatalogPrice {
  if (!isRecord(value)) fail(`${where} is missing`);
  return { php: amount(value.php, `${where} (₱)`), usd: amount(value.usd, `${where} ($)`) };
}

function array(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) fail(`${where} must be a list`);
  return value;
}

function id(value: unknown, where: string): string {
  if (!isValidCatalogId(value)) fail(`${where} has an invalid id`);
  return value;
}

function parseItem(value: unknown, where: string, game: CatalogGame): CatalogItem {
  if (!isRecord(value)) fail(`${where} is malformed`);
  const itemId = id(value.id, where);
  const name = text(value.name, LIMITS.name, `${where} name`);
  const at = `${where} “${name}”`;
  const item: CatalogItem = { id: itemId, name, price: price(value.price, `${at} price`) };

  if (value.isQuantity !== undefined && typeof value.isQuantity !== "boolean") fail(`${at} quantity flag is invalid`);
  if (value.isBundle !== undefined && typeof value.isBundle !== "boolean") fail(`${at} bundle flag is invalid`);
  if (value.isQuantity) item.isQuantity = true;
  if (value.isBundle) item.isBundle = true;
  if (value.max !== undefined) {
    if (!Number.isInteger(value.max) || (value.max as number) < 1 || (value.max as number) > LIMITS.max) {
      fail(`${at} max must be a whole number from 1 to ${LIMITS.max}`);
    }
    item.max = value.max as number;
  }

  const isBundleId = BUNDLE_ITEM_IDS[game].includes(itemId);
  if (item.isBundle !== (isBundleId || undefined)) fail(`${at} can't change its bundle setting`);
  if (PRIMO_ITEM_IDS.includes(itemId) && item.isQuantity) fail(`${at} must stay a checkbox`);
  return item;
}

function parseService(value: unknown, where: string, game: CatalogGame): CatalogService {
  if (!isRecord(value)) fail(`${where} is malformed`);
  if (value.type !== "nested-list") fail(`${where} has an unsupported type`);
  const name = text(value.name, LIMITS.name, `${where} name`);
  const at = `${where} › ${name}`;
  const service: CatalogService = {
    id: id(value.id, at),
    type: "nested-list",
    name,
    description: text(value.description, LIMITS.description, `${at} description`, { required: false }),
    basePrice: 0,
    groups: array(value.groups, `${at} sections`).map((g, gi) => {
      if (!isRecord(g)) fail(`${at} section ${gi + 1} is malformed`);
      const groupName = text(g.name, LIMITS.name, `${at} section ${gi + 1} name`);
      const groupAt = `${at} › ${groupName}`;
      return {
        name: groupName,
        items: array(g.items, `${groupAt} items`).map((it, ii) => parseItem(it, `${groupAt} item ${ii + 1}`, game)),
      };
    }),
  };
  const tag = text(value.tag, LIMITS.tag, `${at} tag`, { required: false });
  if (tag) service.tag = tag;
  return service;
}

function parseRegion(value: unknown, where: string): CatalogRegion {
  if (!isRecord(value)) fail(`${where} is malformed`);
  const name = text(value.name, LIMITS.name, `${where} name`);
  const at = `Region “${name}”`;
  const region: CatalogRegion = {
    id: id(value.id, at),
    name,
    tag: text(value.tag, LIMITS.tag, `${at} tag`, { required: false }),
    subAreas: array(value.subAreas, `${at} sub-areas`).map((a, ai) => {
      if (!isRecord(a)) fail(`${at} sub-area ${ai + 1} is malformed`);
      const areaName = text(a.name, LIMITS.name, `${at} sub-area ${ai + 1} name`);
      return {
        id: id(a.id, `${at} sub-area “${areaName}”`),
        name: areaName,
        pricePerPct: price(a.pricePerPct, `${at} sub-area “${areaName}” rate`),
      };
    }),
  };
  if (value.bundlePrice !== undefined) region.bundlePrice = price(value.bundlePrice, `${at} bundle price`);
  const areaIds = new Set<string>();
  for (const area of region.subAreas) {
    if (areaIds.has(area.id)) fail(`${at} has two sub-areas with the same id`);
    areaIds.add(area.id);
  }
  return region;
}

function parseCatalog(value: unknown, game: CatalogGame): Catalog {
  if (!isRecord(value)) fail("Catalog is malformed");
  if (value.schemaVersion !== CATALOG_SCHEMA_VERSION) fail("Catalog has an unsupported version");
  if (value.game !== game) fail(`Catalog is for a different game (${String(value.game)})`);
  if (JSON.stringify(value).length > LIMITS.json) fail("Catalog is too large");

  const tabIds = CATALOG_TAB_IDS[game];
  const rawCategories = array(value.categories, "Tabs");
  if (rawCategories.length !== tabIds.length) fail("Tabs can't be added or removed");

  const categories = rawCategories.map((c, ci): CatalogCategory => {
    if (!isRecord(c)) fail(`Tab ${ci + 1} is malformed`);
    if (c.id !== tabIds[ci]) fail("Tabs can't be renamed, added, removed or reordered");
    const label = text(c.label, LIMITS.name, `Tab ${ci + 1} label`);
    return {
      id: tabIds[ci],
      label,
      emoji: text(c.emoji, LIMITS.emoji, `${label} emoji`, { required: false }),
      description: text(c.description, LIMITS.description, `${label} description`, { required: false }),
      services: array(c.services, `${label} services`).map((s, si) => parseService(s, `${label} card ${si + 1}`, game)),
    };
  });

  // Genshin's exploration tab is drawn by the % calculator, not service cards.
  if (game === "genshin" && categories[1].services.length > 0) fail("World Exploration can't have service cards");

  const regions = array(value.regions ?? [], "Regions").map((r, ri) => parseRegion(r, `Region ${ri + 1}`));
  if (game === "hsr" && regions.length > 0) fail("Star Rail has no exploration regions");
  if (regions.length > LIMITS.regions) fail(`At most ${LIMITS.regions} regions`);

  const primoResourceRates: Record<string, CatalogPrice> = {};
  const rawRates = value.primoResourceRates ?? {};
  if (!isRecord(rawRates)) fail("Primo resource rates are malformed");
  for (const [key, rate] of Object.entries(rawRates)) {
    if (game !== "genshin" || !PRIMO_RATE_KEYS.includes(key)) fail(`Unknown resource rate “${key}”`);
    primoResourceRates[key] = price(rate, `${key} resource rate`);
  }

  // Ids must be unique across tabs, cards and items (orders are keyed by id).
  const seen = new Set<string>();
  let itemCount = 0;
  for (const c of categories) {
    for (const s of c.services) {
      for (const itemOrService of [s, ...s.groups.flatMap((g) => g.items)]) {
        if (seen.has(itemOrService.id) || tabIds.includes(itemOrService.id)) fail(`Duplicate id “${itemOrService.id}” (“${itemOrService.name}”)`);
        seen.add(itemOrService.id);
      }
      itemCount += s.groups.reduce((n, g) => n + g.items.length, 0);
    }
  }
  if (itemCount > LIMITS.items) fail(`At most ${LIMITS.items} items`);
  const regionIds = new Set<string>();
  for (const r of regions) {
    if (regionIds.has(r.id)) fail(`Duplicate region id “${r.id}”`);
    regionIds.add(r.id);
  }

  for (const protectedId of PROTECTED_ITEM_IDS[game]) {
    if (!seen.has(protectedId)) fail(`Protected item “${protectedId}” can't be removed`);
  }

  return { schemaVersion: CATALOG_SCHEMA_VERSION, game, categories, regions, primoResourceRates };
}

// Validates untrusted input and returns a clean copy with only known fields.
export function normalizeCatalog(value: unknown, game: CatalogGame): CatalogResult {
  try {
    return { ok: true, catalog: parseCatalog(value, game) };
  } catch (error) {
    if (error instanceof CatalogError) return { ok: false, error: error.message };
    throw error;
  }
}
