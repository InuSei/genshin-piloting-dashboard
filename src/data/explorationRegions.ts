export const UNSELECTED = -1;
import { loadOverrides, type PriceOverrides } from "./priceStorage";

// Define exact pairs for absolute pricing control
export interface PriceData {
  php: number;
  usd: number;
}

// Each sub-area carries its own per-1% rate (PHP + USD), matching the
// "Exploration Calculator" workbook. Price = missing % x the area's rate.
export interface SubArea {
  id: string;
  name: string;
  pricePerPct: PriceData;
}

export interface ExplorationRegion {
  id: string;
  name: string;
  tag: string;
  subAreas: SubArea[];
}

export type ExplorationSelections = Record<string, number>;
export type ExplorationBundles = Record<string, boolean>;
export type ExplorationCurrency = keyof PriceData;

// Rates sourced from "Exploration Calc (PHP)" / "Exploration Calc (USD)".
// Natlan & Nod-Krai USD = PHP / 60 (the workbook only stored PHP values there).
export const EXPLORATION_REGIONS: ExplorationRegion[] = [
  {
    id: "mondstadt",
    name: "Mondstadt",
    tag: "Patch 1.0",
    subAreas: [
      { id: "brightcrown-mountain", name: "Brightcrown Mountain", pricePerPct: { php: 2.45, usd: 0.039 } },
      { id: "galesong-hill", name: "Galesong Hill", pricePerPct: { php: 1.5, usd: 0.024 } },
      { id: "starfell-valley", name: "Starfell Valley", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "windwail-highland", name: "Windwail Highland", pricePerPct: { php: 1.5, usd: 0.024 } },
    ],
  },
  {
    id: "liyue",
    name: "Liyue",
    tag: "Patch 1.0",
    subAreas: [
      { id: "bishui-plain", name: "Bishui Plain", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "lisha", name: "Lisha", pricePerPct: { php: 2, usd: 0.032 } },
      { id: "minlin", name: "Minlin", pricePerPct: { php: 3, usd: 0.048 } },
      { id: "qiongji-estuary", name: "Qiongji Estuary", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "sea-of-clouds", name: "Sea of Clouds", pricePerPct: { php: 2.5, usd: 0.04 } },
    ],
  },
  {
    id: "inazuma",
    name: "Inazuma",
    tag: "Patch 2.0",
    subAreas: [
      { id: "narukami", name: "Narukami Island", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "kannazuka", name: "Kannazuka", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "yashiori", name: "Yashiori Island", pricePerPct: { php: 2, usd: 0.03 } },
      { id: "watatsumi", name: "Watatsumi Island", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "seirai", name: "Seirai Island", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "tsurumi", name: "Tsurumi Island", pricePerPct: { php: 3, usd: 0.05 } },
    ],
  },
  {
    id: "sumeru-forest",
    name: "Sumeru Forest",
    tag: "Patch 3.0",
    subAreas: [
      { id: "vanarana", name: "Vanarana", pricePerPct: { php: 2, usd: 0.03 } },
      { id: "avidya-forest", name: "Avidya Forest", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "lokapala-jungle", name: "Lokapala Jungle", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "ardravi-valley", name: "Ardravi Valley", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "ashavan-realm", name: "Ashavan Realm", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "vissudha-field", name: "Vissudha Field", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "lost-nursery", name: "Lost Nursery", pricePerPct: { php: 1.5, usd: 0.02 } },
    ],
  },
  {
    id: "sumeru-desert",
    name: "Sumeru Desert",
    tag: "Patch 3.1+",
    subAreas: [
      { id: "lower-setekh", name: "Land of Lower Setekh", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "upper-setekh", name: "Land of Upper Setekh", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "hypostyle-desert", name: "Hypostyle Desert", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "hadramaveth", name: "Desert of Hadramaveth", pricePerPct: { php: 5.5, usd: 0.09 } },
      { id: "gavireh-lajavard", name: "Gavireh Lajavard", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "realm-of-farakhkert", name: "Realm of Farakhkert", pricePerPct: { php: 3, usd: 0.05 } },
    ],
  },
  {
    id: "fontaine",
    name: "Fontaine",
    tag: "Patch 4.0",
    subAreas: [
      { id: "court-fontaine", name: "Court of Fontaine", pricePerPct: { php: 3.5, usd: 0.04 } },
      { id: "beryl", name: "Beryl Region", pricePerPct: { php: 3, usd: 0.06 } },
      { id: "belleau", name: "Belleau Region", pricePerPct: { php: 2, usd: 0.05 } },
      { id: "liffey", name: "Liffey Region", pricePerPct: { php: 2.5, usd: 0.06 } },
      { id: "morte", name: "Morte Region", pricePerPct: { php: 3.5, usd: 0.02 } },
      { id: "erinnyes", name: "Erinnyes Forest", pricePerPct: { php: 3, usd: 0.03 } },
      { id: "nostoi", name: "Nostoi Region", pricePerPct: { php: 1, usd: 0.05 } },
      { id: "frik", name: "F.R.I.K. Energy Engineering", pricePerPct: { php: 3.5, usd: 0.06 } },
    ],
  },
  {
    id: "natlan",
    name: "Natlan",
    tag: "Patch 5.0",
    subAreas: [
      { id: "tequemecan-valley", name: "Tequemecan Valley", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "coatepec-mountain", name: "Coatepec Mountain", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "toyac-springs", name: "Toyac Springs", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "basin-unnumbered-flames", name: "Basin of Unnumbered Flames", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "tezcatepetonco-range", name: "Tezcatepetonco Range", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "quahuacan-cliff", name: "Quahuacan Cliff", pricePerPct: { php: 2, usd: 0.03 } },
      { id: "ochkanatlan", name: "Ochkanatlan", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "atocpan", name: "Atocpan", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "easybreeze-resort", name: "Easybreeze Holiday Resort", pricePerPct: { php: 4.5, usd: 0.08 } },
    ],
  },
  {
    id: "nod-krai",
    name: "Nod-Krai",
    tag: "Patch 6.0",
    subAreas: [
      { id: "lempo-isle", name: "Lempo Isle", pricePerPct: { php: 5, usd: 0.08 } },
      { id: "hiisi-island", name: "Hiisi Island", pricePerPct: { php: 3, usd: 0.05 } },
      { id: "paha-isle", name: "Paha Isle", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "voidsea-outlook", name: "Voidsea Outlook", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "wavechaser-plain", name: "Wavechaser Plain", pricePerPct: { php: 3.5, usd: 0.06 } },
      { id: "ashveil-peak", name: "Ashveil Peak", pricePerPct: { php: 3, usd: 0.05 } },
    ],
  },
  {
    id: "snezhnaya",
    name: "Snezhnaya",
    tag: "Patch 7.0",
    subAreas: [
      { id: "flamefeather-valley", name: "Flamefeather Valley", pricePerPct: { php: 4, usd: 0.065 } },
      { id: "volkodlak-tundra", name: "Volkodlak Tundra", pricePerPct: { php: 5.5, usd: 0.089 } },
      { id: "fellfrost-peak", name: "Fellfrost Peak", pricePerPct: { php: 3.5, usd: 0.057 } },
      { id: "everfrozen-earth", name: "Everfrozen Earth", pricePerPct: { php: 5.5, usd: 0.089 } },
      { id: "white-birch-snowgrave", name: "White Birch Snowgrave", pricePerPct: { php: 3.5, usd: 0.057 } },
    ],
  },
  {
    id: "chenyu",
    name: "Chenyu Vale",
    tag: "Expansions",
    subAreas: [
      { id: "upper-vale", name: "Chenyu Vale: Upper Vale", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "southern", name: "Chenyu Vale: Southern Mt.", pricePerPct: { php: 2.5, usd: 0.04 } },
      { id: "laixin", name: "Mt. Laixin Exploration", pricePerPct: { php: 1, usd: 0.016 } },
    ],
  },
  {
    id: "chasm",
    name: "The Chasm",
    tag: "Expansions",
    subAreas: [
      { id: "surface", name: "The Chasm (Surface)", pricePerPct: { php: 4, usd: 0.06 } },
      { id: "underground", name: "The Chasm: Mining Underground", pricePerPct: { php: 4, usd: 0.06 } },
    ],
  },
  {
    id: "dragonspine",
    name: "Dragonspine",
    tag: "Expansions",
    subAreas: [
      { id: "dragonspine", name: "Dragonspine", pricePerPct: { php: 5, usd: 0.08 } },
    ],
  },
  {
    id: "windrest",
    name: "Windrest Peak",
    tag: "Expansions",
    subAreas: [
      { id: "windrest-peak", name: "Windrest Peak", pricePerPct: { php: 5.02, usd: 0.08 } },
    ],
  },
  {
    id: "temple",
    name: "Temple of Space",
    tag: "Expansions",
    subAreas: [
      { id: "temple-of-space", name: "Temple of Space", pricePerPct: { php: 10, usd: 0.15 } },
    ],
  },
  {
    id: "enkanomiya",
    name: "Enkanomiya",
    tag: "Expansions",
    subAreas: [
      { id: "enkanomiya", name: "Enkanomiya", pricePerPct: { php: 6.9, usd: 0.11 } },
    ],
  },
  {
    id: "ancient",
    name: "Ancient Sacred Mountain",
    tag: "Expansions",
    subAreas: [
      { id: "ancient-sacred-mountain", name: "Ancient Sacred Mountain", pricePerPct: { php: 8.78, usd: 0.14 } },
    ],
  },
  {
    id: "bygone-era",
    name: "Sea of Bygone Eras",
    tag: "Expansions",
    subAreas: [
      { id: "sea-of-bygone-eras", name: "Sea of Bygone Eras", pricePerPct: { php: 3.5, usd: 0.07 } },
    ],
  },
  {
    id: "frostmoon",
    name: "Frost Moon",
    tag: "Expansions",
    subAreas: [
      { id: "lunar-highlands", name: "Lunar Highlands", pricePerPct: { php: 6, usd: 0.1 } },
      { id: "moontide-sea", name: "Moontide Sea", pricePerPct: { php: 4, usd: 0.06 } },
      { id: "darkside-of-the-moon", name: "Darkside of the Moon", pricePerPct: { php: 2.5, usd: 0.04 } },
    ],
  },
];

