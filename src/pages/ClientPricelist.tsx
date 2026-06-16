import { useState } from "react";
// Clean Code: Removed Facebook and Twitter imports to bypass the dependency error
import { Sparkles, Info } from "lucide-react";
import { CATEGORIES, type PriceValue } from "../data/services";

function formatPrice(price: PriceValue): string {
  const php = typeof price === "object" ? price.php : price;
  const usd = typeof price === "object" ? price.usd : price / 60.75;
  
  if (php === 0) return "Free";
  return `₱${php.toLocaleString("en-PH")} / $${usd.toFixed(2)}`;
}

const EXPLORATION_RATES = [
  { name: "Mondstadt", full: { php: 550, usd: 9.02 }, partial: { php: 2, usd: 0.04 } },
  { name: "Liyue", full: { php: 1150, usd: 18.92 }, partial: { php: 2, usd: 0.04 } },
  { name: "Inazuma", full: { php: 1790, usd: 29.60 }, partial: { php: 4, usd: 0.07 } },
  { name: "Sumeru Forest", full: { php: 2100, usd: 25.00 }, partial: { php: 3, usd: 0.05 } },
  { name: "Sumeru Desert", full: { php: 2100, usd: 25.00 }, partial: { php: 3, usd: 0.05 } },
  { name: "Fontaine", full: { php: 2400, usd: 40.00 }, partial: { php: 4, usd: 0.07 } },
  { name: "Natlan", full: { php: 2700, usd: 44.43 }, partial: { php: 4, usd: 0.07 } },
  { name: "Nod-krai", full: { php: 1500, usd: 25.00 }, partial: { php: 4, usd: 0.07 } },
];

export function ClientPricelist() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 flex flex-col">
      
      {/* Aesthetic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 pt-5 pb-4 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #4a90e2, #89b4e5)" }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div className="leading-tight">
              <h1 className="font-mono text-[18px] font-bold text-[#1e3a5f] tracking-[0.15em] uppercase">
                SUINO
              </h1>
              <p className="font-sans text-[11px] font-bold text-[#6082a6] tracking-widest uppercase">
                Official Pricelist
              </p>
            </div>
          </div>

          <nav
            className="flex items-center p-1.5 rounded-full bg-[#f1f5f9] overflow-x-auto scrollbar-hide border border-slate-200 w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
            {CATEGORIES.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className="flex items-center justify-center px-5 py-2 rounded-full transition-all duration-200 whitespace-nowrap shrink-0"
                  style={
                    isActive
                      ? {
                          background: "#5b9ff6",
                          color: "#ffffff",
                          border: "1.5px solid #111827", 
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          fontWeight: 700,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }
                      : {
                          background: "transparent",
                          color: "#64748b",
                          border: "1.5px solid transparent",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                        }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 md:px-6 flex flex-col gap-8 flex-1">
        
        <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 flex shrink-0">
          <img 
            src="/hero-banner.png" 
            alt="Suino Piloting Service" 
            className="w-full h-auto block opacity-95" 
          />
        </div>

        <section key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl shrink-0">
              {category.emoji}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#1e3a5f] tracking-tight">
                {category.label}
              </h2>
              <p className="text-[13px] font-medium text-slate-500 mt-0.5 leading-snug">
                {category.description}
              </p>
            </div>
          </div>

          {category.id === "exploration" ? (
            <div className="flex flex-col gap-6">
              <div className="bg-[#f0f7ff] rounded-2xl p-5 border border-[#c5d8eb] flex gap-4 items-start shadow-sm">
                <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#4a90e2] shadow-sm">
                  <Info size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#1e3a5f] mb-1">Custom Pricing Available</h4>
                  <p className="text-[#6082a6] text-[13px] leading-relaxed">
                    If you have already partially explored a region, your price will be dynamically calculated based on your current map percentage. The rates below are benchmarks—please message us directly with a screenshot of your map progress for an exact, discounted quote!
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="hidden md:flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                  <div className="w-1/3 font-bold text-[12px] text-slate-500 uppercase tracking-widest">Region</div>
                  <div className="w-2/3 flex justify-end gap-12 pr-4">
                    <div className="font-bold text-[12px] text-slate-500 uppercase tracking-widest text-right w-32">100% Completion</div>
                    <div className="font-bold text-[12px] text-slate-500 uppercase tracking-widest text-right w-24">Per 1% Progress</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {EXPLORATION_RATES.map((item, idx) => (
                    <div 
                      key={item.name} 
                      className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:px-4 md:py-3.5 gap-3 md:gap-0 ${idx !== EXPLORATION_RATES.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
                      <div className="font-bold text-[15px] text-[#1e3a5f] md:w-1/3">{item.name}</div>
                      <div className="flex justify-between md:w-2/3 md:justify-end md:gap-12 md:pr-4">
                         <div className="flex flex-col md:items-end w-32">
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold md:hidden mb-0.5">100% Completion</span>
                           <span className="text-[14px] font-mono font-bold text-[#4a90e2]">{formatPrice(item.full)}</span>
                         </div>
                         <div className="flex flex-col items-end w-24">
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold md:hidden mb-0.5">Per 1%</span>
                           <span className="text-[14px] font-mono font-bold text-[#4a90e2]">{formatPrice(item.partial)}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {category.services.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5 w-full"
                >
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-[#1e3a5f] text-[18px] leading-tight">{service.name}</h3>
                    {service.description && (
                       <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{service.description}</p>
                    )}
                  </div>

                  {service.type === "nested-list" && service.groups ? (
                    <div className="columns-1 md:columns-2 gap-x-12">
                      {service.groups.map(group => (
                        <div key={group.name} className="flex flex-col gap-2.5 mb-8 break-inside-avoid">
                          <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1.5">
                            {group.name}
                          </h4>
                          <div className="flex flex-col gap-1.5 pt-1">
                            {group.items.map(item => (
                              <div key={item.id} className="flex justify-between items-start gap-4 py-1">
                                <span className="text-[13px] font-medium text-slate-600 leading-tight">{item.name}</span>
                                <span className="text-[13px] font-mono font-bold text-[#4a90e2] shrink-0">
                                  {formatPrice(item.price)}
                                  {item.isQuantity && <span className="text-[10px] text-slate-400 font-sans ml-1">ea</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</span>
                      <div className="text-right leading-none flex items-center gap-2">
                        <span className="text-[18px] font-mono font-bold text-[#4a90e2]">
                          {formatPrice(service.basePrice)}
                        </span>
                        {service.type === "quantity" && (
                           <span className="text-[12px] text-slate-400 font-sans font-medium mt-0.5">per unit</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Clean Code: Footer using inline SVGs for zero dependencies */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-4xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <Sparkles size={16} color="#4a90e2" />
            <span className="font-mono text-[13px] font-bold text-[#1e3a5f] tracking-[0.15em] uppercase">
              SUINO PILOTING
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://facebook.com/SuinoPilotingService" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 text-slate-500 hover:text-[#4a90e2] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              <span className="text-[14px] font-medium">@SuinoPilotingService</span>
            </a>
            
            <a 
              href="https://x.com/SuinoPlt" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 text-slate-500 hover:text-[#4a90e2] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
              <span className="text-[14px] font-medium">@SuinoPlt</span>
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}