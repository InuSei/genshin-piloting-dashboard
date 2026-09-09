// src/data/priceStorage.ts
//
// Persistence layer for admin-edited prices. Stored in the browser's
// localStorage so edits survive page reloads without needing a backend.
// Export/Import let you back up your prices to a file or move them to
// another device/browser.

export interface StoredPrice {
  php: number;
  usd: number;
}

export interface PriceOverrides {
  // basePrice overrides for plain checkbox/quantity services, keyed by service.id
  serviceBase: Record<string, number>;
  // price overrides for nested-list items, keyed by item.id
  nestedItems: Record<string, StoredPrice>;
  // rate overrides for exploration regions, keyed by region.id
  explorationRegions: Record<
    string,
    { perAreaPrice: StoredPrice; pricePerPct: StoredPrice }
  >;
}

const STORAGE_KEY = "suino_price_overrides_v1";

function emptyOverrides(): PriceOverrides {
  return { serviceBase: {}, nestedItems: {}, explorationRegions: {} };
}

export function loadOverrides(): PriceOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyOverrides();
    const parsed = JSON.parse(raw);
    return {
      serviceBase: parsed.serviceBase ?? {},
      nestedItems: parsed.nestedItems ?? {},
      explorationRegions: parsed.explorationRegions ?? {},
    };
  } catch {
    return emptyOverrides();
  }
}

export function saveOverrides(overrides: PriceOverrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function clearOverrides(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportOverridesAsFile(overrides: PriceOverrides): void {
  const blob = new Blob([JSON.stringify(overrides, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `suino-price-overrides-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedOverrides(json: string): PriceOverrides | null {
  try {
    const parsed = JSON.parse(json);
    return {
      serviceBase: parsed.serviceBase ?? {},
      nestedItems: parsed.nestedItems ?? {},
      explorationRegions: parsed.explorationRegions ?? {},
    };
  } catch {
    return null;
  }
}
