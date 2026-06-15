export const UNSELECTED = -1;

// Define exact pairs for absolute pricing control
export interface PriceData {
  php: number;
  usd: number;
}

export interface SubArea {
  id: string;
  name: string;
}

export interface ExplorationRegion {
  id: string;
  name: string;
  tag: string;
  perAreaPrice: PriceData; // <-- ADD THIS: The exact flat price for 0%-40%
  pricePerPct: PriceData;  // The inflated rate for >40% 
  subAreas: SubArea[];
}

export type ExplorationSelections = Record<string, number>;

// The exact pricing from your screenshot
export const EXPLORATION_REGIONS: ExplorationRegion[] = [
  {
    id: "mondstadt",
    name: "Mondstadt",
    tag: "Patch 1.0",
    perAreaPrice: { php: 130, usd: 2.25 },
    pricePerPct: { php: 2, usd: 0.04 }, 
    subAreas: [
      { id: "brightcrown-mountain", name: "Brightcrown Mountain" },
      { id: "starfell-valley", name: "Starfell Valley" },
      { id: "windwail-highland", name: "Windwail Highland" },
      { id: "galesong-hill", name: "Galesong Hill" },
    ],
  },
  {
    id: "liyue",
    name: "Liyue",
    tag: "Patch 1.0",
    perAreaPrice: { php: 220, usd: 3.75 },
    pricePerPct: { php: 2, usd: 0.04 },
    subAreas: [
      { id: "bishui-plain", name: "Bishui Plain" },
      { id: "minlin", name: "Minlin" },
      { id: "lisha", name: "Lisha" },
      { id: "sea-of-clouds", name: "Sea of Clouds" },
      { id: "qiongji-estuary", name: "Qiongji Estuary" },
    ],
  },
  {
    id: "inazuma",
    name: "Inazuma",
    tag: "Patch 2.0",
    perAreaPrice: { php: 300, usd: 5 },
    pricePerPct: { php: 4, usd: 0.07 },
    subAreas: [
      { id: "narukami", name: "Narukami Island" },
      { id: "kannazuka", name: "Kannazuka" },
      { id: "yashiori", name: "Yashiori Island" },
      { id: "watatsumi", name: "Watatsumi Island" },
      { id: "seirai", name: "Seirai Island" },
      { id: "tsurumi", name: "Tsurumi Island" },
    ],
  },
  {
    id: "sumeru-forest",
    name: "Sumeru Forest",
    tag: "Patch 3.0",
    perAreaPrice: { php: 240, usd: 4 },
    pricePerPct: { php: 3, usd: 0.05 },
    subAreas: [
      { id: "avidya-forest", name: "Avidya Forest" },
      { id: "lokapala-jungle", name: "Lokapala Jungle" },
      { id: "ardravi-valley", name: "Ardravi Valley" },
      { id: "ashavan-realm", name: "Ashavan Realm" },
      { id: "vissudha-field", name: "Vissudha Field" },
      { id: "lost-nursery", name: "Lost Nursery" },
    ],
  },
  {
    id: "sumeru-desert",
    name: "Sumeru Desert",
    tag: "Patch 3.1+",
    perAreaPrice: { php: 240, usd: 4 },
    pricePerPct: { php: 3, usd: 0.05 },
    subAreas: [
      { id: "lower-setekh", name: "Land of Lower Setekh" },
      { id: "upper-setekh", name: "Land of Upper Setekh" },
      { id: "hypostyle-desert", name: "Hypostyle Desert" },
      { id: "hadramaveth", name: "Desert of Hadramaveth" },
      { id: "girdle-of-sands", name: "Girdle of the Sands" },
    ],
  },
  {
    id: "fontaine",
    name: "Fontaine",
    tag: "Patch 4.0",
    perAreaPrice: { php: 300, usd: 5 },
    pricePerPct: { php: 4, usd: 0.07 },
    subAreas: [
      { id: "court-fontaine", name: "Court of Fontaine" },
      { id: "beryl", name: "Beryl Region" },
      { id: "belleau", name: "Belleau Region" },
      { id: "liffey", name: "Liffey Region" },
      { id: "morte", name: "Morte Region" },
      { id: "erinnyes", name: "Erinnyes Forest" },
      { id: "nostoi", name: "Nostoi Region" },
    ],
  },
  {
    id: "natlan",
    name: "Natlan",
    tag: "Patch 5.0",
    perAreaPrice: { php: 130, usd: 2.25 },
    pricePerPct: { php: 4, usd: 0.07 },
    subAreas: [
      { id: "tequemecan-valley", name: "Tequemecan Valley" },
      { id: "coatepec-mountain", name: "Coatepec Mountain" },
      { id: "toyac-springs", name: "Toyac Springs" },
      { id: "basin-unnumbered-flames", name: "Basin of Unnumbered Flames" },
      { id: "tezcatepetonco-range", name: "Tezcatepetonco Range" },
      { id: "quahuacan-cliff", name: "Quahuacan Cliff" },
      { id: "ochkanatlan", name: "Ochkanatlan" },
      { id: "atocpan", name: "Atocpan" },
      { id: "easybreeze-resort", name: "Easybreeze Holiday Resort" },
    ],
  },
  {
    id: "nod-krai",
    name: "Nod-krai",
    tag: "Expansion",
    perAreaPrice: { php: 240, usd: 4 },
    pricePerPct: { php: 4, usd: 0.07 },
    subAreas: [
      { id: "lempo-isle", name: "Lempo Isle" },
      { id: "hiisi-island", name: "Hiisi Island" },
      { id: "paha-isle", name: "Paha Isle" },
      { id: "voidsea-outlook", name: "Voidsea Outlook" },
      { id: "wavechaser-plain", name: "Wavechaser Plain" },
      { id: "ashveil-peak", name: "Ashveil Peak" },
    ],
  },
  {
    id:"chenyu",
    name:"Chenyu Vale",
    tag:"Expansions",
    perAreaPrice: { php: 200, usd: 3.33 },
    pricePerPct: {php: 3, usd: 0.06},
    subAreas:[
      {id:"upper-vale", name:"Chenyu Vale: Upper Vale"},
      {id:"southern", name:"Chenyu Vale: Southern Mt."},
      {id:"laixin", name:"Mt. Laixin Exploration"},
    ],
  },
  {
    id:"chasm",
    name:"The Chasm",
    tag:"Expansions",
    perAreaPrice: { php: 300, usd: 5 },
    pricePerPct: {php: 3, usd: 0.06},
    subAreas:[
      {id:"surface", name:"The Chasm (Surface)"},
      {id:"underground", name:"The Chasm: Mining Underground"},
    ],
  },
  {
    id:"windrest",
    name:"Windrest Peak",
    tag:"Expansions",
    perAreaPrice: { php: 420, usd: 7 },
    pricePerPct: {php: 4, usd: 0.08},
    subAreas:[
      {id:"windrest-peak", name:"Windrest Peak"},
    ],
  },
  {
    id:"temple",
    name:"Temple of Space",
    tag:"Expansions",
    perAreaPrice: { php: 780, usd: 13 },
    pricePerPct: {php: 8, usd: 0.15},
    subAreas:[
      {id:"temple-of-space", name:"Temple of Space"},
    ],
  },
  {
    id:"enkanomiya",
    name:"Enkanomiya",
    tag:"Expansions",
    perAreaPrice: { php: 600, usd: 10 },
    pricePerPct: {php: 6, usd: 0.11},
    subAreas:[
      {id:"enkanomiya", name:"Enkanomiya"},
    ],
  },
  {
    id:"ancient",
    name:"Ancient Sacred Mountain",
    tag:"Expansions",
    perAreaPrice: { php: 780, usd: 13 },
    pricePerPct: {php: 8, usd: 0.15},
    subAreas:[
      {id:"temple-of-space", name:"Ancient Sacred Mountain"},
    ],
  },
  {
    id:"bygone-era",
    name:"Sea of Bygone Eras",
    tag:"Expansions",
    perAreaPrice: { php: 420, usd: 7 },
    pricePerPct: {php: 8, usd: 0.15},
    subAreas:[
      {id:"sea-of-bygone-eras", name:"Sea of Bygone Eras"},
    ],
  },
];

