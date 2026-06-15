export type ServiceType = "checkbox" | "quantity" | "nested-list";
export type PriceValue = number | { php: number; usd: number };

export interface PriceData {
  php: number;
  usd: number;
}

export interface NestedListItem {
  id: string;
  name: string;
  price: PriceData;
}

export interface NestedListGroup {
  name: string;
  items: NestedListItem[];
}

export interface Service {
  id: string;
  type: "checkbox" | "quantity" | "nested-list";
  name: string;
  description: string;
  basePrice: number;
  tag?: string;
  max?: number;
  groups?: {
    name: string;
    items: { 
      id: string; 
      name: string; 
      price: PriceValue; // <--- Changed from 'number'
    }[];
  }[];
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
    description: "Recurring daily, monthly, and patch upkeep packages",
    services: [
      {
        id: "maintenance-packages",
        type: "nested-list",
        name: "Maintenance Packages",
        description: "Select your desired maintenance duration and tier",
        basePrice: 0,
        groups: [
          {
            name: "Daily Commissions (1 Day)",
            items: [
              { id: "maint_daily_both", name: "Daily Comms w/ Resin Burn", price: { php: 30, usd: 0.60 } },
              { id: "maint_daily_comms", name: "Commission only", price: { php: 15, usd: 0.30 } },
              { id: "maint_daily_resin", name: "Resin Burn only", price: { php: 20, usd: 0.35 } },
            ]
          },
          {
            name: "Monthly Maintenance (30 Days)",
            items: [
              { id: "maint_month_base", name: "Dailies and Resin burn", price: { php: 300, usd: 10 } },
              { id: "maint_month_bp", name: "Dailies, Resin burn, BP missions", price: { php: 410, usd: 12 } },
              { id: "maint_month_full", name: "Dailies, Resin burn, BP missions, Events, SP and IT", price: { php: 960, usd: 20 } },
            ]
          },
          {
            name: "Patch Maintenance (42 Days)",
            items: [
              { id: "maint_patch_base", name: "Dailies and Resin burn", price: { php: 460, usd: 15 } },
              { id: "maint_patch_bp", name: "Dailies, Resin burn, BP missions", price: { php: 600, usd: 18 } },
              { id: "maint_patch_full", name: "Dailies, Resin burn, BP missions, Events, SP and IT", price: { php: 1250, usd: 25 } },
            ]
          }
        ]
      }
    ]
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
              { id: "aq_mon_1", name: "Act I: The Outlander Who Caught the Wind", price: { php: 40, usd: 0.71 } },
              { id: "aq_mon_2", name: "Act II: For a Tomorrow Without Tears", price: { php: 40, usd: 0.71 } },
              { id: "aq_mon_3", name: "Act III: Song of the Dragon and Freedom", price: { php: 40, usd: 0.71 } },
            ]
          },
          {
            name: "Liyue",
            items: [
              { id: "aq_liy_1", name: "Act I: Of the Land Amidst Monoliths", price: { php: 45, usd: 0.75 } },
              { id: "aq_liy_2", name: "Act II: Farewell, Archaic Lord", price: { php: 45, usd: 0.75 } },
              { id: "aq_liy_3", name: "Act III: A New Star Approaches", price: { php: 45, usd: 0.75 } },
              { id: "aq_liy_pr", name: "PR: Bough Keeper: Dainsleif", price: { php: 45, usd: 0.75 } },
              { id: "aq_liy_4", name: "Act IV: We Will Be Reunited", price: { php: 45, usd: 0.75 } },
            ]
          },
          {
            name: "Inazuma",
            items: [
              { id: "aq_ina_pr", name: "PR: Autumn Winds, Scarlet Leaves", price: { php: 55, usd: 0.95 } },
              { id: "aq_ina_1", name: "Act I: The Immovable God and the Eternal Euthymia", price: { php: 55, usd: 0.95 } },
              { id: "aq_ina_2", name: "Act II: Stillness, the Sublimation of Shadow", price: { php: 55, usd: 0.95 } },
              { id: "aq_ina_3", name: "Act III: Omnipresence Over Mortals", price: { php: 55, usd: 0.95 } },
              { id: "aq_ina_4", name: "Act IV: Requiem of the Echoing Depths", price: { php: 55, usd: 0.95 } },
            ]
          },
          {
            name: "Sumeru",
            items: [
              { id: "aq_sum_1", name: "Act I: Through Mists of Smoke and Forests Dark", price: { php: 75, usd: 1.25 } },
              { id: "aq_sum_2", name: "Act II: The Morn a Thousand Roses Brings", price: { php: 75, usd: 1.25 } },
              { id: "aq_sum_3", name: "Act III: Dreams, Emptiness, Deception", price: { php: 75, usd: 1.25 } },
              { id: "aq_sum_4", name: "Act IV: King Deshret and the Three Magi", price: { php: 75, usd: 1.25 } },
              { id: "aq_sum_5", name: "Act V: Akasha Pulses, the Kalpa Flame Rises", price: { php: 75, usd: 1.25 } },
              { id: "aq_sum_6", name: "Act VI: Caribert", price: { php: 75, usd: 1.25 } },
            ]
          },
          {
            name: "Fontaine",
            items: [
              { id: "aq_fon_1", name: "Act I: Prelude of Blancheur and Noirceur", price: { php: 70, usd: 1.15 } },
              { id: "aq_fon_2", name: "Act II: As Light Rain Falls Without Reason", price: { php: 70, usd: 1.15 } },
              { id: "aq_fon_3", name: "Act III: To The Stars Shining in the Depths", price: { php: 70, usd: 1.15 } },
              { id: "aq_fon_4", name: "Act IV: Cataclysm's Quickening", price: { php: 70, usd: 1.15 } },
              { id: "aq_fon_5", name: "Act V: Masquerade of the Guilty", price: { php: 70, usd: 1.15 } },
              { id: "aq_fon_6", name: "Act VI: Bedtime Story", price: { php: 70, usd: 1.15 } },
            ]
          },
          {
            name: "Natlan",
            items: [
              { id: "aq_nat_1", name: "Act I: Flowers Resplendent on the Sun-Scorched Sojourn", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_2", name: "Act II: Black Stone Under a White Stone", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_3", name: "Act III: Beyond the Smoke and Mirrors", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_4", name: "Act IV: The Rainbow Destined to Burn", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_in", name: "In: All Fires Fuel the Flame", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_5", name: "Act V: Incandescent Ode of Resurrection", price: { php: 80, usd: 1.43 } },
              { id: "aq_nat_6", name: "Act VI: A Space and Time for You", price: { php: 80, usd: 1.43 } },
            ]
          },
          {
            name: "Nod-Krai",
            items: [
              { id: "aq_nod_1", name: "Act I: A Dance of Snowy Tide and Hoarfrost Groves", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_2", name: "Act II: Elegy of Dust and Lamplight", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_3", name: "Act III: A Nation That Doesn't Exist", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_4", name: "Act IV: An Elegy for Faded Moonlight", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_5", name: "Act V: A Nocturne of the Far North", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_6", name: "Act VI: Melting Moonlight in the Morning Mist", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_7", name: "Act VII: A Traveler on a Winter's Night", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_8", name: "Act VIII: True Moon", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_9", name: "Act IX: As All Falls to Emptiness", price: { php: 75, usd: 1.25 } },
              { id: "aq_nod_10", name: "Act X: Of Myriad Paths Flux and Dissolution", price: { php: 75, usd: 1.25 } },
            ]
          },
          {
            name: "Interludes",
            items: [
              { id: "aq_int_1", name: "Act I", price: { php: 60, usd: 1.00 } },
              { id: "aq_int_2", name: "Act II", price: { php: 90, usd: 1.50 } },
              { id: "aq_int_3", name: "Act III", price: { php: 90, usd: 1.50 } },
              { id: "aq_int_4", name: "Act IV", price: { php: 60, usd: 1.00 } },
            ]
          }
        ]
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
    description: "Leveling, weapons, talents, and ascension farming",
    services: [
      {
        id: "character-building-nested",
        type: "nested-list",
        name: "Character Upgrades",
        description: "Select specific ascension phases, levels, and farming services",
        basePrice: 0,
        groups: [
          {
            name: "Character Leveling",
            items: [
              { id: "char_lvl_p1", name: "Phase 1 (Free)", price: { php: 0, usd: 0 } },
              { id: "char_lvl_p2", name: "Phase 2", price: { php: 10, usd: 0.18 } },
              { id: "char_lvl_p3", name: "Phase 3", price: { php: 20, usd: 0.36 } },
              { id: "char_lvl_p4", name: "Phase 4", price: { php: 40, usd: 0.71 } },
              { id: "char_lvl_p5", name: "Phase 5", price: { php: 50, usd: 0.89 } },
              { id: "char_lvl_p6", name: "Phase 6", price: { php: 80, usd: 1.43 } },
              { id: "char_lvl_max", name: "Level 1-90", price: { php: 200, usd: 3.66 } },
            ]
          },
          {
            name: "Weapon Ascension",
            items: [
              { id: "weap_asc_p1", name: "Phase 1", price: { php: 5, usd: 0.09 } },
              { id: "weap_asc_p2", name: "Phase 2", price: { php: 10, usd: 0.18 } },
              { id: "weap_asc_p3", name: "Phase 3", price: { php: 20, usd: 0.36 } },
              { id: "weap_asc_p4", name: "Phase 4", price: { php: 30, usd: 0.44 } },
              { id: "weap_asc_p5", name: "Phase 5", price: { php: 40, usd: 0.71 } },
              { id: "weap_asc_p6", name: "Phase 6", price: { php: 60, usd: 1.07 } },
              { id: "weap_asc_max", name: "Level 1-90", price: { php: 160, usd: 2.95 } },
            ]
          },
          {
            name: "Talent Ascension",
            items: [
              { id: "tal_asc_1_3", name: "Lvl 1 - 3", price: { php: 20, usd: 0.36 } },
              { id: "tal_asc_3_7", name: "Lvl 3 - 7", price: { php: 40, usd: 0.71 } },
              { id: "tal_asc_8_9", name: "Lvl 8 - 9", price: { php: 80, usd: 1.43 } },
              { id: "tal_asc_crown", name: "Triple Crown", price: { php: 130, usd: 2.15 } },
            ]
          },
          {
            name: "Character Farming",
            items: [
              { id: "farm_specialty", name: "Local Specialties (168 pcs)", price: { php: 60, usd: 2.50 } },
              { id: "farm_artifact", name: "Artifact Farming", price: { php: 250, usd: 5.00 } },
              { id: "farm_boss", name: "Boss Materials (46 pcs)", price: { php: 60, usd: 2.50 } },
            ]
          }
        ]
      }
    ]
  },
  {
    id: "others",
    label: "Other Services",
    emoji: "🎯",
    description: "Events, pulls, and collectible hunting",
    services: [
      {
        id: "other-services-nested",
        type: "nested-list",
        name: "Miscellaneous Services",
        description: "Select specific events, pulls, or hunting tasks",
        basePrice: 0,
        groups: [
          {
            name: "Primo Hunt",
            items: [
              { id: "hunt_primo_10", name: "10 PULLS", price: { php: 300, usd: 5.00 } },
              { id: "hunt_primo_20", name: "20 PULLS", price: { php: 600, usd: 10.00 } },
              { id: "hunt_primo_30", name: "30 PULLS", price: { php: 900, usd: 15.00 } },
              { id: "hunt_primo_40", name: "40 PULLS", price: { php: 1199, usd: 20.00 } },
              { id: "hunt_primo_50", name: "50 PULLS", price: { php: 1500, usd: 25.00 } },
            ]
          },
          {
            name: "Oculi Hunting",
            items: [
              { id: "hunt_oculi_anemo", name: "Anemoculi", price: { php: 2, usd: 0.04 } },
              { id: "hunt_oculi_geo", name: "Geoculi", price: { php: 2, usd: 0.04 } },
              { id: "hunt_oculi_electro", name: "Electroculi", price: { php: 3, usd: 0.05 } },
              { id: "hunt_oculi_dendro", name: "Dendroculi", price: { php: 3, usd: 0.05 } },
              { id: "hunt_oculi_hydro", name: "Hydroculi", price: { php: 3, usd: 0.05 } },
              { id: "hunt_oculi_pyro", name: "Pyroculi", price: { php: 3, usd: 0.05 } },
            ]
          },
          {
            name: "Offerings Hunting",
            items: [
              { id: "hunt_offering_crimson", name: "Crimson Agate", price: { php: 2, usd: 0.04 } },
              { id: "hunt_offering_lamenspar", name: "Lamenspar", price: { php: 2, usd: 0.04 } },
              { id: "hunt_offering_purify", name: "Purify Plum", price: { php: 2, usd: 0.04 } },
              { id: "hunt_offering_spirit", name: "Spirit Corps", price: { php: 2, usd: 0.04 } },
              { id: "hunt_offering_lunoculi", name: "Lunoculi", price: { php: 2, usd: 0.04 } },
            ]
          },
          {
            name: "Events",
            items: [
              { id: "hunt_event_main", name: "Main Event", price: { php: 250, usd: 5.00 } },
              { id: "hunt_event_mini", name: "Mini Events (e.g. Sightseeing with Friends...)", price: { php: 80, usd: 1.45 } },
              { id: "hunt_event_temper", name: "To Temper Thyself and Journey Far", price: { php: 750, usd: 13.00 } },
              { id: "hunt_event_exploration", name: "Exploration Events", price: { php: 600, usd: 9.80 } },
            ]
          }
        ]
      }
    ]
  }
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
  price: PriceValue; // <--- Changed from 'number'
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