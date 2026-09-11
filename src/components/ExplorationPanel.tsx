import { useState, useCallback } from "react";
import {
  EXPLORATION_REGIONS,
  regionTotal,
  regionAvgPct,
  calculateRemainingWorkPrice,
  UNSELECTED,
  type ExplorationSelections,
} from "../data/explorationRegions";

interface ExplorationPanelProps {
  selections: ExplorationSelections;
  onChange: (key: string, value: number) => void;
  noCompassRegions: Record<string, boolean>;
  onToggleCompass: (regionId: string) => void;
}

export function ExplorationPanel({
  selections,
  onChange,
  noCompassRegions,
  onToggleCompass,
}: ExplorationPanelProps) {
  const [openRegions, setOpenRegions] = useState<Set<string>>(() => new Set());

  const toggleRegion = useCallback((id: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="w-1 self-stretch min-h-11 rounded-full shrink-0" style={{ background: "linear-gradient(180deg, #4d7a99, #8fb8d1)" }} />
        <div>
          <p
            className="mb-0.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: 700,
              color: "#8fb8d1",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Explore By Region
          </p>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "22px", fontWeight: 800, color: "#f4f8fb", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            World Exploration
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#a9bccb", marginTop: "4px" }}>
            Enter exact completion percentages per sub-area — price scales proportionally
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {EXPLORATION_REGIONS.map((region) => {
          const isOpen = openRegions.has(region.id);
          const totalObj = regionTotal(region, selections);
          const avgPct = regionAvgPct(region, selections);
          const hasData = totalObj.php > 0;
          const hasNoCompass = noCompassRegions[region.id] || false;
          const finalRegionPhp = totalObj.php + (hasData && hasNoCompass ? 60 : 0);

          return (
            <div
              key={region.id}
              className="rounded-2xl overflow-hidden transition-all duration-300 bg-white"
              style={{
                border: hasData ? "1px solid rgba(77, 122, 153, 0.5)" : "1px solid rgba(77, 122, 153, 0.16)",
                boxShadow: hasData ? "0 8px 24px rgba(77, 122, 153, 0.14)" : "0 2px 8px rgba(77, 122, 153, 0.05)",
              }}
            >
              <button
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[#f4f8fa]"
              >
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
                  style={{ border: "1px solid #cfdce4", background: "#eef3f6" }}
                >
                  <span style={{ color: "#4d7a99", fontSize: "13px", fontWeight: 800, lineHeight: 1 }}>
                    {isOpen ? "–" : "+"}
                  </span>
                </div>
                <span className="flex-1 text-left" style={{ fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 700, color: hasData ? "#17222c" : "#3c4d59" }}>
                  {region.name}
                </span>
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#4d7a99",
                    background: "rgba(77, 122, 153, 0.1)",
                    border: "1px solid rgba(77, 122, 153, 0.2)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {region.tag}
                </span>
                {hasData && (
                  <span
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "linear-gradient(135deg, #4d7a99, #8fb8d1)",
                      boxShadow: "0 2px 6px rgba(77, 122, 153, 0.35)",
                    }}
                  >
                    avg {avgPct}%
                  </span>
                )}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: hasData ? "#4d7a99" : "#9db0bc",
                    minWidth: "72px",
                    textAlign: "right",
                  }}
                >
                  {hasData ? `₱${finalRegionPhp.toLocaleString("en-PH")}` : `₱0`}
                </span>
              </button>

              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(77, 122, 153, 0.12)", background: "#fbfcfd" }}>
                  <div className="flex items-center px-5 py-2" style={{ background: "#eef3f6", borderBottom: "1px solid #e2eaef" }}>
                    <span className="flex-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#7891a3", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Sub-Area
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#7891a3", textTransform: "uppercase", letterSpacing: "0.1em", width: "60px", textAlign: "center" }}>
                      %
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700, color: "#7891a3", textTransform: "uppercase", letterSpacing: "0.1em", width: "72px", textAlign: "right" }}>
                      Price
                    </span>
                  </div>

                  <div className="flex flex-col py-1">
                    {region.subAreas.map((sa) => {
                      const key = `${region.id}__${sa.id}`;
                      const pct = selections[key] ?? UNSELECTED;
                      const priceObj = calculateRemainingWorkPrice(region, pct);
                      const isActive = pct !== UNSELECTED;

                      return (
                        <div key={sa.id} className="flex items-center px-5 py-2.5 hover:bg-[#eef3f6] transition-colors">
                          <span className="flex-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: isActive ? 600 : 500, color: isActive ? "#17222c" : "#5c7284" }}>
                            {sa.name}
                          </span>
                          <div
                            className="flex items-center rounded-lg overflow-hidden bg-white shrink-0"
                            style={{ width: "64px", border: isActive ? "1px solid #4d7a99" : "1px solid #cfdce4", transition: "all 0.2s ease" }}
                          >
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              value={pct === UNSELECTED ? "" : pct}
                              placeholder="0"
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                  onChange(key, UNSELECTED);
                                  return;
                                }
                                onChange(key, Math.min(100, Math.max(0, parseInt(raw, 10) || 0)));
                              }}
                              onFocus={(e) => e.target.select()}
                              className="w-full text-center py-1.5 outline-none font-mono text-[14px] font-bold bg-transparent"
                              style={{ color: isActive ? "#17222c" : "#7891a3", MozAppearance: "textfield" }}
                            />
                            <span className="font-mono text-[12px] font-bold pr-1.5 select-none" style={{ color: isActive ? "#4d7a99" : "#9db0bc" }}>
                              %
                            </span>
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", fontWeight: 700, color: isActive ? "#4d7a99" : "#9db0bc", width: "72px", textAlign: "right" }}>
                            {isActive ? `₱${priceObj.php.toLocaleString("en-PH")}` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 border-t bg-white" style={{ borderColor: "#e2eaef" }}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id={`compass-${region.id}`}
                        checked={hasNoCompass}
                        onChange={() => onToggleCompass(region.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: "#4d7a99" }}
                      />
                      <label htmlFor={`compass-${region.id}`} className="text-[13px] font-medium cursor-pointer select-none" style={{ color: "#5c7284" }}>
                        Client has no compass <span className="font-mono font-bold ml-1" style={{ color: "#4d7a99" }}>(+₱60 / $1.60)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center px-5 py-3" style={{ borderTop: "1px solid #e2eaef", background: "#eef3f6" }}>
                    <span className="flex-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 800, color: "#5c7284", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Region Subtotal
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 800, color: hasData ? "#4d7a99" : "#9db0bc" }}>
                      ₱{finalRegionPhp.toLocaleString("en-PH")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}