import { useState } from "react";
import { CATEGORIES, type PriceValue } from "../data/services";
import { EXPLORATION_REGIONS, type ExplorationRegion } from "../data/explorationRegions";

function formatPrice(price: PriceValue): string {
  const php = typeof price === "object" ? price.php : price;
  const usd = typeof price === "object" ? price.usd : price / 60.75;

  if (php === 0) return "Free";
  return `₱${php.toLocaleString("en-PH")} / $${usd.toFixed(2)}`;
}

const EXPLORATION_RATES = EXPLORATION_REGIONS.map((region: ExplorationRegion) => ({
  name: region.name,
  tag: region.tag,
  areas: region.subAreas.map((sa) => ({
    name: sa.name,
    full: {
      php: Math.round(sa.pricePerPct.php * 100 * 100) / 100,
      usd: Math.round(sa.pricePerPct.usd * 100 * 100) / 100,
    },
    partial: sa.pricePerPct,
  })),
}));

export function ClientPricelist() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const category = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div
      className="min-h-screen text-[#17222c] font-sans selection:bg-[#4d7a99]/20 flex flex-col"
      style={{ background: "linear-gradient(180deg, #f2f6f9 0%, #e8eef3 100%)" }}
    >

      <header
        className="sticky top-0 z-50 flex flex-col"
        style={{ background: "rgba(13, 20, 32, 0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(77, 122, 153, 0.25)" }}
      >
        <div className="max-w-4xl mx-auto w-full px-6 pt-5 pb-4 flex flex-col gap-5">
          <div className="leading-tight">
            <h1 className="font-mono text-[18px] font-bold tracking-[0.15em] uppercase" style={{ color: "#eef3f6" }}>
              Zapolyarny Bureau
            </h1>
            <p className="font-sans text-[11px] font-bold tracking-widest uppercase" style={{ color: "#8fb8d1" }}>
              Piloting Services — Official Pricelist
            </p>
          </div>

          <nav
            className="flex items-center p-1.5 rounded-full overflow-x-auto scrollbar-hide w-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(77, 122, 153, 0.25)", scrollbarWidth: "none", msOverflowStyle: "none" }}
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
                      ? { background: "linear-gradient(135deg, #4d7a99, #8fb8d1)", color: "#0d1420", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700 }
                      : { background: "transparent", color: "#a9bccb", fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 500 }
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 md:px-6 flex flex-col gap-8 flex-1">

        <div className="w-full rounded-2xl overflow-hidden shadow-sm flex shrink-0" style={{ border: "1px solid rgba(77,122,153,0.2)", boxShadow: "0 12px 40px rgba(23,34,44,0.12)" }}>
          <img src="/hero-banner.png" alt="Zapolyarny Bureau Piloting Services Banner" className="w-full h-auto block" />
        </div>

        <section key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-12 rounded-full shrink-0" style={{ background: "linear-gradient(180deg, #4d7a99, #8fb8d1)" }} />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: "#17222c" }}>
                {category.label}
              </h2>
              <p className="text-[13px] font-medium mt-0.5 leading-snug" style={{ color: "#5c7284" }}>
                {category.description}
              </p>
            </div>
          </div>

          {category.id === "exploration" ? (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl p-5 flex gap-4 items-start shadow-sm" style={{ background: "#eef3f6", border: "1px solid #cfdce4" }}>
                <div>
                  <h4 className="text-[14px] font-bold mb-1" style={{ color: "#17222c" }}>Custom Pricing Available</h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#5c7284" }}>
                    If you have already partially explored a region, your price will be dynamically calculated based on your current map percentage. The rates below are benchmarks—please message us directly with a screenshot of your map progress for an exact, discounted quote!
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #e2eaef" }}>
                <div className="hidden md:flex items-center justify-between p-4" style={{ background: "#eef3f6", borderBottom: "1px solid #e2eaef" }}>
                  <div className="w-1/3 font-bold text-[12px] uppercase tracking-widest" style={{ color: "#7891a3" }}>Region</div>
                  <div className="w-2/3 flex justify-end gap-12 pr-4">
                    <div className="font-bold text-[12px] uppercase tracking-widest text-right w-32" style={{ color: "#7891a3" }}>100% Completion</div>
                    <div className="font-bold text-[12px] uppercase tracking-widest text-right w-24" style={{ color: "#7891a3" }}>Per 1% Progress</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {EXPLORATION_RATES.map((region) => (
                    <div key={region.name} className="flex flex-col">
                      <div className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ background: "#f7fafc", borderBottom: "1px solid #e2eaef" }}>
                        <span className="font-extrabold text-[13px] tracking-wide" style={{ color: "#3c4d59" }}>{region.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color: "#9db0bc", background: "#eef3f6" }}>{region.tag}</span>
                      </div>
                      {region.areas.map((area, idx) => (
                        <div
                          key={area.name}
                          className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:px-4 md:py-3 gap-3 md:gap-0 ${idx !== region.areas.length - 1 ? "border-b" : ""}`}
                          style={{ borderColor: "#e2eaef" }}
                        >
                          <div className="font-bold text-[14px] md:w-1/2" style={{ color: "#17222c" }}>
                            <span className="align-middle">{area.name}</span>
                          </div>
                          <div className="flex justify-between md:w-1/2 md:justify-end md:gap-12 md:pr-4">
                            <div className="flex flex-col md:items-end w-32">
                              <span className="text-[10px] uppercase tracking-widest font-bold md:hidden mb-0.5" style={{ color: "#9db0bc" }}>100% Completion</span>
                              <span className="text-[14px] font-mono font-bold" style={{ color: "#4d7a99" }}>{formatPrice(area.full)}</span>
                            </div>
                            <div className="flex flex-col items-end w-24">
                              <span className="text-[10px] uppercase tracking-widest font-bold md:hidden mb-0.5" style={{ color: "#9db0bc" }}>Per 1%</span>
                              <span className="text-[14px] font-mono font-bold" style={{ color: "#4d7a99" }}>{formatPrice(area.partial)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5 w-full"
                  style={{ border: "1px solid #e2eaef" }}
                >
                  <div className="border-b pb-3" style={{ borderColor: "#e2eaef" }}>
                    <h3 className="font-bold text-[18px] leading-tight" style={{ color: "#17222c" }}>{service.name}</h3>
                    {service.description && (
                       <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "#5c7284" }}>{service.description}</p>
                    )}
                  </div>

                  {service.type === "nested-list" && service.groups ? (
                    <div className="columns-1 md:columns-2 gap-x-12">
                      {service.groups.map(group => (
                        <div key={group.name} className="flex flex-col gap-2.5 mb-8 break-inside-avoid">
                          <h4 className="text-[11px] font-extrabold uppercase tracking-widest border-b pb-1.5" style={{ color: "#9db0bc", borderColor: "#eef3f6" }}>
                            {group.name}
                          </h4>
                          <div className="flex flex-col gap-1.5 pt-1">
                            {group.items.map(item => (
                              <div key={item.id} className="flex justify-between items-start gap-4 py-1">
                                <span className="text-[13px] font-medium leading-tight" style={{ color: "#5c7284" }}>{item.name}</span>
                                <span className="text-[13px] font-mono font-bold shrink-0" style={{ color: "#4d7a99" }}>
                                  {formatPrice(item.price)}
                                  {item.isQuantity && <span className="text-[10px] font-sans ml-1" style={{ color: "#9db0bc" }}>ea</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#9db0bc" }}>Base Rate</span>
                      <div className="text-right leading-none flex items-center gap-2">
                        <span className="text-[18px] font-mono font-bold" style={{ color: "#4d7a99" }}>
                          {formatPrice(service.basePrice)}
                        </span>
                        {service.type === "quantity" && (
                           <span className="text-[12px] font-sans font-medium mt-0.5" style={{ color: "#9db0bc" }}>per unit</span>
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

      <footer style={{ background: "#0d1420", borderTop: "1px solid rgba(77,122,153,0.2)" }}>
        <div className="max-w-4xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

          <span className="font-mono text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: "#eef3f6" }}>
            Zapolyarny Bureau
          </span>

          <div className="flex items-center gap-6 text-[14px] font-medium" style={{ color: "#8fa4b3" }}>
            <a href="https://facebook.com/ZBPServices" target="_blank" rel="noreferrer" className="hover:text-[#8fb8d1] transition-colors">
              Facebook · @ZBPServices
            </a>
            <a href="https://x.com/ZBPServices" target="_blank" rel="noreferrer" className="hover:text-[#8fb8d1] transition-colors">
              X · @ZBPServices
            </a>
            <a href="https://discord.gg/eqwajc5pea" target="_blank" rel="noreferrer" className="hover:text-[#8fb8d1] transition-colors">
              Discord
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}