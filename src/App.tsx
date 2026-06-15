import { useState, useCallback } from "react";
import { Header, type CategoryId } from "./components/Header";
import { ServiceList } from "./components/ServiceList";
import { ExplorationPanel } from "./components/ExplorationPanel";
import { ReceiptPanel } from "./components/ReceiptPanel";
import {
  CATEGORIES,
  buildReceiptItems,
  type ServiceSelection,
} from "./data/services";
import {
  buildExplorationReceiptItems,
  type ExplorationSelections,
} from "./data/explorationRegions";

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */

  const [activeCategory, setActiveCategory] = useState<CategoryId>("maintenance");
  const [selections, setSelections] = useState<ServiceSelection>({});
  const [explorationSelections, setExplorationSelections] = useState<ExplorationSelections>({});
  const [clientName, setClientName] = useState("");

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
    setExplorationSelections((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelections({});
    setExplorationSelections({});
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    // Exploration keys contain "__"
    if (id.includes("__")) {
      setExplorationSelections((prev) => ({ ...prev, [id]: 0 }));
    } else {
      setSelections((prev) => ({ ...prev, [id]: 0 }));
    }
  }, []);

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory)!;
  const serviceReceiptItems = buildReceiptItems(selections);
  const explorationReceiptItems = buildExplorationReceiptItems(explorationSelections);
  const receiptItems = [...serviceReceiptItems, ...explorationReceiptItems];
  const cartCount = receiptItems.length;

  return (
    <div className="flex flex-col size-full overflow-hidden bg-background min-h-screen">
      
      {/* Header */}
      <div className="relative z-10">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          cartCount={cartCount}
        />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Left: Service Area (70%) */}
        <main className="flex-1 overflow-y-auto px-6 py-6" style={{ minWidth: 0 }}>
          
          {/* YOUR BRAND BANNER */}
          <div className="w-full h-35 md:h-50 rounded-2xl overflow-hidden mb-6 border border-[rgba(74,144,226,0.15)] shadow-[0_4px_20px_rgba(74,144,226,0.05)] bg-[#f4f8fb]">
          <img 
            src="/hero-banner.png" 
            alt="Suino Piloting Service Banner" 
            className="w-full h-full object-cover object-center" 
          />
        </div>

          {activeCategory === "exploration" ? (
            <ExplorationPanel
              selections={explorationSelections}
              onChange={handleExplorationChange}
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

        {/* Right: Receipt Panel (320px fixed) */}
        <div className="overflow-hidden flex-shrink-0 border-l border-border" style={{ width: "320px" }}>
          <ReceiptPanel
            clientName={clientName}
            onClientNameChange={setClientName}
            items={receiptItems}
            onClearAll={handleClearAll}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
    </div>
  );
}