// Explicit exact fees 
const CLEAN_UP_FEE = { php: 50, usd: 1.00 }; 

export function calculateRemainingWorkPrice(region: ExplorationRegion, currentProgress: number): PriceData {
  if (currentProgress === UNSELECTED || currentProgress >= 100) {
    return { php: 0, usd: 0 };
  }

  let calculatedPhp = 0;
  let calculatedUsd = 0;
  const remainingPercentage = 100 - currentProgress;

  // 1. Base Tier (0% - 40%): Pulls your exact flat area price
  if (currentProgress <= 40) {
    calculatedPhp = region.perAreaPrice.php;
    calculatedUsd = region.perAreaPrice.usd;
  } 
  // 2. Mid Tier (41% - 79%): Strict Percentage Rate
  else if (currentProgress < 80) {
    calculatedPhp = remainingPercentage * region.pricePerPct.php;
    calculatedUsd = remainingPercentage * region.pricePerPct.usd;
  } 
  // 3. Clean-Up Tier (80% - 99%): Percentage Rate + Trouble Fee
  else {
    calculatedPhp = (remainingPercentage * region.pricePerPct.php) + CLEAN_UP_FEE.php;
    calculatedUsd = (remainingPercentage * region.pricePerPct.usd) + CLEAN_UP_FEE.usd;
  }

  return {
    php: Math.round(calculatedPhp),
    usd: Math.round(calculatedUsd * 100) / 100
  };
}

export function regionTotal(
  region: ExplorationRegion,
  selections: ExplorationSelections
): PriceData {
  return region.subAreas.reduce((sum, sa) => {
    const currentProgress = selections[`${region.id}__${sa.id}`] ?? UNSELECTED;
    const price = calculateRemainingWorkPrice(region, currentProgress);
    return {
      php: sum.php + price.php,
      usd: sum.usd + price.usd
    };
  }, { php: 0, usd: 0 });
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

// Ensure your receipt accepts the new PriceData structure
export interface ReceiptLineItem {
  id: string;
  categoryLabel: string;
  name: string;
  detail: string;
  price: PriceData; 
}

export function buildExplorationReceiptItems(
  selections: ExplorationSelections
): ReceiptLineItem[] {
  const items: ReceiptLineItem[] = [];

  for (const region of EXPLORATION_REGIONS) {
    for (const sa of region.subAreas) {
      const currentProgress = selections[`${region.id}__${sa.id}`] ?? UNSELECTED;
      if (currentProgress === UNSELECTED || currentProgress >= 100) continue;

      const price = calculateRemainingWorkPrice(region, currentProgress);
      if (price.php <= 0) continue;

      items.push({
        id: `${region.id}__${sa.id}`,
        categoryLabel: `World Exploration — ${region.name}`,
        name: sa.name,
        detail: `${currentProgress}% → 100%`,
        price,
      });
    }
  }

  return items;
}