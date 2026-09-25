import { useState, useCallback } from "react";
import { Header, GENSHIN_TABS } from "./components/Header";
import { ServiceList } from "./components/ServiceList";
import { ExplorationPanel } from "./components/ExplorationPanel";
import { ReceiptPanel } from "./components/ReceiptPanel";
import {
  CATEGORIES,
  buildReceiptItems,
  type ServiceSelection,
} from "./data/services";
import {
  EXPLORATION_REGIONS,
  buildExplorationReceiptItems,
  isBillableProgress,
  type ExplorationBundles,
  type ExplorationSelections,
  UNSELECTED,
} from "./data/explorationRegions";

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>("maintenance");
  const [selections, setSelections] = useState<ServiceSelection>({});
  const [explorationSelections, setExplorationSelections] = useState<ExplorationSelections>({});
  const [bundledRegions, setBundledRegions] = useState<ExplorationBundles>({});
  const [clientName, setClientName] = useState("");
  const [isFirstTimeClient, setIsFirstTimeClient] = useState<boolean>(false);
  const [noCompassRegions, setNoCompassRegions] = useState<Record<string, boolean>>({});

  const handleToggleCheckbox = useCallback((serviceId: string) => {
    setSelections((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] ? 0 : 1,
    }));
  }, []);

  const handleQuantityChange = useCallback((serviceId: string, value: number) => {
    setSelections((prev) => ({ ...prev, [serviceId]: value }));
  }, []);

  const handleExplorationChange = useCallback((key: string, value: number) => {
    const regionId = key.split("__")[0];
    setBundledRegions((prev) => ({ ...prev, [regionId]: false }));
    setExplorationSelections((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleBundle = useCallback((regionId: string) => {
    setBundledRegions((prev) => ({ ...prev, [regionId]: !prev[regionId] }));
    setExplorationSelections((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${regionId}__`)) delete next[key];
      }
      return next;
    });
  }, []);

  const handleToggleCompass = useCallback((regionId: string) => {
    setNoCompassRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelections({});
    setExplorationSelections({});
    setBundledRegions({});
    setNoCompassRegions({}); 
    setIsFirstTimeClient(false);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    if (id.startsWith("exploration_bundle__")) {
      const regionId = id.replace("exploration_bundle__", "");
      setBundledRegions((prev) => ({ ...prev, [regionId]: false }));
      setNoCompassRegions((prev) => ({ ...prev, [regionId]: false }));
    } else if (id.includes("__")) {
      setExplorationSelections((prev) => ({ ...prev, [id]: UNSELECTED }));
    } else if (id.startsWith("compass_")) {
      const regionId = id.replace("compass_", "");
      setNoCompassRegions((prev) => ({ ...prev, [regionId]: false }));
    } else {
      setSelections((prev) => ({ ...prev, [id]: 0 }));
    }
  }, []);

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory)!;
  const serviceReceiptItems = buildReceiptItems(selections);
  const explorationReceiptItems = buildExplorationReceiptItems(
    explorationSelections,
    bundledRegions
  );

  const activeExplorationRegionIds = new Set<string>();
  for (const [key, progress] of Object.entries(explorationSelections)) {
    if (isBillableProgress(progress)) {
      const regionId = key.split("__")[0];
      activeExplorationRegionIds.add(regionId);
    }
  }
  for (const [regionId, selected] of Object.entries(bundledRegions)) {
    if (selected) activeExplorationRegionIds.add(regionId);
  }

  const compassSurchargeItems = EXPLORATION_REGIONS
    .filter((r) => noCompassRegions[r.id] && activeExplorationRegionIds.has(r.id))
    .map((r) => ({
      id: `compass_${r.id}`,
      categoryLabel: `World Exploration`,
      name: `${r.name} (No Compass)`,
      detail: "Surcharge",
      price: { php: 60, usd: 1.60 },
    }));

  const receiptItems = [...serviceReceiptItems, ...explorationReceiptItems, ...compassSurchargeItems];
  const cartCount = receiptItems.length;

  return (
    <div className="flex flex-col w-full min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="shrink-0 relative z-50 sticky top-0 shadow-sm lg:shadow-none">
        <Header
          tabs={GENSHIN_TABS}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          cartCount={cartCount}
        />
      </div>

      <div className="flex flex-col lg:flex-row flex-1 relative z-10 lg:min-h-0">
        <main className="flex-1 lg:overflow-y-auto px-4 lg:px-6 py-6" style={{ minWidth: 0 }}>
          <div
            className="w-full rounded-2xl overflow-hidden mb-6 relative"
            style={{
              border: "1px solid rgba(77, 122, 153, 0.25)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
            }}
          >
            <img
              src="/hero-banner.png"
              alt="Zapolyarny Bureau Piloting Services Banner"
              className="w-full h-auto block"
            />
          </div>

          {activeCategory === "exploration" ? (
            <ExplorationPanel
              selections={explorationSelections}
              onChange={handleExplorationChange}
              bundledRegions={bundledRegions}
              onToggleBundle={handleToggleBundle}
              noCompassRegions={noCompassRegions}
              onToggleCompass={handleToggleCompass}
            />
          ) : (
            <ServiceList
              category={currentCategory}
              selections={selections}
              onToggleCheckbox={handleToggleCheckbox}
              onQuantityChange={handleQuantityChange}
            />
          )}
        </main>

        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white lg:h-full lg:overflow-hidden flex flex-col">
          <ReceiptPanel
            clientName={clientName}
            onClientNameChange={setClientName}
            items={receiptItems}
            onClearAll={handleClearAll}
            onRemoveItem={handleRemoveItem}
            isFirstTimeClient={isFirstTimeClient}
            onToggleFirstTimeClient={setIsFirstTimeClient}
            explorationSelections={explorationSelections}
            bundledRegions={bundledRegions}
            noCompassRegions={noCompassRegions}
          />
        </div>
      </div>
    </div>
  );
}