export function findArea(regionId: string, areaId: string): SubArea | undefined {
  const region = EXPLORATION_REGIONS.find((r) => r.id === regionId);
  return region?.subAreas.find((sa) => sa.id === areaId);
}

export function isBillableProgress(currentProgress: number): boolean {
  return currentProgress >= 0 && currentProgress < 100;
}

export function calculateAreaPrice(area: SubArea, currentProgress: number): PriceData {
  if (!isBillableProgress(currentProgress)) {
    return { php: 0, usd: 0 };
  }

  const missingPct = Math.max(0, 100 - currentProgress);
  return {
    php: Math.round(area.pricePerPct.php * missingPct * 100) / 100,
    usd: Math.round(area.pricePerPct.usd * missingPct * 100) / 100,
  };
}

export function getRegionRate(region: ExplorationRegion, currency: ExplorationCurrency): number {
  const total = region.subAreas.reduce((sum, area) => sum + area.pricePerPct[currency], 0);
  return Math.round(total * 1000000) / 1000000;
}

export function getRegionBundlePrice(region: ExplorationRegion): PriceData {
  return region.subAreas.reduce((sum, area) => {
    const price = calculateAreaPrice(area, 0);
    return {
      php: Math.round((sum.php + price.php) * 100) / 100,
      usd: Math.round((sum.usd + price.usd) * 100) / 100,
    };
  }, { php: 0, usd: 0 });
}

