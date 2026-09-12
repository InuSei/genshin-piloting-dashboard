// src/pages/PriceEditor.tsx
//
// Private admin page for editing prices. Not linked from anywhere by
// default — reach it directly at /admin/prices. Edits are staged locally
// until you hit "Save All", which persists them to localStorage and
// applies them live to the running app.

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  Download,
  Layers,
  Map,
  Package,
  RotateCcw,
  Save,
  Tag,
  Upload,
} from "lucide-react";
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

const TYPE_META: Record<string, { label: string; background: string; border: string; color: string }> = {
  checkbox: { label: "Add-on", background: "rgba(77, 122, 153, 0.1)", border: "rgba(77, 122, 153, 0.25)", color: "#4d7a99" },
  quantity: { label: "Per Unit", background: "rgba(143, 184, 209, 0.12)", border: "rgba(143, 184, 209, 0.3)", color: "#5c85a0" },
  "nested-list": { label: "Grouped Items", background: "rgba(94, 137, 170, 0.1)", border: "rgba(94, 137, 170, 0.28)", color: "#5c89a8" },
};

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? TYPE_META.checkbox;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0"
      style={{ background: meta.background, border: `1px solid ${meta.border}`, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function CurrencyInput({
  value,
  onChange,
  step,
  className = "flex-1",
}: {
  value: number;
  onChange: (v: number) => void;
  step?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ minWidth: 0 }}>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-2 text-[13px] font-mono font-semibold bg-white rounded-lg outline-none transition-all focus:border-[#4d7a99] focus:ring-2 focus:ring-[rgba(77,122,153,0.18)]"
        style={{ border: "1px solid #cfdce4", color: "#17222c" }}
      />
    </div>
  );
}

function RatePair({
  valuePhp,
  valueUsd,
  onPhp,
  onUsd,
}: {
  valuePhp: number;
  valueUsd: number;
  onPhp: (v: number) => void;
  onUsd: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[12px] font-bold shrink-0" style={{ color: "#9db0bc" }}>₱</span>
      <CurrencyInput value={valuePhp} onChange={onPhp} />
      <span className="text-[12px] font-bold shrink-0" style={{ color: "#9db0bc" }}>$</span>
      <CurrencyInput value={valueUsd} onChange={onUsd} step="0.01" />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
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
        <p className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: "#9db0bc" }}>{label}</p>
        <p className="font-mono text-[18px] font-bold leading-tight" style={{ color: "#17222c" }}>{value}</p>
      </div>
    </div>
  );
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

  const updateAreaRate = (
    regionId: string,
    areaId: string,
    sub: "php" | "usd",
    value: number
  ) => {
    setRegions((prev) =>
      prev.map((r) =>
        r.id === regionId
          ? {
              ...r,
              subAreas: r.subAreas.map((sa) =>
                sa.id === areaId ? { ...sa, pricePerPct: { ...sa.pricePerPct, [sub]: value } } : sa
              ),
            }
          : r
      )
    );
  };

  const updateRegionBundle = (
    regionId: string,
    sub: "php" | "usd",
    value: number
  ) => {
    setRegions((prev) =>
      prev.map((r) => {
        if (r.id !== regionId) return r;
        const oldBundle = r.subAreas.reduce(
          (sum, sa) => sum + sa.pricePerPct[sub] * 100,
          0
        );
        const scale = oldBundle === 0 ? 1 : value / oldBundle;
        return {
          ...r,
          subAreas: r.subAreas.map((sa) => ({
            ...sa,
            pricePerPct: {
              ...sa.pricePerPct,
              [sub]: Math.round(sa.pricePerPct[sub] * scale * 10000) / 10000,
            },
          })),
        };
      })
    );
  };

  const regionBundle = (r: ExplorationRegion, sub: "php" | "usd") =>
    Math.round(r.subAreas.reduce((sum, sa) => sum + sa.pricePerPct[sub] * 100, 0) * 100) / 100;

  const regionRate = (r: ExplorationRegion, sub: "php" | "usd") =>
    Math.round(r.subAreas.reduce((sum, sa) => sum + sa.pricePerPct[sub], 0) * 10000) / 10000;

  const buildOverridesFromState = (): PriceOverrides => {
    const overrides: PriceOverrides = {
      serviceBase: {},
      nestedItems: {},
      explorationAreas: {},
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
      for (const sa of r.subAreas) {
        overrides.explorationAreas[`${r.id}__${sa.id}`] = sa.pricePerPct;
      }
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
    ...categories.map((c) => ({ id: c.id, label: c.label })),
    { id: "exploration-rates", label: "Exploration Rates" },
  ];

  const savedOverrides = loadOverrides();
  const overrideCount =
    Object.keys(savedOverrides.serviceBase).length +
    Object.keys(savedOverrides.nestedItems).length +
    Object.keys(savedOverrides.explorationAreas).length;
  const totalServiceCount = categories.reduce((sum, c) => sum + c.services.length, 0);

  return (
    <div
      className="min-h-screen text-[#17222c] font-sans flex flex-col"
      style={{ background: "linear-gradient(180deg, #f2f6f9 0%, #e8eef3 100%)" }}
    >
      <header
        className="sticky top-0 z-50"
        style={{ background: "rgba(13, 20, 32, 0.94)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(77, 122, 153, 0.25)" }}
      >
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 pb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(77,122,153,0.3)", color: "#a9c6d8" }}
              >
                <ArrowLeft size={15} />
                Dashboard
              </Link>
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
                  Edit service prices &amp; exploration rates — changes apply live after Save All
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
            <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-[10px] font-semibold" style={{ color: "#8fa4b3" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#8fb8d1", boxShadow: "0 0 6px rgba(143,184,209,0.8)" }} />
              Staged preview — saved on &quot;Save All&quot;
            </div>
          </div>
        </div>
      </header>

      {savedMessage && (
        <div key={savedMessage} className="relative z-10 max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 animate-fade-up">
          <div
            className="flex items-center gap-2.5 text-[13px] font-semibold rounded-xl px-4 py-3 bg-white"
            style={{ border: "1px solid rgba(16,185,129,0.4)", color: "#0f9d6a", boxShadow: "0 10px 30px rgba(16,185,129,0.15)" }}
          >
            <CheckCircle2 size={16} />
            {savedMessage}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 flex flex-col gap-6 flex-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Layers size={16} />} label="Categories" value={categories.length} />
          <StatCard icon={<Package size={16} />} label="Services" value={totalServiceCount} />
          <StatCard icon={<Map size={16} />} label="Exploration Regions" value={regions.length} />
          <StatCard icon={<Coins size={16} />} label="Saved Overrides" value={overrideCount} highlight={overrideCount > 0} />
        </div>

        {activeTab === "exploration-rates" ? (
          <section key="exploration-rates" className="animate-fade-up bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef", boxShadow: "0 4px 24px rgba(23,34,44,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(180deg, #f7fafc, #f0f5f9)", borderBottom: "1px solid #e2eaef" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                <Map size={16} style={{ color: "#4d7a99" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[15px]" style={{ color: "#17222c" }}>Exploration Rates</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#7891a3" }}>
                  Per-1% price for each sub-area — total = missing % × rate
                </p>
              </div>
            </div>

            <div
              className="hidden md:grid items-center gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: "minmax(0,1fr) 220px", background: "#eef3f6", borderBottom: "1px solid #e2eaef", color: "#7891a3" }}
            >
              <span>Sub-Area</span>
              <span className="text-right">Price per 1%</span>
            </div>

            <div className="flex flex-col">
              {regions.map((region, ri) => (
                <div key={region.id}>
                  <div
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-[#f7fafc]"
                    style={{ borderTop: ri !== 0 ? "1px solid #eef3f6" : "none" }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#4d7a99,#8fb8d1)" }} />
                    <span className="font-bold text-[13px] tracking-wide" style={{ color: "#3c4d59" }}>{region.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest" style={{ color: "#9db0bc", background: "#eef3f6" }}>
                      {region.tag}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {region.subAreas.map((sa) => (
                      <div
                        key={sa.id}
                        className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 px-5 py-3 hover:bg-[#f7fafc] transition-colors ${sa !== region.subAreas[region.subAreas.length - 1] ? "border-b" : ""}`}
                        style={{ borderColor: "#eef3f6" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 md:w-[calc(100%-236px)] shrink-0">
                          <span className="text-[13px] font-medium truncate" style={{ color: "#5c7284" }}>{sa.name}</span>
                        </div>
                        <div className="flex flex-col gap-1 md:flex-none md:w-[220px] md:shrink-0">
                          <RatePair
                            valuePhp={sa.pricePerPct.php}
                            valueUsd={sa.pricePerPct.usd}
                            onPhp={(v) => updateAreaRate(region.id, sa.id, "php", v)}
                            onUsd={(v) => updateAreaRate(region.id, sa.id, "usd", v)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : currentCategory && currentCategory.id === "exploration" ? (
          <section key="exploration-bundles" className="animate-fade-up bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef", boxShadow: "0 4px 24px rgba(23,34,44,0.06)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(180deg, #f7fafc, #f0f5f9)", borderBottom: "1px solid #e2eaef" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                <Map size={16} style={{ color: "#4d7a99" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-[15px]" style={{ color: "#17222c" }}>World Exploration — Region Bundles</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#7891a3" }}>
                  Edit the bundled 100% price per region — per-1% rates scale proportionally
                </p>
              </div>
            </div>

            <div
              className="hidden md:grid items-center gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: "minmax(0,1fr) 120px 220px", background: "#eef3f6", borderBottom: "1px solid #e2eaef", color: "#7891a3" }}
            >
              <span>Region</span>
              <span className="text-right">Per 1% (Σ areas)</span>
              <span className="text-right">Bundle · 100% Region</span>
            </div>

            <div className="flex flex-col">
              {regions.map((region, ri) => (
                <div
                  key={region.id}
                  className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-5 py-4 ${ri !== regions.length - 1 ? "border-b" : ""} hover:bg-[#f7fafc] transition-colors`}
                  style={{ borderColor: "#eef3f6" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 md:w-[calc(100%-372px)] shrink-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#4d7a99,#8fb8d1)" }} />
                    <span className="font-bold text-[14px] truncate" style={{ color: "#17222c" }}>{region.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shrink-0" style={{ color: "#9db0bc", background: "#eef3f6" }}>
                      {region.tag}
                    </span>
                    <span className="text-[10px] font-semibold shrink-0" style={{ color: "#9db0bc" }}>{region.subAreas.length} area{region.subAreas.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2 md:flex-none md:w-[120px] md:shrink-0 md:justify-end">
                    <span className="text-[12px] font-bold" style={{ color: "#9db0bc" }}>₱ {regionRate(region, "php").toFixed(2)}</span>
                    <span className="text-[12px] font-bold" style={{ color: "#9db0bc" }}>$ {regionRate(region, "usd").toFixed(3)}</span>
                  </div>
                  <div className="flex flex-col gap-1 md:flex-none md:w-[220px] md:shrink-0">
                    <RatePair
                      valuePhp={regionBundle(region, "php")}
                      valueUsd={regionBundle(region, "usd")}
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

            {currentCategory.services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-[0_10px_30px_rgba(23,34,44,0.08)]"
                style={{ border: "1px solid #e2eaef" }}
              >
                <div
                  className="flex items-start justify-between gap-3 px-5 py-4"
                  style={{ background: "linear-gradient(180deg,#fafcfd,#f2f6f9)", borderBottom: "1px solid #eef3f6" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
                      <Tag size={15} style={{ color: "#4d7a99" }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[15px] truncate" style={{ color: "#17222c" }}>{service.name}</h3>
                      {service.description && (
                        <p className="text-[12px] font-medium mt-0.5" style={{ color: "#7891a3" }}>{service.description}</p>
                      )}
                    </div>
                  </div>
                  <TypeBadge type={service.type} />
                </div>

                <div className="p-5">
                  {service.type === "nested-list" && service.groups ? (
                    <div className="flex flex-col gap-5">
                      {service.groups.map((group, gi) => (
                        <div key={group.name} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1.5 px-3">
                            <span className="font-mono text-[10px] font-bold" style={{ color: "#4d7a99" }}>
                              {String(gi + 1).padStart(2, "0")}
                            </span>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-widest whitespace-nowrap" style={{ color: "#9db0bc" }}>
                              {group.name}
                            </h4>
                            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,#eef3f6,transparent)" }} />
                          </div>
                          {group.items.map((item, ii) => {
                            const price =
                              typeof item.price === "object"
                                ? item.price
                                : { php: item.price, usd: item.price };
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#f7fafc]"
                                style={{ border: "1px solid transparent" }}
                              >
                                <span className="text-[13px] font-medium min-w-0" style={{ color: "#5c7284" }}>
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                                  <span className="text-[12px] font-bold" style={{ color: "#9db0bc" }}>₱</span>
                                  <CurrencyInput
                                    className="w-20"
                                    value={price.php}
                                    onChange={(v) => updateNestedItemPrice(currentCategory.id, service.id, gi, ii, "php", v)}
                                  />
                                  <span className="text-[12px] font-bold" style={{ color: "#9db0bc" }}>$</span>
                                  <CurrencyInput
                                    className="w-20"
                                    value={price.usd}
                                    onChange={(v) => updateNestedItemPrice(currentCategory.id, service.id, gi, ii, "usd", v)}
                                    step="0.01"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9db0bc" }}>
                          Base Rate
                        </span>
                        <p className="text-[12px] font-medium mt-0.5" style={{ color: "#9db0bc" }}>
                          Per unit (PHP)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[13px] font-bold" style={{ color: "#9db0bc" }}>₱</span>
                        <CurrencyInput
                          className="w-28"
                          value={service.basePrice}
                          onChange={(v) => updateServiceBasePrice(currentCategory.id, service.id, v)}
                        />
                        <span className="text-[11px] font-mono font-semibold" style={{ color: "#9db0bc" }}>
                          ≈ ${(service.basePrice / 60.75).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}