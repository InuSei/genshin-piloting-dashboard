// src/data/priceStorage.ts
//
// Persistence layer for admin-edited prices. Stored in the browser's
// localStorage so edits survive page reloads without needing a backend.
// Export/Import let you back up your prices to a file or move them to
// another device/browser.
//
// Each game keeps its own override set under its own storage key so the
// Genshin and Star Rail editors never clobber each other.

export interface StoredPrice {
  php: number;
  usd: number;
}

export interface PriceOverrides {
  // basePrice overrides for plain checkbox/quantity services, keyed by service.id
  serviceBase: Record<string, number>;
  // price overrides for nested-list items, keyed by item.id
  nestedItems: Record<string, StoredPrice>;
  // per-1% rate overrides for exploration sub-areas, keyed by `${regionId}__${areaId}`
  explorationAreas: Record<string, StoredPrice>;
}

export const GENSHIN_STORAGE_KEY = "suino_price_overrides_v2";
export const HSR_STORAGE_KEY = "suino_price_overrides_hsr";

function emptyOverrides(): PriceOverrides {
  return { serviceBase: {}, nestedItems: {}, explorationAreas: {} };
}

export function loadOverrides(storageKey: string = GENSHIN_STORAGE_KEY): PriceOverrides {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw);
    return {
      serviceBase: parsed.serviceBase ?? {},
      nestedItems: parsed.nestedItems ?? {},
      explorationAreas: parsed.explorationAreas ?? {},
    };
  } catch {
    return emptyOverrides();
  }
}

export function saveOverrides(overrides: PriceOverrides, storageKey: string = GENSHIN_STORAGE_KEY): void {
  localStorage.setItem(storageKey, JSON.stringify(overrides));
}

export function clearOverrides(storageKey: string = GENSHIN_STORAGE_KEY): void {
  localStorage.removeItem(storageKey);
}

export function exportOverridesAsFile(overrides: PriceOverrides, prefix = "suino"): void {
  const blob = new Blob([JSON.stringify(overrides, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-price-overrides-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedOverrides(json: string): PriceOverrides | null {
  try {
    const parsed = JSON.parse(json);
    return {
      serviceBase: parsed.serviceBase ?? {},
      nestedItems: parsed.nestedItems ?? {},
      explorationAreas: parsed.explorationAreas ?? {},
    };
  } catch {
    return null;
  }
}