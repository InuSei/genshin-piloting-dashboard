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
    // Clean Code: Mobile gets vertical scrolling (min-h-screen), Desktop gets locked view (lg:h-screen)
    <div className="flex flex-col w-full bg-slate-50 min-h-screen lg:h-screen lg:overflow-hidden">
      
      {/* Header - Sticky on mobile so it doesn't disappear when scrolling down */}
      <div className="shrink-0 relative z-50 sticky top-0 shadow-sm lg:shadow-none">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          cartCount={cartCount}
        />
      </div>

      {/* Main layout - Stacks vertically on phones, side-by-side on monitors */}
      <div className="flex flex-col lg:flex-row flex-1 relative z-10 lg:min-h-0">
        
        {/* Left: Service Area */}
        <main className="flex-1 lg:overflow-y-auto px-4 lg:px-6 py-6" style={{ minWidth: 0 }}>
          
          <div className="w-full rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-sm bg-slate-100 flex">
            <img 
              src="/hero-banner.png" 
              alt="Suino Piloting Service Banner" 
              className="w-full h-auto block opacity-95" 
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

        {/* Right: Receipt Panel - Drops to the bottom on mobile, locks right on desktop */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white lg:h-full lg:overflow-hidden flex flex-col">
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