export function regionTotal(
  region: ExplorationRegion,
  selections: ExplorationSelections,
  bundledRegions: ExplorationBundles = {}
): PriceData {
  if (bundledRegions[region.id]) return getRegionBundlePrice(region);

  return region.subAreas.reduce((sum, sa) => {
    const currentProgress = selections[`${region.id}__${sa.id}`] ?? UNSELECTED;
    const price = calculateAreaPrice(sa, currentProgress);
    return {
      php: sum.php + price.php,
      usd: sum.usd + price.usd
    };
  }, { php: 0, usd: 0 });
}

export function regionHasSelection(
  region: ExplorationRegion,
  selections: ExplorationSelections,
  bundledRegions: ExplorationBundles = {}
): boolean {
  if (bundledRegions[region.id]) return true;
  return region.subAreas.some((area) =>
    isBillableProgress(selections[`${region.id}__${area.id}`] ?? UNSELECTED)
  );
}

export function regionAvgPct(
  region: ExplorationRegion,
  selections: ExplorationSelections
): number {
  let totalEntered = 0;
  let count = 0;
  for (const sa of region.subAreas) {
    const progress = selections[`${region.id}__${sa.id}`] ?? UNSELECTED;
    if (progress !== UNSELECTED) {
      totalEntered += progress;
      count++;
    }
  }
  return count === 0 ? 0 : Math.round(totalEntered / count);
}

