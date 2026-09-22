import { useState, useCallback } from "react";
import { Header, HSR_TABS } from "../components/Header";
import { ServiceList } from "../components/ServiceList";
import { ReceiptPanel } from "../components/ReceiptPanel";
import { HSR_CATEGORIES, buildHsrReceiptItems } from "../data/hsrServices";
import type { ServiceSelection } from "../data/services";

export default function HsrApp() {
  const [activeCategory, setActiveCategory] = useState<string>(HSR_TABS[0].id);
  const [selections, setSelections] = useState<ServiceSelection>({});
  const [clientName, setClientName] = useState("");
  const [isFirstTimeClient, setIsFirstTimeClient] = useState<boolean>(false);

  const handleToggleCheckbox = useCallback((serviceId: string) => {
    setSelections((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] ? 0 : 1,
    }));
  }, []);

  const handleQuantityChange = useCallback((serviceId: string, value: number) => {
    setSelections((prev) => ({ ...prev, [serviceId]: value }));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelections({});
    setIsFirstTimeClient(false);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setSelections((prev) => ({ ...prev, [id]: 0 }));
  }, []);

  const currentCategory = HSR_CATEGORIES.find((c) => c.id === activeCategory)!;
  const receiptItems = buildHsrReceiptItems(selections);
  const cartCount = receiptItems.length;

  return (
    <div className="flex flex-col w-full min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="shrink-0 relative z-50 sticky top-0 shadow-sm lg:shadow-none">
        <Header
          tabs={HSR_TABS}
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
              src="/hero-banner2.png"
              alt="Zapolyarny Bureau Honkai Star Rail Piloting Services Banner"
              className="w-full h-auto block"
            />
          </div>

          <ServiceList
            category={currentCategory}
            selections={selections}
            onToggleCheckbox={handleToggleCheckbox}
            onQuantityChange={handleQuantityChange}
          />
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
            explorationSelections={{}}
            noCompassRegions={{}}
            banner="/hero-banner2.png"
          />
        </div>
      </div>
    </div>
  );
}