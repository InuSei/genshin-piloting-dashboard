export interface StoredPrice {
  php: number;
  usd: number;
}

export interface PriceOverrides {
  serviceBase: Record<string, number>;
  nestedItems: Record<string, StoredPrice>;
  explorationAreas: Record<string, StoredPrice>;
  explorationBundles: Record<string, StoredPrice>;
}

export type PriceGame = "genshin" | "hsr";

interface StoredOverridesFile extends PriceOverrides {
  schemaVersion: number;
  game: PriceGame;
}

export const GENSHIN_STORAGE_KEY = "suino_price_overrides_v2";
export const GENSHIN_LEGACY_STORAGE_KEY = "suino_price_overrides_v1";
export const HSR_STORAGE_KEY = "suino_price_overrides_hsr";

const SCHEMA_VERSION = 2;
const OVERRIDE_KEYS = new Set(["serviceBase", "nestedItems", "explorationAreas", "explorationBundles"]);
const FILE_KEYS = new Set([...OVERRIDE_KEYS, "schemaVersion", "game"]);
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const priceListeners = new Set<() => void>();
let priceRevision = 0;

function emptyOverrides(): PriceOverrides {
  return { serviceBase: {}, nestedItems: {}, explorationAreas: {}, explorationBundles: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidStoredPrice(value: unknown): value is StoredPrice {
  return isRecord(value) && isValidAmount(value.php) && isValidAmount(value.usd);
}

function parseNumberMap(value: unknown): Record<string, number> | null {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;

  const result: Record<string, number> = {};
  for (const [key, amount] of Object.entries(value)) {
    if (!key || UNSAFE_KEYS.has(key) || !isValidAmount(amount)) return null;
    result[key] = amount;
  }
  return result;
}

function parsePriceMap(value: unknown): Record<string, StoredPrice> | null {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;

  const result: Record<string, StoredPrice> = {};
  for (const [key, price] of Object.entries(value)) {
    if (!key || UNSAFE_KEYS.has(key) || !isValidStoredPrice(price)) return null;
    result[key] = { php: price.php, usd: price.usd };
  }
  return result;
}

function gameForStorageKey(storageKey: string): PriceGame {
  return storageKey === HSR_STORAGE_KEY ? "hsr" : "genshin";
}

function normalizeOverrides(value: unknown, storageKey: string): PriceOverrides | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !FILE_KEYS.has(key))) return null;
  if (value.schemaVersion !== undefined && value.schemaVersion !== SCHEMA_VERSION) return null;
  if (value.game !== undefined && value.game !== gameForStorageKey(storageKey)) return null;

  const serviceBase = parseNumberMap(value.serviceBase);
  const nestedItems = parsePriceMap(value.nestedItems);
  const explorationAreas = parsePriceMap(value.explorationAreas);
  const explorationBundles = parsePriceMap(value.explorationBundles);
  if (!serviceBase || !nestedItems || !explorationAreas || !explorationBundles) return null;

  return { serviceBase, nestedItems, explorationAreas, explorationBundles };
}

function storedFile(overrides: PriceOverrides, game: PriceGame): StoredOverridesFile {
  return {
    ...overrides,
    schemaVersion: SCHEMA_VERSION,
    game,
  };
}

export function loadOverrides(storageKey: string = GENSHIN_STORAGE_KEY): PriceOverrides {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptyOverrides();
    return normalizeOverrides(JSON.parse(raw), storageKey) ?? emptyOverrides();
  } catch {
    return emptyOverrides();
  }
}

export function saveOverrides(overrides: PriceOverrides, storageKey: string = GENSHIN_STORAGE_KEY): void {
  const normalized = normalizeOverrides(overrides, storageKey);
  if (!normalized) throw new Error("Invalid price overrides");
  localStorage.setItem(storageKey, JSON.stringify(storedFile(normalized, gameForStorageKey(storageKey))));
  notifyPriceOverridesChanged();
}

export function clearOverrides(storageKey: string = GENSHIN_STORAGE_KEY): void {
  localStorage.removeItem(storageKey);
  notifyPriceOverridesChanged();
}

export function exportOverridesAsFile(
  overrides: PriceOverrides,
  prefix = "suino",
  game: PriceGame = prefix.toLowerCase().includes("hsr") ? "hsr" : "genshin"
): void {
  const storageKey = game === "hsr" ? HSR_STORAGE_KEY : GENSHIN_STORAGE_KEY;
  const normalized = normalizeOverrides(overrides, storageKey);
  if (!normalized) throw new Error("Invalid price overrides");

  const blob = new Blob([JSON.stringify(storedFile(normalized, game), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-price-overrides-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedOverrides(
  json: string,
  storageKey: string = GENSHIN_STORAGE_KEY
): PriceOverrides | null {
  try {
    return normalizeOverrides(JSON.parse(json), storageKey);
  } catch {
    return null;
  }
}

export function getPriceRevision(): number {
  return priceRevision;
}

export function subscribeToPriceOverrides(listener: () => void): () => void {
  priceListeners.add(listener);
  return () => priceListeners.delete(listener);
}

export function notifyPriceOverridesChanged(): void {
  priceRevision += 1;
  for (const listener of priceListeners) listener();
}