export interface ReceiptLineItem {
  id: string;
  categoryLabel: string;
  name: string;
  detail: string;
  price: PriceData;
}

export function buildExplorationReceiptItems(
  selections: ExplorationSelections,
  bundledRegions: ExplorationBundles = {}
): ReceiptLineItem[] {
  const items: ReceiptLineItem[] = [];

  for (const region of EXPLORATION_REGIONS) {
    if (bundledRegions[region.id]) {
      const price = getRegionBundlePrice(region);
      if (price.php <= 0 && price.usd <= 0) continue;

      items.push({
        id: `exploration_bundle__${region.id}`,
        categoryLabel: `World Exploration — ${region.name}`,
        name: `${region.name} Full Region Bundle`,
        detail: `100% of all ${region.subAreas.length} sub-area${region.subAreas.length !== 1 ? "s" : ""}`,
        price,
      });
      continue;
    }

    for (const sa of region.subAreas) {
      const currentProgress = selections[`${region.id}__${sa.id}`] ?? UNSELECTED;
      if (!isBillableProgress(currentProgress)) continue;

      const price = calculateAreaPrice(sa, currentProgress);
      if (price.php <= 0 && price.usd <= 0) continue;

      items.push({
        id: `${region.id}__${sa.id}`,
        categoryLabel: `World Exploration — ${region.name}`,
        name: sa.name,
        detail: `${currentProgress}% → 100% · ₱${sa.pricePerPct.php}/1%`,
        price,
      });
    }
  }

  return items;
}

const DEFAULT_EXPLORATION_REGIONS: ExplorationRegion[] = JSON.parse(JSON.stringify(EXPLORATION_REGIONS));

export function applyExplorationPriceOverrides(overrides: PriceOverrides): void {
  for (const region of EXPLORATION_REGIONS) {
    for (const sa of region.subAreas) {
      const override = overrides.explorationAreas[`${region.id}__${sa.id}`];
      if (override) sa.pricePerPct = { ...override };
    }
  }
}

export function restoreExplorationDefaults(): void {
  const defaultsById = new Map(DEFAULT_EXPLORATION_REGIONS.map((r) => [r.id, r]));
  for (const region of EXPLORATION_REGIONS) {
    const d = defaultsById.get(region.id);
    if (!d) continue;
    region.subAreas = d.subAreas.map((sa) => ({ ...sa, pricePerPct: { ...sa.pricePerPct } }));
  }
}

applyExplorationPriceOverrides(loadOverrides());