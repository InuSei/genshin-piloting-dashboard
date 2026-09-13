import { loadOverrides, type PriceOverrides } from "./priceStorage";
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
  isQuantity?: boolean;
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
      price: PriceValue; 
      isQuantity?: boolean;
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
    description: "Bundled price per whole region — 100% map completion",
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
            name: "Snezhnaya",
            items: [
              { id: "aq_sne_1", name: "Act I: Everwinter Without Mercy", price: { php: 150, usd: 2.45 } },
              { id: "aq_sne_2", name: "Act II: Wraith's Nocturne", price: { php: 150, usd: 2.45 } },
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
        id: "world-quests",
        name: "World Quests",
        description: "Full world quest chains and one-time quests per region.",
        type: "nested-list",
        basePrice: 0,
        groups: [
          {
            name: "Mondstadt",
            items: [
              { id: "wq_mond_1", name: "Break the Sword Cemetery Seal", price: { php: 40, usd: 0.75 } },
              { id: "wq_mond_2", name: "Time and Wind", price: { php: 40, usd: 0.75 } },
              { id: "wq_mond_3", name: "In The Mountains", price: { php: 80, usd: 1.45 } },
              { id: "wq_mond_4", name: "A Land Entombed", price: { php: 30, usd: 0.55 } },
            ]
          },
          {
            name: "Liyue",
            items: [
              { id: "wq_liy_1", name: "The Chi of Yore", price: { php: 50, usd: 0.90 } },
              { id: "wq_liy_2", name: "Chasm Delvers", price: { php: 200, usd: 3.70 } },
              { id: "wq_liy_3", name: "Chenyu's Blessing of Sunken Jade", price: { php: 200, usd: 3.70 } },
              { id: "wq_liy_4", name: "The Cloud Padded Path to the Chiwang Repose", price: { php: 20, usd: 0.40 } },
              { id: "wq_liy_5", name: "A Wangshan Walk to Remember", price: { php: 60, usd: 1.00 } },
            ]
          },
          {
            name: "Inazuma",
            items: [
              { id: "wq_ina_1", name: "Sacred Sakura Cleansing Ritual", price: { php: 200, usd: 3.70 } },
              { id: "wq_ina_2", name: "Tatara Tales (full 7 days)", price: { php: 100, usd: 1.75 } },
              { id: "wq_ina_3", name: "Orobashi's Legacy (5 parts)", price: { php: 130, usd: 2.25 } },
              { id: "wq_ina_4", name: "Seirai Stormchasers (4 parts)", price: { php: 150, usd: 2.55 } },
              { id: "wq_ina_5", name: "Through the Mists (4 days)", price: { php: 180, usd: 3.00 } },
              { id: "wq_ina_6", name: "The Moon-Bathed Deep", price: { php: 150, usd: 2.55 } },
              { id: "wq_ina_7", name: "The Still Water's Flow", price: { php: 50, usd: 0.90 } },
              { id: "wq_ina_8", name: "Sakura Arborism", price: { php: 50, usd: 0.90 } },
              { id: "wq_ina_9", name: "From Dusk to Dawn in Byakuyakoku", price: { php: 200, usd: 3.70 } },
              { id: "wq_ina_10", name: "Erebos' Secret", price: { php: 90, usd: 1.50 } },
              { id: "wq_ina_11", name: "Collection of Dragons and Snakes", price: { php: 60, usd: 1.00 } },
            ]
          },
          {
            name: "Sumeru",
            items: [
              { id: "wq_sum_1", name: "Aranyaka (full quest line; all subquests)", price: { php: 600, usd: 10.00 } },
              { id: "wq_sum_2", name: "Aranyaka + Aranyaka book completion", price: { php: 850, usd: 13.55 } },
              { id: "wq_sum_3", name: "Legends of the Stone Lock", price: { php: 70, usd: 1.20 } },
              { id: "wq_sum_4", name: "Static Views (parts I & II)", price: { php: 60, usd: 1.00 } },
              { id: "wq_sum_5", name: "Golden Slumber", price: { php: 200, usd: 3.70 } },
              { id: "wq_sum_6", name: "Old Notes and New Friends", price: { php: 300, usd: 5.00 } },
              { id: "wq_sum_7", name: "Dual Evidence (ONNF part 2)", price: { php: 150, usd: 2.55 } },
              { id: "wq_sum_8", name: "Afratu's Dilemma", price: { php: 50, usd: 0.90 } },
              { id: "wq_sum_9", name: "The Dirge of Bilqis", price: { php: 300, usd: 5.00 } },
              { id: "wq_sum_10", name: "\"The Falcon\" series", price: { php: 100, usd: 1.75 } },
              { id: "wq_sum_11", name: "Apocalypse Lost", price: { php: 50, usd: 0.90 } },
              { id: "wq_sum_12", name: "Khvarena of Good and Evil", price: { php: 300, usd: 5.00 } },
              { id: "wq_sum_13", name: "Pale Fire", price: { php: 50, usd: 0.90 } },
              { id: "wq_sum_14", name: "Lightcall Resonance", price: { php: 40, usd: 0.75 } },
              { id: "wq_sum_15", name: "Monumental Study", price: { php: 40, usd: 0.75 } },
            ]
          },
          {
            name: "Fontaine",
            items: [
              { id: "wq_fon_1", name: "Ancient Colors", price: { php: 120, usd: 2.00 } },
              { id: "wq_fon_2", name: "Ann of the Nazissenkreuz", price: { php: 150, usd: 2.55 } },
              { id: "wq_fon_3", name: "Aqueous Tidemarks", price: { php: 60, usd: 1.00 } },
              { id: "wq_fon_4", name: "Book of Esoteric Revelations", price: { php: 50, usd: 0.90 } },
              { id: "wq_fon_5", name: "Unfinished Comedy", price: { php: 200, usd: 3.70 } },
              { id: "wq_fon_6", name: "Road to the Singularity", price: { php: 50, usd: 0.90 } },
              { id: "wq_fon_7", name: "Fontaine Research Institute Chronicles", price: { php: 170, usd: 2.76 } },
              { id: "wq_fon_8", name: "In the Search of Lost Time (4 parts)", price: { php: 100, usd: 1.75 } },
              { id: "wq_fon_9", name: "Treacherous Light of the Depths", price: { php: 80, usd: 1.45 } },
              { id: "wq_fon_10", name: "In The Wake of Narcissus", price: { php: 300, usd: 5.00 } },
              { id: "wq_fon_11", name: "The Wild Fairy of Erinnyes", price: { php: 130, usd: 2.25 } },
              { id: "wq_fon_12", name: "Questioning Melusine and Answering Machine", price: { php: 250, usd: 4.10 } },
              { id: "wq_fon_13", name: "Canticles of Harmony (4 parts)", price: { php: 200, usd: 3.70 } },
            ]
          },
          {
            name: "Natlan",
            items: [
              { id: "wq_nat_1", name: "Tales of Dreams Plucked From Fire", price: { php: 50, usd: 0.90 } },
              { id: "wq_nat_2", name: "Shadows of the Mountains", price: { php: 130, usd: 2.25 } },
              { id: "wq_nat_3", name: "Between Pledge and Forgettance", price: { php: 80, usd: 1.45 } },
              { id: "wq_nat_4", name: "To the Night, What is the Night's", price: { php: 50, usd: 0.90 } },
              { id: "wq_nat_5", name: "Ripe for Trouble", price: { php: 50, usd: 0.90 } },
              { id: "wq_nat_6", name: "Lost Traveler in the Ashen Realm", price: { php: 250, usd: 4.10 } },
              { id: "wq_nat_7", name: "The Mystery of Tecoloapan Beach", price: { php: 80, usd: 1.45 } },
              { id: "wq_nat_8", name: "Open your Heart to Me", price: { php: 50, usd: 0.90 } },
              { id: "wq_nat_9", name: "Quest Chains: Path to the Flaming Peaks / Chronicler of the Crumbling City / A Finale Emberforged", price: { php: 300, usd: 4.00 } },
              { id: "wq_nat_10", name: "The Way Into the Mountain", price: { php: 60, usd: 1.00 } },
              { id: "wq_nat_11", name: "The World is Your Canvas (full part)", price: { php: 160, usd: 2.60 } },
            ]
          },
          {
            name: "Nod-Krai",
            items: [
              { id: "wq_nod_1", name: "Polkka Beneath the Moon's Oracle", price: { php: 200, usd: 3.70 } },
              { id: "wq_nod_2", name: "Colors of Emptiness", price: { php: 50, usd: 0.90 } },
              { id: "wq_nod_3", name: "East of the Moon, West of the Sun", price: { php: 200, usd: 1.43 } },
              { id: "wq_nod_4", name: "Nightingale's Song", price: { php: 300, usd: 3.70 } },
              { id: "wq_nod_5", name: "Return to Sender", price: { php: 80, usd: 1.45 } },
              { id: "wq_nod_6", name: "Meeting Point quests (6 quests)", price: { php: 90, usd: 1.50 } },
            ]
          },
          {
            name: "Snezhnaya",
            items: [
              { id: "wq_sne_1", name: "Hesperides of Love and Hate", price: { php: 160, usd: 3.00 } },
              { id: "wq_sne_2", name: "In the Dwelling of Life", price: { php: 245, usd: 4.00 } },
              { id: "wq_sne_3", name: "Her Palace Collapses Into the Blizzard", price: { php: 45, usd: 0.90 } },
              { id: "wq_sne_4", name: "On One Side a Palace, On the Other a Tomb", price: { php: 85, usd: 1.40 } },
              { id: "wq_sne_5", name: "Mean Streets of the Despicable", price: { php: 50, usd: 1.00 } },
              { id: "wq_sne_6", name: "For an Ice Mirror Fragment", price: { php: 20, usd: 0.40 } },
              { id: "wq_sne_7", name: "Small Jack Frost, Big Problems", price: { php: 30, usd: 0.50 } },
              { id: "wq_sne_8", name: "Meeting Point: The Korolevskiy Theater", price: { php: 15, usd: 0.30 } },
              { id: "wq_sne_9", name: "Meeting Point: Tidesong Cavern", price: { php: 15, usd: 0.30 } },
              { id: "wq_sne_10", name: "Meeting Point: Huntman's Cabin", price: { php: 15, usd: 0.30 } },
            ]
          }
        ]
      },
      {
        id: "story-tribe-side",
        name: "Story, Tribe & Side Quests",
        description: "Per-quest pricing for story quests, hangouts, tribe quests, and minor quests.",
        type: "nested-list",
        basePrice: 0,
        groups: [
          {
            name: "Story Quests",
            items: [
              { id: "stq_story_1", name: "Story Quest Act I (per quest)", price: { php: 60, usd: 1.07 }, isQuantity: true },
              { id: "stq_story_2", name: "Story Quest Act II (per quest)", price: { php: 60, usd: 1.07 }, isQuantity: true },
            ]
          },
          {
            name: "Hangout Events",
            items: [
              { id: "stq_hangout", name: "Full Hangout Ending (per character)", price: { php: 60, usd: 1.07 }, isQuantity: true },
            ]
          },
          {
            name: "Tribe Quests",
            items: [
              { id: "stq_tribe", name: "Full Tribe Quests (3 Acts) per Tribe", price: { php: 100, usd: 1.63 }, isQuantity: true },
            ]
          },
          {
            name: "Minor Quests",
            items: [
              { id: "stq_minor_10", name: "Quest under 10 mins long", price: { php: 10, usd: 0.16 }, isQuantity: true },
              { id: "stq_minor_20", name: "Quest 11-20 mins long", price: { php: 25, usd: 0.40 }, isQuantity: true },
              { id: "stq_minor_30", name: "Quest 21-30 mins long", price: { php: 40, usd: 0.75 }, isQuantity: true },
              { id: "stq_minor_50", name: "Quest 31-50 mins long", price: { php: 60, usd: 1.07 }, isQuantity: true },
            ]
          }
        ]
      },
      {
        id: "tribal-chronicles",
        name: "Tribal Chronicles (Natlan)",
        description: "Individual acts for each Natlan tribe chronicle.",
        type: "nested-list",
        basePrice: 0,
        groups: [
          {
            name: "People of the Spring",
            items: [
              { id: "tc_spring_1", name: "Act I: Those Searching for the Mysterious Island", price: { php: 35, usd: 0.58 } },
              { id: "tc_spring_2", name: "Act II: The Legend of the Mysterious Island", price: { php: 35, usd: 0.58 } },
              { id: "tc_spring_3", name: "Act III: Journey to the Mysterious Island", price: { php: 30, usd: 0.50 } },
            ]
          },
          {
            name: "Scions of the Canopy",
            items: [
              { id: "tc_canopy_1", name: "Act I: A Mysterious Visitor From Huitztlan", price: { php: 35, usd: 0.58 } },
              { id: "tc_canopy_2", name: "Act II: A Hero's Rites", price: { php: 35, usd: 0.58 } },
              { id: "tc_canopy_3", name: "Act III: Kinich's Deal", price: { php: 30, usd: 0.50 } },
            ]
          },
          {
            name: "Children of Echoes",
            items: [
              { id: "tc_echoes_1", name: "Act I: Melodious Chant", price: { php: 35, usd: 0.58 } },
              { id: "tc_echoes_2", name: "Act II: Tepetli Dissonance", price: { php: 35, usd: 0.58 } },
              { id: "tc_echoes_3", name: "Act III: Hoarse Echoes", price: { php: 30, usd: 0.50 } },
            ]
          },
          {
            name: "Flower-Feather Clan",
            items: [
              { id: "tc_feather_1", name: "Act I: The Wingless One of Tlalocan", price: { php: 35, usd: 0.58 } },
              { id: "tc_feather_2", name: "Act II: The Night Before the Trial", price: { php: 35, usd: 0.58 } },
              { id: "tc_feather_3", name: "Act III: Guns and Wings", price: { php: 30, usd: 0.50 } },
            ]
          },
          {
            name: "Masters of the Night-Wind",
            items: [
              { id: "tc_nightwind_1", name: "Act I: Calling from the Masters of the Night-Wind", price: { php: 35, usd: 0.58 } },
              { id: "tc_nightwind_2", name: "Act II: Legendary \"Color\"", price: { php: 35, usd: 0.58 } },
              { id: "tc_nightwind_3", name: "Act III: The Truth of the Battle of Seven Colors", price: { php: 30, usd: 0.50 } },
            ]
          }
        ]
      },
    ],
  },
  {
    id: "character",
    label: "Character Building",
    emoji: "⚔️",
    description: "Leveling, weapons, talents, and farming services",
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
              { id: "char_lvl_p2", name: "Phase 2", price: { php: 10, usd: 0.20 } },
              { id: "char_lvl_p3", name: "Phase 3", price: { php: 25, usd: 0.50 } },
              { id: "char_lvl_p4", name: "Phase 4", price: { php: 40, usd: 0.70 } },
              { id: "char_lvl_p5", name: "Phase 5", price: { php: 60, usd: 1.00 } },
              { id: "char_lvl_p6", name: "Phase 6", price: { php: 100, usd: 1.70 } },
              { id: "char_lvl_max", name: "Level 1-90 (full)", price: { php: 235, usd: 4.10 } },
            ]
          },
          {
            name: "Weapon Ascension",
            items: [
              { id: "weap_asc_p1", name: "Phase 1", price: { php: 5, usd: 0.10 } },
              { id: "weap_asc_p2", name: "Phase 2", price: { php: 15, usd: 0.26 } },
              { id: "weap_asc_p3", name: "Phase 3", price: { php: 25, usd: 0.50 } },
              { id: "weap_asc_p4", name: "Phase 4", price: { php: 45, usd: 0.75 } },
              { id: "weap_asc_p5", name: "Phase 5", price: { php: 60, usd: 1.00 } },
              { id: "weap_asc_p6", name: "Phase 6", price: { php: 120, usd: 1.95 } },
              { id: "weap_asc_max", name: "Level 1-90 (full)", price: { php: 250, usd: 4.50 } },
            ]
          },
          {
            name: "Talent Ascension",
            items: [
              { id: "tal_asc_2_3", name: "Talent Lvl 2 → 3", price: { php: 5, usd: 0.10 } },
              { id: "tal_asc_3_4", name: "Talent Lvl 3 → 4", price: { php: 10, usd: 0.20 } },
              { id: "tal_asc_4_5", name: "Talent Lvl 4 → 5", price: { php: 15, usd: 0.26 } },
              { id: "tal_asc_5_6", name: "Talent Lvl 5 → 6", price: { php: 20, usd: 0.45 } },
              { id: "tal_asc_6_7", name: "Talent Lvl 6 → 7", price: { php: 25, usd: 0.50 } },
              { id: "tal_asc_7_8", name: "Talent Lvl 7 → 8", price: { php: 40, usd: 0.70 } },
              { id: "tal_asc_8_9", name: "Talent Lvl 8 → 9", price: { php: 70, usd: 1.15 } },
              { id: "tal_asc_9_10", name: "Talent Lvl 9 → 10", price: { php: 95, usd: 1.55 } },
            ]
          },
          {
            name: "Farming & Artifacts",
            items: [
              { id: "farm_specialty", name: "Local Specialties (168 pcs)", price: { php: 60, usd: 1.00 } },
              { id: "farm_boss", name: "Boss Materials (46 pcs)", price: { php: 60, usd: 1.00 } },
              { id: "farm_ore", name: "Ore Materials (100 pcs)", price: { php: 50, usd: 0.85 } },
              { id: "farm_wood", name: "Wood Materials (100 pcs)", price: { php: 50, usd: 0.85 } },
              { id: "farm_crystal", name: "Crystal Core (100 pcs)", price: { php: 60, usd: 1.00 } },
              { id: "farm_artifact_7", name: "Artifact Farming (7 days)", price: { php: 150, usd: 3.00 } },
              { id: "farm_artifact_14", name: "Artifact Farming (14 days)", price: { php: 250, usd: 5.00 } },
              { id: "farm_artifact_30", name: "Artifact Farming (30 days)", price: { php: 500, usd: 10.00 } },
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
    description: "Endgame content, collectibles, events, and misc services",
    services: [
      {
        id: "other-services-nested",
        type: "nested-list",
        name: "Miscellaneous Services",
        description: "Select specific events, pulls, hunting, or endgame tasks",
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
            name: "Oculi Hunting (per piece)",
            items: [
              { id: "ocu_mond", name: "Mondstadt Oculi", price: { php: 2, usd: 0.032 }, isQuantity: true },
              { id: "ocu_liyue", name: "Liyue Oculi", price: { php: 2, usd: 0.032 }, isQuantity: true },
              { id: "ocu_inazuma", name: "Inazuma Oculi", price: { php: 2.5, usd: 0.04 }, isQuantity: true },
              { id: "ocu_sumeru", name: "Sumeru Oculi", price: { php: 2.5, usd: 0.04 }, isQuantity: true },
              { id: "ocu_fontaine", name: "Fontaine Oculi", price: { php: 3, usd: 0.048 }, isQuantity: true },
              { id: "ocu_natlan", name: "Natlan Oculi", price: { php: 3, usd: 0.048 }, isQuantity: true },
              { id: "ocu_nodkrai", name: "Nod-Krai Oculi", price: { php: 3, usd: 0.048 }, isQuantity: true },
            ]
          },
          {
            name: "Offerings Hunting (per piece)",
            items: [
              { id: "ofr_crimson", name: "Crimson Agate", price: { php: 2.5, usd: 0.04 }, isQuantity: true },
              { id: "ofr_lumenspar", name: "Lumenspar", price: { php: 2.5, usd: 0.04 }, isQuantity: true },
              { id: "ofr_purify", name: "Purify Plume", price: { php: 3, usd: 0.048 }, isQuantity: true },
              { id: "ofr_aranara", name: "Aranara", price: { php: 3, usd: 0.048 }, isQuantity: true },
              { id: "ofr_spirit", name: "Spirit Carp", price: { php: 3, usd: 0.048 }, isQuantity: true },
            ]
          },
          {
            name: "Echoes & Avatar Frames",
            items: [
              { id: "echo_echo", name: "Echoes (per echo)", price: { php: 75, usd: 1.60 }, isQuantity: true },
              { id: "echo_frame", name: "Avatar Frame", price: { php: 150, usd: 3.00 }, isQuantity: true },
            ]
          },
          {
            name: "Spiral Abyss",
            items: [
              { id: "abyss_f12", name: "Floor 12", price: { php: 120, usd: 2.40 } },
              { id: "abyss_f11", name: "Floor 11", price: { php: 80, usd: 1.60 } },
              { id: "abyss_f10", name: "Floor 10", price: { php: 60, usd: 1.20 } },
              { id: "abyss_f9", name: "Floor 9", price: { php: 40, usd: 0.65 } },
              { id: "abyss_9_12", name: "Floor 9 - 12 (fixed bundle)", price: { php: 250, usd: 5.00 } },
            ]
          },
          {
            name: "Abyss Corridor",
            items: [
              { id: "corridor_5_8", name: "Floor 5 - 8", price: { php: 15, usd: 2.40 } },
              { id: "corridor_1_4", name: "Floor 1 - 4", price: { php: 20, usd: 1.60 } },
              { id: "corridor_1_8", name: "Floor 1 - 8", price: { php: 120, usd: 1.20 } },
            ]
          },
          {
            name: "Edge of Survival",
            items: [
              { id: "eotl_half", name: "Half Clear (6 medals)", price: { php: 250, usd: 5.00 } },
              { id: "eotl_full", name: "Full Clear (12 medals)", price: { php: 500, usd: 10.00 } },
            ]
          },
          {
            name: "The Catch (Fishing)",
            items: [
              { id: "catch_r1", name: "The Catch R1", price: { php: 180, usd: 3.00 } },
              { id: "catch_r5", name: "The Catch R5", price: { php: 500, usd: 6.00 } },
              { id: "catch_refine", name: "Refinement Only", price: { php: 100, usd: 1.70 } },
            ]
          },
          {
            name: "Imaginarium Theater",
            items: [
              { id: "theo_lunar", name: "Lunar mode (12★)", price: { php: 350, usd: 7.00 } },
              { id: "theo_visionary", name: "Visionary mode (10★)", price: { php: 300, usd: 6.00 } },
              { id: "theo_hard", name: "Hard mode (8★)", price: { php: 250, usd: 5.00 } },
              { id: "theo_normal", name: "Normal mode (6★)", price: { php: 200, usd: 4.00 } },
              { id: "theo_easy", name: "Easy mode (4★)", price: { php: 150, usd: 3.00 } },
            ]
          },
          {
            name: "Stygian Onslaught",
            items: [
              { id: "sty_normal", name: "Normal / Advancing / Hard", price: { php: 60, usd: 1.20 } },
              { id: "sty_menacing", name: "Menacing", price: { php: 120, usd: 2.40 } },
              { id: "sty_fearless", name: "Fearless", price: { php: 150, usd: 2.60 } },
              { id: "sty_dire", name: "Dire", price: { php: 180, usd: 3.60 } },
              { id: "sty_direplus", name: "Dire +", price: { php: 250, usd: 5.00 } },
            ]
          },
          {
            name: "Disturbance Outbreak Claims",
            items: [
              { id: "outbreak_10", name: "10 days (whole phase 1)", price: { php: 100, usd: 1.60 } },
              { id: "outbreak_1", name: "1 day", price: { php: 15, usd: 0.40 } },
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
  price: PriceValue; 
}

export function buildReceiptItems(
  selections: ServiceSelection
): ReceiptLineItem[] {
  const items: ReceiptLineItem[] = [];
  
  for (const category of CATEGORIES) {
    for (const service of category.services) {
      
      // Clean Code: Handle hybrid nested-list rendering logic
      if (service.type === "nested-list" && service.groups) {
        for (const group of service.groups) {
          for (const item of group.items) {
            const val = selections[item.id] ?? 0;
            if (val > 0) {
              const basePhp = typeof item.price === "object" ? item.price.php : item.price;
              const baseUsd = typeof item.price === "object" ? item.price.usd : item.price / 60.75;

              const finalPrice = item.isQuantity 
                ? { php: basePhp * val, usd: baseUsd * val }
                : item.price;

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

const DEFAULT_CATEGORIES: Category[] = JSON.parse(JSON.stringify(CATEGORIES));

export function applyServicePriceOverrides(overrides: PriceOverrides): void {
  for (const category of CATEGORIES) {
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

export function restoreServiceDefaults(): void {
  const defaultsById = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]));
  for (const category of CATEGORIES) {
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

applyServicePriceOverrides(loadOverrides());