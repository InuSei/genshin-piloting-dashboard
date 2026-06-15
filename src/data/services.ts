export type ServiceType = "checkbox" | "quantity" | "nested-list";

export interface NestedListItem {
  id: string;
  name: string;
  price: number;
}

export interface NestedListGroup {
  name: string;
  items: NestedListItem[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  basePrice: number;
  tag?: string;
  max?: number;
  groups?: NestedListGroup[];
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  description: string;
  services: Service[];
}

export type ServiceSelection = Record<string, number>;

export const CATEGORIES: Category[] = [
  {
    id: "maintenance",
    label: "Maintenance",
    emoji: "🛠",
    description: "Recurring daily and weekly upkeep tasks",
    services: [
      {
        id: "daily-commissions",
        name: "Daily Commissions (×4)",
        description: "Complete all 4 daily commissions + talk to Katheryne for bonus",
        type: "checkbox",
        basePrice: 80,
        tag: "Daily",
      },
      {
        id: "resin-farming",
        name: "Resin Management (160/day)",
        description: "Full original resin spend on specified domain/boss",
        type: "checkbox",
        basePrice: 150,
        tag: "Daily",
      },
      {
        id: "battle-pass",
        name: "Battle Pass Completion",
        description: "Complete all BP missions to reach level 50 and claim rewards",
        type: "checkbox",
        basePrice: 200,
        tag: "Bi-Weekly",
      }
    ],
  },

  {
    id: "exploration",
    label: "World Exploration",
    emoji: "🗺",
    description: "Map completion by percentage per sub-area",
    services: [],
  },
  {
    id: "quests",
    label: "Quests",
    emoji: "📜",
    description: "Story progression and world quest completions",
    services: [
      {
        id: "archon-quest-nested",
        name: "Archon Quests",
        description: "Select specific acts to complete.",
        type: "nested-list",
        basePrice: 0, 
        tag: "Main Story",
        groups: [
          {
            name: "Mondstadt",
            items: [
              { id: "aq_mond_prologue_1", name: "Act I: The Outlander Who Caught the Wind", price: 40 },
              { id: "aq_mond_prologue_2", name: "Act II: For a Tomorrow Without Tears", price: 40 },
              { id: "aq_mond_prologue_3", name: "Act III: Song of the Dragon and Freedom", price: 40 }
            ]
          },
          {
            name: "Liyue",
            items: [
              { id: "aq_liyue_1", name: "Act I: Of the Land Amidst Monoliths", price: 45 },
              { id: "aq_liyue_2", name: "Act II: Farewell, Archaic Lord", price: 45 },
              { id: "aq_liyue_3", name: "Act III: A New Star Approaches", price: 45 }
            ]
          },
          {
            name: "Inazuma",
            items: [
              { id: "aq_inazuma_1", name: "Act I: The Immovable God and the Eternal Euthymia", price: 55 },
              { id: "aq_inazuma_2", name: "Act II: Stillness, the Sublimation of Shadow", price: 55 },
              { id: "aq_inazuma_3", name: "Act III: Omnipresence Over Mortals", price: 55 }
            ]
          }
        ]
      },
      {
        id: "story-quest-nested",
        name: "Character Story Quests",
        description: "Story Key quest for specified characters.",
        type: "nested-list",
        basePrice: 0,
        tag: "Story",
        groups: [
          {
            name: "Standard Rates",
            items: [
              { id: "sq_single_act", name: "Any Character (Single Act)", price: 60 },
              { id: "sq_both_acts", name: "Any Character (Both Acts)", price: 110 }
            ]
          }
        ]
      },
      {
        id: "world-quest-mondstadt",
        name: "World Quest Pack — Mondstadt",
        description: "All major world quests including Windblume & Dragon Spine",
        type: "checkbox",
        basePrice: 400,
      },
      {
        id: "world-quest-liyue",
        name: "World Quest Pack — Liyue",
        description: "Noctilucous Jade, Streetward Rambler, Chasm main quests",
        type: "checkbox",
        basePrice: 450,
      },
      {
        id: "world-quest-inazuma",
        name: "World Quest Pack — Inazuma",
        description: "Sakura Arborism, Sacred Sakura Cleansing Ritual, all islands",
        type: "checkbox",
        basePrice: 500,
      },
      {
        id: "world-quest-sumeru",
        name: "World Quest Pack — Sumeru",
        description: "Aranara quests, Aranyaka story, Golden Slumber",
        type: "checkbox",
        basePrice: 600,
      },
      {
        id: "hangout-event",
        name: "Hangout Event (per character)",
        description: "Full hangout story with all endings unlocked",
        type: "quantity",
        basePrice: 60,
        max: 30,
      },
    ],
  },
  {
    id: "character",
    label: "Character Building",
    emoji: "⚔️",
    description: "Leveling, talents, artifacts, and ascension farming",
    services: [
      {
        id: "char-level",
        name: "Character Level 1 → 90",
        description: "Full EXP books and mora spent, all ascensions included",
        type: "quantity",
        basePrice: 600,
        max: 10,
        tag: "Per Character",
      },
      {
        id: "talent-level",
        name: "Talent Level 1 → 9",
        description: "Domain farming + boss material grind for one talent",
        type: "quantity",
        basePrice: 350,
        max: 30,
        tag: "Per Talent",
      },
      {
        id: "weapon-level",
        name: "Weapon Level 1 → 90",
        description: "Full refinement and ascension for one weapon",
        type: "quantity",
        basePrice: 300,
        max: 10,
        tag: "Per Weapon",
      },
      {
        id: "artifact-full-set",
        name: "5★ Artifact Full Set Farm",
        description: "Farm until a viable 2+2 or 4-piece set is obtained for one character",
        type: "quantity",
        basePrice: 1200,
        max: 5,
        tag: "Per Character",
      },
      {
        id: "artifact-single",
        name: "Specific Artifact Piece",
        description: "Target farm one specific slot until reasonable main/sub-stats",
        type: "quantity",
        basePrice: 400,
        max: 10,
        tag: "Per Slot",
      },
      {
        id: "constellation",
        name: "Constellation Unlock (C1–C6)",
        description: "Account must already own extra copies — we handle the upgrade",
        type: "quantity",
        basePrice: 100,
        max: 30,
        tag: "Per Const.",
      },
    ],
  },
  {
    id: "hunting",
    label: "Hunting / Events",
    emoji: "🎯",
    description: "Boss clears, Spiral Abyss, and limited-time events",
    services: [
      {
        id: "spiral-abyss",
        name: "Spiral Abyss — Full Clear (36★)",
        description: "Floors 9–12 all 3★, optimal team comps required",
        type: "checkbox",
        basePrice: 550,
        tag: "Bi-Weekly",
      },
      {
        id: "imaginarium",
        name: "Imaginarium Theater — Full Clear",
        description: "All acts completed with max stars, includes roster borrowing",
        type: "checkbox",
        basePrice: 400,
        tag: "Monthly",
      },
      {
        id: "current-event",
        name: "Current Flagship Event",
        description: "All main event quests + reward milestones completed",
        type: "checkbox",
        basePrice: 380,
        tag: "Limited",
      },
      {
        id: "event-mini",
        name: "Mini Side Events (per event)",
        description: "Limited-time small events: login bonuses, mini-games, check-ins",
        type: "quantity",
        basePrice: 150,
        max: 10,
        tag: "Limited",
      },
      {
        id: "boss-weekly",
        name: "Weekly Boss Drop Target Farm",
        description: "Farm a specific weekly boss until desired drop obtained (up to 4 weeks)",
        type: "checkbox",
        basePrice: 320,
        tag: "Weekly",
      },
      {
        id: "overworld-boss",
        name: "Overworld Boss Farming (per boss/day)",
        description: "Daily resin spent on specified overworld boss for materials",
        type: "quantity",
        basePrice: 120,
        max: 14,
      },
      {
        id: "fishing",
        name: "Fishing Achievement & Collection",
        description: "Obtain all exclusive fish pets and fishing achievement stamps",
        type: "checkbox",
        basePrice: 280,
      },
    ],
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function calcServicePrice(
  type: ServiceType,
  basePrice: number,
  value: number
): number {
  if (type === "checkbox") return value > 0 ? basePrice : 0;
  return basePrice * value;
}

export interface ReceiptLineItem {
  id: string;
  categoryLabel: string;
  name: string;
  detail: string;
  price: number;
}

export function buildReceiptItems(
  selections: ServiceSelection
): ReceiptLineItem[] {
  const items: ReceiptLineItem[] = [];
  
  for (const category of CATEGORIES) {
    for (const service of category.services) {
      
      // Handle the new Nested List Logic
      if (service.type === "nested-list" && service.groups) {
        for (const group of service.groups) {
          for (const item of group.items) {
            const val = selections[item.id] ?? 0;
            if (val > 0) {
              items.push({
                id: item.id,
                categoryLabel: `${category.label} — ${service.name}`,
                name: item.name,
                detail: group.name,
                price: item.price,
              });
            }
          }
        }
      } 
      // Handle Standard Checkbox/Quantity Logic
      else {
        const val = selections[service.id] ?? 0;
        if (val <= 0) continue;
        
        const price = calcServicePrice(service.type, service.basePrice, val);
        if (price <= 0) continue;

        let detail = "";
        if (service.type === "checkbox") detail = "Fixed";
        else detail = `×${val}`;

        items.push({
          id: service.id,
          categoryLabel: category.label,
          name: service.name,
          detail,
          price,
        });
      }
    }
  }
  return items;
}