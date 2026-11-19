// src/pages/PriceEditor.tsx
//
// Private admin page (protected by middleware.ts) for editing the whole
// catalog: service cards, sections, items, exploration regions and prices.
// Edits are staged locally until "Save All", which validates and saves them to
// the server (api/prices.ts); the live site then updates for everyone.
//
// Supports both games: Genshin Impact (per-1% exploration) and Honkai: Star
// Rail (flat bundles). Top-level tabs are fixed in code.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Coins,
  Download,
  Layers,
  Map,
  Package,
  Plus,
  RotateCcw,
  Save,
  Undo2,
  Upload,
} from "lucide-react";
import {
  CATEGORIES,
  PRIMO_RESOURCE_DEFAULT_RATES,
  buildCategories,
  getPrimoResourceRates,
} from "../data/services";
import {
  EXPLORATION_REGIONS,
  buildRegions,
  getRegionBundlePrice,
  type ExplorationCurrency,
  type ExplorationRegion,
} from "../data/explorationRegions";
import { HSR_CATEGORIES, buildHsrCategories } from "../data/hsrServices";
import {
  emptyOverrides,
  parseImportedOverrides,
  restoreCatalog,
  saveCatalog,
  type PriceOverrides,
  GENSHIN_STORAGE_KEY,
  GENSHIN_LEGACY_STORAGE_KEY,
  HSR_STORAGE_KEY,
} from "../data/priceStorage";
import {
  CATALOG_SCHEMA_VERSION,
  PROTECTED_ITEM_IDS,
  collectCatalogIds,
  makeCatalogId,
  normalizeCatalog,
  type Catalog,
  type CatalogCategory,
  type CatalogRegion,
} from "../data/catalog";
import {
  RatePair,
  RegionListEditor,
  ServiceCardEditor,
  type CatalogEditContext,
} from "../components/admin/CatalogEditor";

type GameKey = "genshin" | "hsr";

