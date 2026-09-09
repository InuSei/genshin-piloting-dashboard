// src/pages/PriceEditor.tsx
//
// Private admin page for editing prices. Not linked from anywhere by
// default — reach it directly at /admin/prices. Edits are staged locally
// until you hit "Save All", which persists them to localStorage and
// applies them live to the running app (App.tsx and ClientPricelist.tsx
// read from the same CATEGORIES / EXPLORATION_REGIONS objects, so no
// changes were needed there).

import { useState } from "react";
import { Save, RotateCcw, Download, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CATEGORIES,
  applyServicePriceOverrides,
  restoreServiceDefaults,
  type Category,
} from "../data/services";
import {
  EXPLORATION_REGIONS,
  applyExplorationPriceOverrides,
  restoreExplorationDefaults,
  type ExplorationRegion,
} from "../data/explorationRegions";
import {
  loadOverrides,
  saveOverrides,
  clearOverrides,
  exportOverridesAsFile,
  parseImportedOverrides,
  type PriceOverrides,
} from "../data/priceStorage";

function cloneCategories(): Category[] {
  return JSON.parse(JSON.stringify(CATEGORIES));
}
function cloneRegions(): ExplorationRegion[] {
  return JSON.parse(JSON.stringify(EXPLORATION_REGIONS));
}

