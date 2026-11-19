// Self-check for the catalog validator. Run: node src/data/catalog.check.ts
import assert from "node:assert/strict";
import { CATALOG_TAB_IDS, PRIMO_ITEM_IDS, normalizeCatalog, isValidCatalogId, makeCatalogId, type Catalog } from "./catalog.ts";

const item = (id: string, extra = {}) => ({ id, name: id, price: { php: 10, usd: 0.2 }, ...extra });

function validGenshin(): Catalog {
  const categories = CATALOG_TAB_IDS.genshin.map((tabId) => ({ id: tabId, label: tabId, emoji: "", description: "", services: [] as Catalog["categories"][number]["services"] }));
  categories[4].services.push({
    id: "other-services-nested",
    type: "nested-list",
    name: "Misc",
    description: "",
    basePrice: 0,
    groups: [
      { name: "Primo Hunt", items: PRIMO_ITEM_IDS.map((primoId) => item(primoId)) },
      ...["spring", "canopy", "echoes", "feather", "nightwind"].map((tribe) => ({
        name: tribe,
        items: [item(`tc_${tribe}_bundle`, { isBundle: true }), item(`tc_${tribe}_1`)],
      })),
    ],
  });
  return {
    schemaVersion: 3,
    game: "genshin",
    categories,
    regions: [{ id: "snezhnaya", name: "Snezhnaya", tag: "Patch 7.0", subAreas: [{ id: "wingspan-peak", name: "Wingspan Peak", pricePerPct: { php: 4, usd: 0.07 } }] }],
    primoResourceRates: { mid: { php: 300, usd: 5 } },
  };
}

function rejects(mutate: (c: Catalog) => void, expected: RegExp) {
  const c = validGenshin();
  mutate(c);
  const result = normalizeCatalog(JSON.parse(JSON.stringify(c)), "genshin");
  assert.equal(result.ok, false, `expected rejection matching ${expected}`);
  if (!result.ok) assert.match(result.error, expected);
}

// A valid catalog passes and comes back clean.
const ok = normalizeCatalog(validGenshin(), "genshin");
assert.ok(ok.ok, ok.ok ? "" : ok.error);

const misc = (c: Catalog) => c.categories[4].services[0];
rejects((c) => misc(c).groups[2].items[1].id = "tc_spring_1", /Duplicate id/);
rejects((c) => misc(c).groups[1].items[1].id = "bad__id", /invalid id/);
rejects((c) => misc(c).groups[1].items[1].id = "compass_x", /invalid id/);
rejects((c) => misc(c).groups[0].items.pop(), /Protected item/);
rejects((c) => misc(c).groups[1].items[1] = item("tc_spring_1", { isBundle: true }), /bundle setting/);
rejects((c) => misc(c).groups[0].items[0] = item("hunt_primo_10", { isQuantity: true }), /checkbox/);
rejects((c) => c.categories[2].id = "renamed", /Tabs can't/);
rejects((c) => c.categories.pop(), /Tabs can't/);
rejects((c) => misc(c).groups[1].items[1].name = "   ", /empty/);
rejects((c) => misc(c).groups[1].items[1].price.php = -1, /≥ 0/);
rejects((c) => c.categories[1].services.push({ ...misc(c), id: "x" }), /World Exploration/);
rejects((c) => c.regions[0].subAreas.push({ ...c.regions[0].subAreas[0] }), /same id/);
rejects((c) => (c as { game: string }).game = "hsr", /different game/);
rejects((c) => misc(c).groups[1].items[1].name = "x".repeat(500_000), /too large/);

assert.ok(!isValidCatalogId("__proto__") && !isValidCatalogId("Upper") && isValidCatalogId("aq_sne_5"));
const taken = new Set<string>();
assert.ok(isValidCatalogId(makeCatalogId("i", taken)) && taken.size === 1);

console.log("catalog checks passed");