interface EditorGameConfig {
  key: GameKey;
  label: string;
  shortLabel: string;
  storageKey: string;
  filePrefix: string;
  hasExplorationRates: boolean;
  hasPrimoRates: boolean;
  liveCatalog: () => Catalog;
  catalogFromOverrides: (o: PriceOverrides) => Catalog;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

// Region bundles are stored explicitly so editing sub-areas doesn't silently move them.
const withBundles = (regions: ExplorationRegion[]): CatalogRegion[] =>
  regions.map((region) => ({ ...region, bundlePrice: getRegionBundlePrice(region) }));

function makeCatalog(
  game: GameKey,
  categories: unknown,
  regions: CatalogRegion[] = [],
  primoResourceRates: Catalog["primoResourceRates"] = {}
): Catalog {
  // The data files use looser types; normalizeCatalog checks the real shape on save.
  return { schemaVersion: CATALOG_SCHEMA_VERSION, game, categories: categories as CatalogCategory[], regions, primoResourceRates };
}

const GAME_CONFIGS: Record<GameKey, EditorGameConfig> = {
  genshin: {
    key: "genshin",
    label: "Genshin Impact",
    shortLabel: "Genshin",
    storageKey: GENSHIN_STORAGE_KEY,
    filePrefix: "gi",
    hasExplorationRates: true,
    hasPrimoRates: true,
    liveCatalog: () =>
      makeCatalog("genshin", clone(CATEGORIES), withBundles(clone(EXPLORATION_REGIONS)), getPrimoResourceRates()),
    catalogFromOverrides: (o) =>
      makeCatalog("genshin", buildCategories(o), withBundles(buildRegions(o)), {
        ...PRIMO_RESOURCE_DEFAULT_RATES,
        ...o.primoResourceRates,
      }),
  },
  hsr: {
    key: "hsr",
    label: "Honkai: Star Rail",
    shortLabel: "Star Rail",
    storageKey: HSR_STORAGE_KEY,
    filePrefix: "hsr",
    hasExplorationRates: false,
    hasPrimoRates: false,
    liveCatalog: () => makeCatalog("hsr", clone(HSR_CATEGORIES)),
    catalogFromOverrides: (o) => makeCatalog("hsr", buildHsrCategories(o)),
  },
};

// Anything that would show as "Free" on the pricelist. Items named "free" on purpose are skipped.
function listFreeEntries(catalog: Catalog): string[] {
  const isZero = (p: { php: number; usd: number }) => p.php === 0 && p.usd === 0;
  const entries: string[] = [];
  for (const c of catalog.categories) {
    for (const s of c.services) {
      for (const g of s.groups) {
        for (const item of g.items) {
          if (isZero(item.price) && !/free/i.test(item.name)) entries.push(`${c.label} › ${g.name} › ${item.name}`);
        }
      }
    }
  }
  for (const r of catalog.regions) {
    for (const a of r.subAreas) if (isZero(a.pricePerPct)) entries.push(`Exploration › ${r.name} › ${a.name}`);
    if (isZero(getRegionBundlePrice(r))) entries.push(`Exploration › ${r.name} (full bundle)`);
  }
  return entries;
}

function downloadJson(fileName: string, data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 bg-white flex items-center gap-3 transition-all"
      style={{
        border: highlight ? "1px solid rgba(77,122,153,0.45)" : "1px solid #e2eaef",
        boxShadow: highlight ? "0 4px 16px rgba(77,122,153,0.12)" : "0 2px 10px rgba(23,34,44,0.04)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: highlight ? "rgba(77,122,153,0.14)" : "rgba(77,122,153,0.08)", color: "#4d7a99" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: "#627789" }}>{label}</p>
        <p className="font-mono text-[18px] font-bold leading-tight" style={{ color: "#17222c" }}>{value}</p>
      </div>
    </div>
  );
}

function GameSwitch({ game, onSwitch }: { game: GameKey; onSwitch: (g: GameKey) => void }) {
  return (
    <div
      className="flex items-center p-1 rounded-full shrink-0"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,122,153,0.3)" }}
    >
      {(Object.keys(GAME_CONFIGS) as GameKey[]).map((key) => {
        const isActive = game === key;
        return (
          <button
            key={key}
            onClick={() => onSwitch(key)}
            className="flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap text-[11px]"
            style={
              isActive
                ? { background: "linear-gradient(135deg, #4d7a99, #8fb8d1)", color: "#0d1420", fontWeight: 700 }
                : { background: "transparent", color: "#a9bccb", fontWeight: 600 }
            }
          >
            {GAME_CONFIGS[key].shortLabel}
          </button>
        );
      })}
    </div>
  );
}

function PriceEditorForGame({
  game,
  onSwitchGame,
}: {
  game: EditorGameConfig;
  onSwitchGame: (g: GameKey) => void;
}) {
  const [catalog, setCatalog] = useState<Catalog>(game.liveCatalog);
  const { categories, regions, primoResourceRates: primoRates } = catalog;
  const [activeTab, setActiveTab] = useState<string>(() => catalog.categories[0].id);
  const [savedMessage, setSavedMessage] = useState(() => {
    if (
      game.key === "genshin" &&
      typeof localStorage !== "undefined" &&
      !localStorage.getItem(game.storageKey) &&
      localStorage.getItem(GENSHIN_LEGACY_STORAGE_KEY)
    ) {
      return "Legacy v1 pricing was found but not loaded because its exploration formula is incompatible with the current calculator.";
    }
    return "";
  });

  const flash = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(""), 3000);
  };

  // Every edit goes through here: copy, change, replace (keeps React state immutable).
  const edit = (fn: (draft: Catalog) => void) =>
    setCatalog((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });

  const editCtx: CatalogEditContext = {
    protectedIds: PROTECTED_ITEM_IDS[game.key],
    newId: (prefix) => makeCatalogId(prefix, collectCatalogIds(catalog)),
  };

  const updateRegionBundle = (regionId: string, sub: ExplorationCurrency, value: number) => {
    if (!Number.isFinite(value) || value < 0) return;
    edit((d) => {
      const region = d.regions.find((r) => r.id === regionId);
      if (region) region.bundlePrice = { ...getRegionBundlePrice(region), [sub]: Math.round(value * 100) / 100 };
    });
  };

  const updatePrimoRate = (key: string, sub: "php" | "usd", value: number) =>
    edit((d) => {
      d.primoResourceRates[key] = { ...PRIMO_RESOURCE_DEFAULT_RATES[key], ...d.primoResourceRates[key], [sub]: value };
    });

  // Unsaved-change tracking: compare what's on screen with what was last saved/loaded.
  // null = "adopt the next render's state as saved" (after save/reset/undo replace the state).
  const currentSnapshot = JSON.stringify(catalog);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(currentSnapshot);
  const isDirty = savedSnapshot !== null && currentSnapshot !== savedSnapshot;

  useEffect(() => {
    if (savedSnapshot === null) setSavedSnapshot(currentSnapshot);
  }, [savedSnapshot, currentSnapshot]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const confirmDiscard = () =>
    !isDirty || confirm(`You have unsaved ${game.label} changes. Leave without saving?`);

  const alertSaveFailed = (error: unknown) =>
    alert(`${error instanceof Error ? error.message : "Saving failed"}. Nothing was changed on the live site; please try again.`);

  const handleSaveAll = async () => {
    const result = normalizeCatalog(catalog, game.key);
    if (!result.ok) {
      alert(`Can't save yet: ${result.error}.`);
      return;
    }
    const free = listFreeEntries(result.catalog);
    const freeList = free.slice(0, 12).join("\n") + (free.length > 12 ? `\n…and ${free.length - 12} more` : "");
    if (free.length > 0 && !confirm(`These will show as "Free" on the pricelist:\n\n${freeList}\n\nSave anyway?`)) return;
    try {
      await saveCatalog(result.catalog);
    } catch (error) {
      alertSaveFailed(error);
      return;
    }
    setCatalog(result.catalog);
    setSavedSnapshot(null);
    flash(`Saved! ${game.label} changes are live on the dashboard and pricelist.`);
  };

  const handleReset = async () => {
    if (
      !confirmDiscard() ||
      !confirm(`Reset ALL ${game.label} services and prices to the built-in defaults? Items you added are removed. "Undo last save" brings them back.`)
    )
      return;
    const defaults = game.catalogFromOverrides(emptyOverrides());
    try {
      await saveCatalog(defaults);
    } catch (error) {
      alertSaveFailed(error);
      return;
    }
    setCatalog(defaults);
    setSavedSnapshot(null);
    flash("Reset to defaults.");
  };

  const handleUndo = async () => {
    if (!confirmDiscard() || !confirm(`Undo the last save? The live ${game.label} site goes back to the version before it.`)) return;
    try {
      await restoreCatalog(game.key);
    } catch (error) {
      alert(`Undo failed: ${error instanceof Error ? error.message : "unknown error"}.`);
      return;
    }
    setCatalog(game.liveCatalog());
    setSavedSnapshot(null);
    flash("Last save undone.");
  };

  // Exports what's live (saved), not unsaved edits.
  const handleExport = () =>
    downloadJson(`${game.filePrefix}-catalog-${new Date().toISOString().slice(0, 10)}.json`, game.liveCatalog());

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result);
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // not JSON: falls through to the error below
      }
      let imported: Catalog | null = null;
      if ((parsed as { schemaVersion?: unknown } | null)?.schemaVersion === CATALOG_SCHEMA_VERSION) {
        const result = normalizeCatalog(parsed, game.key);
        if (!result.ok) {
          alert(`Import failed: ${result.error}.`);
          return;
        }
        imported = result.catalog;
      } else {
        // Older price-only exports still work.
        const overrides = parseImportedOverrides(raw, game.storageKey);
        if (overrides) imported = game.catalogFromOverrides(overrides);
      }
      if (!imported) {
        alert("Import failed. Select a catalog or price export for this game.");
        return;
      }
      setCatalog(imported);
      flash("Imported. Review it, then click Save All to publish.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const currentCategoryIndex = categories.findIndex((c) => c.id === activeTab);
  const currentCategory = currentCategoryIndex >= 0 ? categories[currentCategoryIndex] : undefined;
  const savedMessageIsWarning = savedMessage.startsWith("Legacy v1");
  const tabs = [
    ...categories.map((c) => ({ id: c.id, label: c.label })),
    ...(game.hasExplorationRates ? [{ id: "exploration-rates", label: "Exploration Rates" }] : []),
    ...(game.hasPrimoRates ? [{ id: "primo-resource-rates", label: "Primo Resource Rates" }] : []),
  ];

  const totalServiceCount = categories.reduce((sum, c) => sum + c.services.length, 0);
  const totalItemCount = categories.reduce(
    (sum, c) => sum + c.services.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0), 0),
    0
  );

  return (
    <div
      className="min-h-screen text-[#17222c] font-sans flex flex-col"
      style={{ background: "linear-gradient(180deg, #f2f6f9 0%, #e8eef3 100%)" }}
    >
      <title>Price Editor — ZBPS</title>
      <header
        className="sticky top-0 z-50"
        style={{ background: "rgba(13, 20, 32, 0.94)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(77, 122, 153, 0.25)" }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/"
                onClick={(event) => {
                  if (!confirmDiscard()) event.preventDefault();
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(77,122,153,0.3)", color: "#a9c6d8" }}
              >
                <ArrowLeft size={15} />
                Dashboard
              </Link>
              <GameSwitch
                game={game.key}
                onSwitch={(next) => {
                  if (next !== game.key && confirmDiscard()) onSwitchGame(next);
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="font-mono text-[16px] font-bold tracking-[0.15em] uppercase whitespace-nowrap" style={{ color: "#eef3f6" }}>
                    Price Editor
                  </h1>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0"
                    style={{ background: "rgba(179,48,63,0.18)", border: "1px solid rgba(179,48,63,0.4)", color: "#e08a95" }}
                  >
                    Admin
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 font-medium truncate" style={{ color: "#7891a3" }}>
                  {game.label} — add, edit &amp; remove services, prices and map areas · changes go live after Save All
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(77,122,153,0.3)", color: "#a9bccb", background: "rgba(255,255,255,0.04)" }}
              >
                <Download size={14} />
                Export
              </button>
              <label
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(77,122,153,0.3)", color: "#a9bccb", background: "rgba(255,255,255,0.04)" }}
              >
                <Upload size={14} />
                Import
                <input type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
              </label>
              <button
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(77,122,153,0.3)", color: "#a9bccb", background: "rgba(255,255,255,0.04)" }}
              >
                <Undo2 size={14} />
                Undo last save
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(179,48,63,0.4)", color: "#e08a95", background: "rgba(179,48,63,0.06)" }}
              >
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                onClick={handleSaveAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-transform hover:-translate-y-px"
                style={{ background: "linear-gradient(135deg, #4d7a99, #8fb8d1)", color: "#0d1420", boxShadow: "0 4px 14px rgba(77,122,153,0.35)" }}
              >
                <Save size={14} />
                Save All
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <nav
              className="flex items-center p-1 rounded-xl overflow-x-auto w-full"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(77,122,153,0.22)", scrollbarWidth: "none" }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center justify-center px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 text-[13px]"
                    style={
                      isActive
                        ? { background: "linear-gradient(135deg, #4d7a99, #8fb8d1)", color: "#0d1420", fontWeight: 700, boxShadow: "0 2px 8px rgba(77,122,153,0.3)" }
                        : { background: "transparent", color: "#a9bccb", fontWeight: 500 }
                    }
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div
              className="flex items-center gap-1.5 shrink-0 text-[10px] font-semibold"
              style={{ color: isDirty ? "#f5c26b" : "#8fa4b3" }}
              role="status"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isDirty ? "#f5c26b" : "#8fb8d1", boxShadow: `0 0 6px ${isDirty ? "rgba(245,194,107,0.8)" : "rgba(143,184,209,0.8)"}` }}
              />
              {isDirty ? "Unsaved changes — click “Save All”" : "All changes saved"}
            </div>
          </div>
        </div>
      </header>

      {savedMessage && (
        <div key={savedMessage} className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 animate-fade-up">
          <div
            className="flex items-center gap-2.5 text-[13px] font-semibold rounded-xl px-4 py-3 bg-white"
            style={savedMessageIsWarning
              ? { border: "1px solid rgba(217,119,6,0.4)", color: "#b45309", boxShadow: "0 10px 30px rgba(217,119,6,0.12)" }
              : { border: "1px solid rgba(16,185,129,0.4)", color: "#0f9d6a", boxShadow: "0 10px 30px rgba(16,185,129,0.15)" }}
          >
            {savedMessageIsWarning ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            {savedMessage}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col gap-6 flex-1">
        <div className={`grid grid-cols-2 gap-3 ${game.hasExplorationRates ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          <StatCard icon={<Layers size={16} />} label="Categories" value={categories.length} />
          <StatCard icon={<Package size={16} />} label="Services" value={totalServiceCount} />
          {game.hasExplorationRates ? (
            <StatCard icon={<Map size={16} />} label="Exploration Regions" value={regions.length} />
          ) : (
            <StatCard icon={<Map size={16} />} label="Exploration" value="Bundles" />
          )}
          <StatCard icon={<Coins size={16} />} label="Items" value={totalItemCount} />
        </div>

        {game.hasPrimoRates && activeTab === "primo-resource-rates" ? (
          <section key="primo-resource-rates" className="animate-fade-up bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef", boxShadow: "0 4px 24px rgba(23,34,44,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(180deg, #f7fafc, #f0f5f9)", borderBottom: "1px solid #e2eaef" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                <Coins size={16} style={{ color: "#4d7a99" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[15px]" style={{ color: "#17222c" }}>Primo Hunt — Resource Level Rates</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#56697a" }}>
                  Flat rate per 10 pulls — when a resource level is selected it replaces the base pull pricing (Low = base pricing)
                </p>
              </div>
            </div>

            <div
              className="hidden md:grid items-center gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: "minmax(0,1fr) 220px", background: "#eef3f6", borderBottom: "1px solid #e2eaef", color: "#56697a" }}
            >
              <span>Resource Level</span>
              <span className="text-right">Rate per 10 pulls</span>
            </div>

            <div className="flex flex-col">
              {[
                { key: "mid", label: "Mid (Mid exploration / Mid resource)" },
                { key: "high", label: "High (High exploration / Low resource)" },
              ].map((row, ri) => {
                const rate = primoRates[row.key] ?? PRIMO_RESOURCE_DEFAULT_RATES[row.key];
                return (
                  <div
                    key={row.key}
                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-5 py-4 ${ri !== 1 ? "border-b" : ""} hover:bg-[#f7fafc] transition-colors`}
                    style={{ borderColor: "#eef3f6" }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 md:flex-1 shrink-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#4d7a99,#8fb8d1)" }} />
                      <span className="font-bold text-[14px] truncate" style={{ color: "#17222c" }}>{row.label}</span>
                    </div>
                    <div className="flex flex-col gap-1 md:flex-none md:w-[220px] md:shrink-0">
                      <RatePair
                        valuePhp={rate.php}
                        valueUsd={rate.usd}
                        onPhp={(v) => updatePrimoRate(row.key, "php", v)}
                        onUsd={(v) => updatePrimoRate(row.key, "usd", v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : game.hasExplorationRates && activeTab === "exploration-rates" ? (
          <section key="exploration-rates" className="animate-fade-up bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef", boxShadow: "0 4px 24px rgba(23,34,44,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(180deg, #f7fafc, #f0f5f9)", borderBottom: "1px solid #e2eaef" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                <Map size={16} style={{ color: "#4d7a99" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[15px]" style={{ color: "#17222c" }}>Exploration Rates</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#56697a" }}>
                  Per-1% price for each sub-area (total = missing % × rate). Add, rename, reorder or remove regions and sub-areas here.
                </p>
              </div>
            </div>

            <RegionListEditor
              regions={regions}
              ctx={editCtx}
              onChange={(next) => edit((d) => { d.regions = next; })}
            />
          </section>
        ) : game.hasExplorationRates && currentCategory && currentCategory.id === "exploration" ? (
          <section key="exploration-bundles" className="animate-fade-up bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef", boxShadow: "0 4px 24px rgba(23,34,44,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(180deg, #f7fafc, #f0f5f9)", borderBottom: "1px solid #e2eaef" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                <Map size={16} style={{ color: "#4d7a99" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[15px]" style={{ color: "#17222c" }}>World Exploration — Region Bundles</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#56697a" }}>
                  Edit the full-region bundle independently from the sub-area rates
                </p>
              </div>
            </div>

            <div
              className="hidden md:grid items-center gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: "minmax(0,1fr) 220px", background: "#eef3f6", borderBottom: "1px solid #e2eaef", color: "#56697a" }}
            >
              <span>Region</span>
              <span className="text-right">Bundle · 100% Region</span>
            </div>

            <div className="flex flex-col">
              {regions.map((region, ri) => (
                <div
                  key={region.id}
                  className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-5 py-4 ${ri !== regions.length - 1 ? "border-b" : ""} hover:bg-[#f7fafc] transition-colors`}
                  style={{ borderColor: "#eef3f6" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 md:flex-1 shrink-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#4d7a99,#8fb8d1)" }} />
                    <span className="font-bold text-[14px] truncate" style={{ color: "#17222c" }}>{region.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shrink-0" style={{ color: "#627789", background: "#eef3f6" }}>
                      {region.tag}
                    </span>
                    <span className="text-[10px] font-semibold shrink-0" style={{ color: "#627789" }}>{region.subAreas.length} area{region.subAreas.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex flex-col gap-1 md:flex-none md:w-[220px] md:shrink-0">
                    <RatePair
                      valuePhp={getRegionBundlePrice(region).php}
                      valueUsd={getRegionBundlePrice(region).usd}
                      onPhp={(v) => updateRegionBundle(region.id, "php", v)}
                      onUsd={(v) => updateRegionBundle(region.id, "usd", v)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : currentCategory ? (
          <section key={currentCategory.id} className="animate-fade-up flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1 self-stretch min-h-10 rounded-full" style={{ background: "linear-gradient(180deg,#4d7a99,#8fb8d1)" }} />
              <div>
                <h2 className="text-[20px] font-extrabold tracking-tight" style={{ color: "#17222c" }}>{currentCategory.label}</h2>
                <p className="text-[13px] font-medium mt-0.5" style={{ color: "#5c7284" }}>{currentCategory.description}</p>
              </div>
            </div>

            {currentCategory.services.map((service, si) => (
              <ServiceCardEditor
                key={service.id}
                service={service}
                index={si}
                count={currentCategory.services.length}
                ctx={editCtx}
                onChange={(next) => edit((d) => { d.categories[currentCategoryIndex].services[si] = next; })}
                onMove={(dir) =>
                  edit((d) => {
                    const list = d.categories[currentCategoryIndex].services;
                    const target = si + dir;
                    if (target >= 0 && target < list.length) [list[si], list[target]] = [list[target], list[si]];
                  })
                }
                onDelete={() => edit((d) => { d.categories[currentCategoryIndex].services.splice(si, 1); })}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                edit((d) => {
                  d.categories[currentCategoryIndex].services.push({
                    id: editCtx.newId("svc"),
                    type: "nested-list",
                    name: "New service",
                    description: "",
                    basePrice: 0,
                    groups: [{ name: "New section", items: [] }],
                  });
                })
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-bold transition-colors hover:bg-white"
              style={{ color: "#4d7a99", border: "1px dashed #b8cad6" }}
            >
              <Plus size={15} aria-hidden="true" />
              Add service card to {currentCategory.label}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export function PriceEditor() {
  const [game, setGame] = useState<GameKey>("genshin");
  return <PriceEditorForGame key={game} game={GAME_CONFIGS[game]} onSwitchGame={setGame} />;
}