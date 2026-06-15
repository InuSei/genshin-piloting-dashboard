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
    // 1. STRICT h-screen forces the app to fit exactly inside your monitor window
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50">
      
      {/* 2. Header - shrink-0 prevents it from getting squished */}
      <div className="shrink-0 relative z-10">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          cartCount={cartCount}
        />
      </div>

      {/* 3. Main layout - min-h-0 is the magic flexbox property that forces internal scrolling */}
      <div className="flex flex-1 min-h-0 relative z-10">
        
        {/* Left: Service Area now scrolls independently of the rest of the page */}
        <main className="flex-1 overflow-y-auto px-6 py-6" style={{ minWidth: 0 }}>
          
          <div className="w-full h-70 md:h-48 rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-sm bg-slate-100">
            <img 
              src="/hero-banner.png" 
              alt="Suino Piloting Service Banner" 
              className="w-full h-full object-cover object-center opacity-95" 
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

        {/* Right: Receipt Panel is strictly locked to the right side and full height */}
        <div className="w-[320px] shrink-0 border-l border-slate-200 bg-white h-full">
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