export function PriceEditor() {
  const [categories, setCategories] = useState<Category[]>(cloneCategories);
  const [regions, setRegions] = useState<ExplorationRegion[]>(cloneRegions);
  const [activeTab, setActiveTab] = useState<string>(categories[0].id);
  const [savedMessage, setSavedMessage] = useState("");

  const flash = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const updateNestedItemPrice = (
    categoryId: string,
    serviceId: string,
    groupIdx: number,
    itemIdx: number,
    field: "php" | "usd",
    value: number
  ) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          services: c.services.map((s) => {
            if (s.id !== serviceId || !s.groups) return s;
            return {
              ...s,
              groups: s.groups.map((g, gi) => {
                if (gi !== groupIdx) return g;
                return {
                  ...g,
                  items: g.items.map((it, ii) => {
                    if (ii !== itemIdx) return it;
                    const price =
                      typeof it.price === "object"
                        ? it.price
                        : { php: it.price, usd: it.price };
                    return { ...it, price: { ...price, [field]: value } };
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const updateServiceBasePrice = (
    categoryId: string,
    serviceId: string,
    value: number
  ) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        return {
          ...c,
          services: c.services.map((s) =>
            s.id === serviceId ? { ...s, basePrice: value } : s
          ),
        };
      })
    );
  };

  const updateRegionRate = (
    regionId: string,
    field: "perAreaPrice" | "pricePerPct",
    sub: "php" | "usd",
    value: number
  ) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.id === regionId ? { ...r, [field]: { ...r[field], [sub]: value } } : r
      )
    );
  };

  const buildOverridesFromState = (): PriceOverrides => {
    const overrides: PriceOverrides = {
      serviceBase: {},
      nestedItems: {},
      explorationRegions: {},
    };
    for (const c of categories) {
      for (const s of c.services) {
        if (s.type === "nested-list" && s.groups) {
          for (const g of s.groups) {
            for (const it of g.items) {
              const price =
                typeof it.price === "object"
                  ? it.price
                  : { php: it.price, usd: it.price };
              overrides.nestedItems[it.id] = price;
            }
          }
        } else {
          overrides.serviceBase[s.id] = s.basePrice;
        }
      }
    }
    for (const r of regions) {
      overrides.explorationRegions[r.id] = {
        perAreaPrice: r.perAreaPrice,
        pricePerPct: r.pricePerPct,
      };
    }
    return overrides;
  };

  const handleSaveAll = () => {
    const overrides = buildOverridesFromState();
    saveOverrides(overrides);
    applyServicePriceOverrides(overrides);
    applyExplorationPriceOverrides(overrides);
    flash("Saved! Changes are live on the dashboard and pricelist.");
  };

  const handleReset = () => {
    if (
      !confirm(
        "Reset ALL prices back to the original defaults? This clears your saved edits."
      )
    )
      return;
    clearOverrides();
    restoreServiceDefaults();
    restoreExplorationDefaults();
    setCategories(cloneCategories());
    setRegions(cloneRegions());
    flash("Reset to defaults.");
  };

  const handleExport = () => exportOverridesAsFile(loadOverrides());

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImportedOverrides(String(reader.result));
      if (!parsed) {
        alert("That file doesn't look like a valid price export.");
        return;
      }
      saveOverrides(parsed);
      applyServicePriceOverrides(parsed);
      applyExplorationPriceOverrides(parsed);
      setCategories(cloneCategories());
      setRegions(cloneRegions());
      flash("Import applied.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const currentCategory = categories.find((c) => c.id === activeTab);
  const tabs = [
    ...categories.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` })),
    { id: "exploration-rates", label: "🗺 Exploration Rates" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto w-full px-6 pt-5 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-mono text-[16px] font-bold text-[#1e3a5f] tracking-[0.15em] uppercase">
                  Price Editor
                </h1>
                <p className="text-[11px] font-bold text-[#6082a6] tracking-widest uppercase">
                  Admin Only
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50"
              >
                <Download size={14} /> Export
              </button>
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 cursor-pointer">
                <Upload size={14} /> Import
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={handleSaveAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5b9ff6] text-white text-[13px] font-bold hover:bg-[#4a8fe6]"
              >
                <Save size={14} /> Save All
              </button>
            </div>
          </div>

          <nav
            className="flex items-center p-1.5 rounded-full bg-[#f1f5f9] overflow-x-auto border border-slate-200 w-full"
            style={{ scrollbarWidth: "none" }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center justify-center px-4 py-2 rounded-full transition-all whitespace-nowrap shrink-0 text-[13px]"
                  style={
                    isActive
                      ? { background: "#5b9ff6", color: "#fff", fontWeight: 700 }
                      : { background: "transparent", color: "#64748b", fontWeight: 500 }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {savedMessage && (
        <div className="max-w-5xl mx-auto w-full px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold rounded-lg px-4 py-2.5">
            {savedMessage}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col gap-6 flex-1">
        {activeTab === "exploration-rates" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="hidden md:flex items-center p-4 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-1/4">Region</div>
              <div className="w-1/4 text-right pr-6">Per Area (0–40%)</div>
              <div className="w-1/4 text-right pr-6">Per 1% (41–100%)</div>
            </div>
            {regions.map((region) => (
              <div
                key={region.id}
                className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-slate-100 last:border-b-0"
              >
                <div className="md:w-1/4 font-bold text-[14px] text-[#1e3a5f]">
                  {region.name}
                </div>
                <div className="md:w-1/4 flex items-center gap-1.5">
                  <span className="text-[12px] text-slate-400 shrink-0">₱</span>
                  <input
                    type="number"
                    value={region.perAreaPrice.php}
                    onChange={(e) =>
                      updateRegionRate(region.id, "perAreaPrice", "php", Number(e.target.value))
                    }
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] font-mono"
                  />
                  <span className="text-[12px] text-slate-400 shrink-0">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={region.perAreaPrice.usd}
                    onChange={(e) =>
                      updateRegionRate(region.id, "perAreaPrice", "usd", Number(e.target.value))
                    }
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] font-mono"
                  />
                </div>
                <div className="md:w-1/4 flex items-center gap-1.5">
                  <span className="text-[12px] text-slate-400 shrink-0">₱</span>
                  <input
                    type="number"
                    value={region.pricePerPct.php}
                    onChange={(e) =>
                      updateRegionRate(region.id, "pricePerPct", "php", Number(e.target.value))
                    }
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] font-mono"
                  />
                  <span className="text-[12px] text-slate-400 shrink-0">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={region.pricePerPct.usd}
                    onChange={(e) =>
                      updateRegionRate(region.id, "pricePerPct", "usd", Number(e.target.value))
                    }
                    className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : currentCategory ? (
          <div className="flex flex-col gap-6">
            {currentCategory.services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-[#1e3a5f] text-[16px]">{service.name}</h3>
                </div>

                {service.type === "nested-list" && service.groups ? (
                  <div className="flex flex-col gap-6">
                    {service.groups.map((group, gi) => (
                      <div key={group.name} className="flex flex-col gap-2">
                        <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                          {group.name}
                        </h4>
                        {group.items.map((item, ii) => {
                          const price =
                            typeof item.price === "object"
                              ? item.price
                              : { php: item.price, usd: item.price };
                          return (
                            <div
                              key={item.id}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-b-0"
                            >
                              <span className="text-[13px] font-medium text-slate-600">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[12px] text-slate-400">₱</span>
                                <input
                                  type="number"
                                  value={price.php}
                                  onChange={(e) =>
                                    updateNestedItemPrice(
                                      currentCategory.id,
                                      service.id,
                                      gi,
                                      ii,
                                      "php",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-24 border border-slate-200 rounded-md px-2 py-1 text-[13px] font-mono"
                                />
                                <span className="text-[12px] text-slate-400">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={price.usd}
                                  onChange={(e) =>
                                    updateNestedItemPrice(
                                      currentCategory.id,
                                      service.id,
                                      gi,
                                      ii,
                                      "usd",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 border border-slate-200 rounded-md px-2 py-1 text-[13px] font-mono"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                      Base Rate (₱)
                    </span>
                    <input
                      type="number"
                      value={service.basePrice}
                      onChange={(e) =>
                        updateServiceBasePrice(
                          currentCategory.id,
                          service.id,
                          Number(e.target.value)
                        )
                      }
                      className="w-28 border border-slate-200 rounded-md px-2 py-1.5 text-[14px] font-mono"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
