// src/data/hsrServices.ts
//
// Honkai: Star Rail — the second game we service. Follows the same
// Category/Service shapes as the Genshin data (src/data/services.ts) so the
// dashboard and pricelist components can be reused, but keeps its own
// localStorage override key so editors never clash.
//
// Unlike Genshin, there is no per-% exploration pricing: planets are flat
// 100% bundles and there is no compass surcharge.

import {
  loadOverrides,
  HSR_STORAGE_KEY,
  type PriceOverrides,
} from "./priceStorage";
import type {
  Category,
  ServiceSelection,
  ReceiptLineItem,
  PriceValue,
} from "./services";

export const HSR_CATEGORIES: Category[] = [
  {
    id: "maintenance",
    label: "Maintenance",
    emoji: "🛠",
    description: "Recurring daily and weekly upkeep packages",
    services: [
      {
        id: "hsr-maintenance-packages",
        type: "nested-list",
        name: "Maintenance Packages",
        description: "Select your desired maintenance duration and tier",
        basePrice: 0,
        groups: [
          {
            name: "Daily (1 Day)",
            items: [
              { id: "hsr_maint_daily_dailies", name: "Dailies Only", price: { php: 20, usd: 0.35 } },
              { id: "hsr_maint_daily_burn", name: "Trailblaze Power Burn Only", price: { php: 20, usd: 0.35 } },
              { id: "hsr_maint_daily_both", name: "Dailies and Trailblaze Power Burn", price: { php: 40, usd: 0.65 } },
            ],
          },
          {
            name: "Weekly (7 Days)",
            items: [
              { id: "hsr_maint_week_dailies", name: "Dailies Only", price: { php: 85, usd: 1.30 } },
              { id: "hsr_maint_week_burn", name: "Trailblaze Power Burn Only", price: { php: 100, usd: 1.65 } },
              { id: "hsr_maint_week_full", name: "Full Weekly Task", price: { php: 185, usd: 3.00 } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "exploration",
    label: "World Exploration",
    emoji: "🌌",
    description: "Full-map completion bundles per planet — flat price, no per-% rates",
    services: [
      {
        id: "hsr-planet-bundles",
        type: "nested-list",
        name: "Planet Bundles",
        description:
          "✦ Max chests and puzzles · ✦ All adventure-related missions · ✦ Maxed token offerings · ✦ Special rewards (Penacony & Amphoreus only)",
        basePrice: 0,
        groups: [
          {
            name: "100% Map Completion",
            items: [
              { id: "hsr_planet_herta", name: "Herta Space Station", price: { php: 600, usd: 10.0 } },
              { id: "hsr_planet_jarilo", name: "Jarilo-VI", price: { php: 840, usd: 14.9 } },
              { id: "hsr_planet_luofu", name: "Xianzhou Luofu", price: { php: 900, usd: 14.9 } },
              { id: "hsr_planet_penacony", name: "Penacony", price: { php: 2160, usd: 35.0 } },
              { id: "hsr_planet_amphoreus", name: "Amphoreus", price: { php: 1850, usd: 30.5 } },
              { id: "hsr_planet_planacardia", name: "Planacardia", price: { php: 1800, usd: 30.0 } },
            ],
          },
        ],
      },
      {
        id: "hsr-collectibles",
        type: "nested-list",
        name: "Collectibles",
        description: "Chests, puzzles, and other collectibles cleared per map area.",
        basePrice: 0,
        groups: [
          {
            name: "Collectibles",
            items: [
              { id: "hsr_collect_area", name: "Per Area / Map", price: { php: 175, usd: 2.9 }, isQuantity: true },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "quests",
    label: "Quests",
    emoji: "📜",
    description: "Trailblaze main story, continuances, and side content",
    services: [
      {
        id: "hsr-main-quest",
        name: "Trailblaze Main Quest",
        description: "Select specific story parts to complete.",
        type: "nested-list",
        basePrice: 0,
        tag: "Main Story",
        groups: [
          {
            name: "Herta Space Station",
            items: [
              { id: "hsr_mq_herta", name: "Today is Yesterday's Tomorrow", price: { php: 180, usd: 2.95 } },
            ],
          },
          {
            name: "Jarilo-VI",
            items: [
              { id: "hsr_mq_jarilo_1", name: "Part 1: In Withering Wintry Night", price: { php: 353, usd: 5.70 } },
              { id: "hsr_mq_jarilo_2", name: "Part 2: In the Sweltering Morning Sun", price: { php: 215, usd: 3.50 } },
            ],
          },
          {
            name: "Xianzhou Luofu",
            items: [
              { id: "hsr_mq_xz_1", name: "Part 1: Windswept Wanderlust", price: { php: 335, usd: 5.40 } },
              { id: "hsr_mq_xz_2", name: "Part 2: Topclouded Towerthrust", price: { php: 620, usd: 10.00 } },
              { id: "hsr_mq_xz_3", name: "Part 3: Karmic Cloud Faded, War Banners Fold", price: { php: 102, usd: 1.65 } },
            ],
          },
          {
            name: "Penacony",
            items: [
              { id: "hsr_mq_pen_1", name: "Part 1: The Sound and the Fury", price: { php: 301, usd: 4.85 } },
              { id: "hsr_mq_pen_2", name: "Part 2: Cat Among Pigeons", price: { php: 620, usd: 10.00 } },
              { id: "hsr_mq_pen_3", name: "Part 3: In Our Time", price: { php: 456, usd: 7.35 } },
              { id: "hsr_mq_pen_4", name: "Part 4: Farewell Penacony", price: { php: 121, usd: 1.95 } },
              { id: "hsr_mq_pen_5", name: "Part 5: New Venture on the Eight Dawn", price: { php: 102, usd: 1.65 } },
            ],
          },
          {
            name: "Amphoreus",
            items: [
              { id: "hsr_mq_amp_1", name: "Part 1: Heroic Saga of Flame-Chase", price: { php: 350, usd: 5.65 } },
              { id: "hsr_mq_amp_2", name: "Part 2: Light Slips the Gate", price: { php: 183, usd: 2.95 } },
              { id: "hsr_mq_amp_3", name: "Part 3: Through the Petaks in the Land of Repose", price: { php: 217, usd: 3.50 } },
              { id: "hsr_mq_amp_4", name: "Part 4: The Fall at Dawn's Rise", price: { php: 183, usd: 2.95 } },
              { id: "hsr_mq_amp_5", name: "Part 5: For the Sun Set to Die", price: { php: 121, usd: 1.95 } },
              { id: "hsr_mq_amp_6", name: "Part 6: Before Their Deaths", price: { php: 301, usd: 4.85 } },
              { id: "hsr_mq_amp_7", name: "Part 7: Back to Earth in Evernight", price: { php: 183, usd: 2.95 } },
              { id: "hsr_mq_amp_8", name: "Part 8: As Tomorrow Became Yesterday", price: { php: 301, usd: 4.85 } },
            ],
          },
        ],
      },
      {
        id: "hsr-continuance",
        name: "Trailblaze Continuance",
        description: "Select specific continuance stories to complete.",
        type: "nested-list",
        basePrice: 0,
        groups: [
          {
            name: "Continuance",
            items: [
              { id: "hsr_tc_1", name: "Jolted Awake From a Winter Dream", price: { php: 180, usd: 2.95 } },
              { id: "hsr_tc_2", name: "A Foxian Tale of the Haunted", price: { php: 215, usd: 3.50 } },
              { id: "hsr_tc_3", name: "Finest Duel Under the Pristine Blue (I)", price: { php: 240, usd: 4.90 } },
              { id: "hsr_tc_4", name: "Finest Duel Under the Pristine Blue (II)", price: { php: 270, usd: 4.40 } },
              { id: "hsr_tc_5", name: "Crown of the Mundane and Divine", price: { php: 100, usd: 2.00 } },
              { id: "hsr_tc_6", name: "Banana Outrage: Battles Without Ninja & Humanity", price: { php: 455, usd: 7.30 } },
              { id: "hsr_tc_7", name: "Sweet Dreams and Holy Grail", price: { php: 155, usd: 2.55 } },
            ],
          },
        ],
      },
      {
        id: "hsr-other-quests",
        name: "Other",
        description: "Equilibrium trials and adventure extras.",
        type: "nested-list",
        basePrice: 0,
        groups: [
          {
            name: "Other",
            items: [
              { id: "hsr_q_equil_3", name: "Trial of the Equilibrium (1 - 3)", price: { php: 30, usd: 0.50 } },
              { id: "hsr_q_equil_6", name: "Trial of the Equilibrium (4 - 6)", price: { php: 60, usd: 1.00 } },
              { id: "hsr_q_adv_no", name: "Adventure without Jade", price: { php: 40, usd: 0.70 } },
              { id: "hsr_q_adv_jade", name: "Adventure with Jade", price: { php: 50, usd: 0.85 } },
              { id: "hsr_q_companion", name: "Companion", price: { php: 60, usd: 1.00 } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "endgame",
    label: "Endgame",
    emoji: "⚔️",
    description: "Memory of Chaos, Simulated Universe, and end-game content",
    services: [
      {
        id: "hsr-endgame-contents",
        type: "nested-list",
        name: "End Game Contents",
        description: "Select the endgame tasks you need cleared.",
        basePrice: 0,
        groups: [
          {
            name: "Memory of Chaos & Pure Fiction",
            items: [
              { id: "hsr_eg_moc", name: "Memory of Chaos", price: { php: 515, usd: 8.30 } },
              { id: "hsr_eg_as_pf", name: "Apocalyptic Shadow / Pure Fiction (each)", price: { php: 420, usd: 6.75 } },
            ],
          },
          {
            name: "Simulated Universe",
            items: [
              { id: "hsr_eg_su_weekly", name: "Per Weekly Rewards", price: { php: 150, usd: 2.45 } },
              { id: "hsr_eg_su_d1", name: "Difficulty 1", price: { php: 100, usd: 1.65 } },
              { id: "hsr_eg_su_d2", name: "Difficulty 2", price: { php: 125, usd: 2.05 } },
              { id: "hsr_eg_su_d3", name: "Difficulty 3", price: { php: 150, usd: 2.45 } },
              { id: "hsr_eg_su_d4", name: "Difficulty 4", price: { php: 200, usd: 3.25 } },
            ],
          },
          {
            name: "Divergent Universe",
            items: [
              { id: "hsr_eg_du_weekly", name: "Per Weekly Rewards", price: { php: 180, usd: 2.90 } },
              { id: "hsr_eg_du_level", name: "Divergent Synchronicity Level Up", price: { php: 45, usd: 0.75 } },
            ],
          },
          {
            name: "Swarm",
            items: [
              { id: "hsr_eg_swarm_jade", name: "100% Jade Completion", price: { php: 1200, usd: 19.30 } },
              { id: "hsr_eg_swarm_full", name: "100% Swarm (Chapters, Paths, Trails, Secrets)", price: { php: 1500, usd: 25.10 } },
            ],
          },
          {
            name: "Gold and Gears",
            items: [
              { id: "hsr_eg_gg_jade", name: "100% Jade Completion", price: { php: 1500, usd: 25.10 } },
              { id: "hsr_eg_gg_full", name: "100% Gold and Gears (Paths, Dice, Secrets, Rewards)", price: { php: 2200, usd: 35.35 } },
            ],
          },
          {
            name: "Unknowable Domain",
            items: [
              { id: "hsr_eg_ud_jade", name: "100% Jade Completion", price: { php: 1750, usd: 28.15 } },
              { id: "hsr_eg_ud_full", name: "100% Unknowable Domain (Chapters, Paths)", price: { php: 2000, usd: 32.15 } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "memoir",
    label: "Conventional Memoir",
    emoji: "🎮",
    description: "One-time limited event stories and side content",
    services: [
      {
        id: "hsr-memoir-events",
        type: "nested-list",
        name: "Conventional Memoir",
        description: "Select the event memoirs you want completed.",
        basePrice: 0,
        groups: [
          {
            name: "Events",
            items: [
              { id: "hsr_mem_1", name: "Boulder Town Super League", price: { php: 150, usd: 3.00 } },
              { id: "hsr_mem_2", name: "Everwinter City Museum Ledger of Curiosities", price: { php: 250, usd: 4.10 } },
              { id: "hsr_mem_3", name: "Tale of the Fantastic", price: { php: 100, usd: 2.00 } },
              { id: "hsr_mem_4", name: "Aurum Alley's Hustle and Bustle", price: { php: 350, usd: 6.00 } },
              { id: "hsr_mem_5", name: "Aetherium Wars", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_6", name: "A Foxian Tale of the Haunted", price: { php: 400, usd: 6.50 } },
              { id: "hsr_mem_7", name: "Boulder Town Martial Exhibition", price: { php: 150, usd: 3.00 } },
              { id: "hsr_mem_8", name: "Critter Pick", price: { php: 150, usd: 2.60 } },
              { id: "hsr_mem_9", name: "Vignettes in a Cup", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_10", name: "Clockie: Dreamjoy Memoir", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_11", name: "Origami Bird Clash", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_12", name: "Saga of Primaveral Blade", price: { php: 350, usd: 5.70 } },
              { id: "hsr_mem_13", name: "Luminary Wardance", price: { php: 350, usd: 5.70 } },
              { id: "hsr_mem_14", name: "Festive Revelry", price: { php: 150, usd: 3.00 } },
              { id: "hsr_mem_15", name: "Sound Hunt Ninjutsu Inscription", price: { php: 300, usd: 5.00 } },
              { id: "hsr_mem_16", name: "Cosmic Home Décor Guide", price: { php: 250, usd: 4.20 } },
              { id: "hsr_mem_17", name: "Hypogeum Enigma", price: { php: 200, usd: 3.50 } },
              { id: "hsr_mem_18", name: "The Awooo Firm", price: { php: 200, usd: 3.50 } },
              { id: "hsr_mem_19", name: "Seal Slammers", price: { php: 300, usd: 3.50 } },
              { id: "hsr_mem_20", name: "Legend of the Galactic Baseballer: Demon King", price: { php: 300, usd: 5.00 } },
              { id: "hsr_mem_21", name: "Origami Bird Clash: Official Version", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_22", name: "Fate/Stay Night: Holy Grail War", price: { php: 300, usd: 5.50 } },
              { id: "hsr_mem_23", name: "The Chrysos Maze", price: { php: 300, usd: 5.00 } },
              { id: "hsr_mem_24", name: "Nice Weather for Dromases", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_25", name: "Snack Dash", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_26", name: "Chrysos Awoo Championship", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_27", name: "Remnants of Twilight", price: { php: 150, usd: 2.50 } },
              { id: "hsr_mem_28", name: "Cosmicon, Roll on!", price: { php: 250, usd: 4.50 } },
              { id: "hsr_mem_29", name: "Wispea War Saga", price: { php: 150, usd: 2.50 } },
              { id: "hsr_mem_30", name: "Cosmic Data Roaming", price: { php: 350, usd: 5.60 } },
            ],
          },
        ],
      },
    ],
  },
];

export function buildHsrReceiptItems(selections: ServiceSelection): ReceiptLineItem[] {
  const items: ReceiptLineItem[] = [];

  for (const category of HSR_CATEGORIES) {
    for (const service of category.services) {
      if (service.type === "nested-list" && service.groups) {
        for (const group of service.groups) {
          for (const item of group.items) {
            const val = selections[item.id] ?? 0;
            if (val > 0) {
              const price = item.price as PriceValue;
              const basePhp = typeof price === "object" ? price.php : price;
              const baseUsd = typeof price === "object" ? price.usd : price / 62;

              const finalPrice = item.isQuantity
                ? { php: basePhp * val, usd: baseUsd * val }
                : price;

              const displayName = item.isQuantity ? `${item.name} (x${val})` : item.name;

              items.push({
                id: item.id,
                categoryLabel: `${category.label} — ${service.name}`,
                name: displayName,
                detail: group.name,
                price: finalPrice,
              });
            }
          }
        }
      } else {
        const val = selections[service.id] ?? 0;
        if (val <= 0) continue;
        const price = service.type === "checkbox" ? (val > 0 ? service.basePrice : 0) : service.basePrice * val;
        if (price <= 0) continue;
        items.push({
          id: service.id,
          categoryLabel: category.label,
          name: service.name,
          detail: service.type === "checkbox" ? "Fixed" : `×${val}`,
          price,
        });
      }
    }
  }
  return items;
}

const DEFAULT_HSR_CATEGORIES: Category[] = JSON.parse(JSON.stringify(HSR_CATEGORIES));

export function applyHsrServicePriceOverrides(overrides: PriceOverrides): void {
  for (const category of HSR_CATEGORIES) {
    for (const service of category.services) {
      if (service.type === "nested-list" && service.groups) {
        for (const group of service.groups) {
          for (const item of group.items) {
            const override = overrides.nestedItems[item.id];
            if (override) item.price = { php: override.php, usd: override.usd };
          }
        }
      } else {
        const override = overrides.serviceBase[service.id];
        if (override !== undefined) service.basePrice = override;
      }
    }
  }
}

export function restoreHsrServiceDefaults(): void {
  const defaultsById = new Map(DEFAULT_HSR_CATEGORIES.map((c) => [c.id, c]));
  for (const category of HSR_CATEGORIES) {
    const defaultCategory = defaultsById.get(category.id);
    if (!defaultCategory) continue;
    for (const service of category.services) {
      const defaultService = defaultCategory.services.find((s) => s.id === service.id);
      if (!defaultService) continue;
      if (service.type === "nested-list" && service.groups && defaultService.groups) {
        for (let g = 0; g < service.groups.length; g++) {
          for (let it = 0; it < service.groups[g].items.length; it++) {
            const defaultItem = defaultService.groups[g]?.items[it];
            if (defaultItem) service.groups[g].items[it].price = defaultItem.price;
          }
        }
      } else {
        service.basePrice = defaultService.basePrice;
      }
    }
  }
}

applyHsrServicePriceOverrides(loadOverrides(HSR_STORAGE_KEY));