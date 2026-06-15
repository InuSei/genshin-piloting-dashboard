import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
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
}

export function ExplorationPanel({ selections, onChange }: ExplorationPanelProps) {
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
      {/* Section header */}
      <div className="flex items-center gap-4 mb-2 px-2">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-[#dce6f0] shadow-sm">
          <span style={{ fontSize: "24px" }}>🗺</span>
        </div>
        <div>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "20px",
              fontWeight: 800,
              color: "#1e3a5f",
              letterSpacing: "-0.02em",
            }}
          >
            World Exploration
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6082a6",
              marginTop: "2px",
            }}
          >
            Enter exact completion percentages per sub-area — price scales proportionally
          </p>
        </div>
      </div>

      {/* Region accordions */}
      <div className="flex flex-col gap-3">
        {EXPLORATION_REGIONS.map((region) => {
          const isOpen = openRegions.has(region.id);
          const totalObj = regionTotal(region, selections);
          const avgPct = regionAvgPct(region, selections);
          
          const hasData = totalObj.php > 0;

          return (
            <div
              key={region.id}
              className="rounded-2xl overflow-hidden transition-all duration-300 bg-white"
              style={{
                border: hasData
                  ? "1px solid rgba(74, 144, 226, 0.5)"
                  : "1px solid rgba(74, 144, 226, 0.15)",
                boxShadow: hasData
                  ? "0 8px 24px rgba(74, 144, 226, 0.12)"
                  : "0 2px 8px rgba(74, 144, 226, 0.04)",
              }}
            >
              {/* Region header row — clickable */}
              <button
                onClick={() => toggleRegion(region.id)}
                className="w-full flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[#f8fbfe]"
              >
                {/* Expand chevron */}
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f4f8fb]"
                  style={{ border: "1px solid #dce6f0" }}
                >
                  <ChevronDown
                    size={14}
                    style={{
                      color: "#4a90e2",
                      transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>

                {/* Name */}
                <span
                  className="flex-1 text-left"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: hasData ? "#1e3a5f" : "#4a5a6a",
                  }}
                >
                  {region.name}
                </span>

                {/* Tag badge */}
                <span
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#4a90e2",
                    background: "rgba(74, 144, 226, 0.1)",
                    border: "1px solid rgba(74, 144, 226, 0.2)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {region.tag}
                </span>

                {/* Avg pct indicator */}
                {hasData && (
                  <span
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "linear-gradient(135deg, #4a90e2, #6bb0ff)",
                      boxShadow: "0 2px 6px rgba(74, 144, 226, 0.3)",
                    }}
                  >
                    avg {avgPct}%
                  </span>
                )}

                {/* Price */}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "16px",
                    fontWeight: 800,
                    color: hasData ? "#4a90e2" : "#a0b8d0",
                    minWidth: "72px",
                    textAlign: "right",
                  }}
                >
                  {hasData ? `₱${totalObj.php.toLocaleString("en-PH")}` : `₱0`}
                </span>
              </button>

              {/* Sub-areas grid — shown when open */}
              {isOpen && (
                <div
                  style={{
                    borderTop: "1px solid rgba(74, 144, 226, 0.1)",
                    background: "#fcfdfe",
                  }}
                >
                  {/* Column headers */}
                  <div
                    className="flex items-center px-5 py-2"
                    style={{
                      background: "#f4f8fb",
                      borderBottom: "1px solid #eef3f9",
                    }}
                  >
                    <span
                      className="flex-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#829ab1",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Sub-Area
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#829ab1",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        width: "60px",
                        textAlign: "center",
                      }}
                    >
                      %
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#829ab1",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        width: "72px",
                        textAlign: "right",
                      }}
                    >
                      Price
                    </span>
                  </div>

                  {/* Sub-area rows */}
                  <div className="flex flex-col py-1">
                    {region.subAreas.map((sa) => {
                      const key = `${region.id}__${sa.id}`;
                      const pct = selections[key] ?? UNSELECTED;
                      
                      const priceObj = calculateRemainingWorkPrice(region, pct);
                      const pricePhp = priceObj.php;
                      
                      const isActive = pct !== UNSELECTED;

                      return (
                        <div
                          key={sa.id}
                          className="flex items-center px-5 py-2.5 hover:bg-[#f4f8fb] transition-colors"
                        >
                          {/* Sub-area name */}
                          <span
                            className="flex-1"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "14px",
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? "#1e3a5f" : "#6082a6",
                            }}
                          >
                            {sa.name}
                          </span>

                          {/* Percentage input */}
                          <div
                            className="flex items-center rounded-lg overflow-hidden bg-white"
                            style={{
                              width: "60px",
                              border: isActive
                                ? "1px solid #4a90e2"
                                : "1px solid #c5d8eb",
                              boxShadow: isActive ? "0 0 0 2px rgba(74,144,226,0.1)" : "none",
                              transition: "all 0.2s ease",
                            }}
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
                                const v = Math.min(100, Math.max(0, parseInt(raw, 10) || 0));
                                onChange(key, v);
                              }}
                              onFocus={(e) => {
                                e.target.select();
                              }}
                              className="w-full text-center py-1.5"
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: isActive ? "#1e3a5f" : "#829ab1",
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                MozAppearance: "textfield",
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: isActive ? "#4a90e2" : "#a0b8d0",
                                paddingRight: "6px",
                                userSelect: "none",
                              }}
                            >
                              %
                            </span>
                          </div>

                          {/* Row price */}
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: isActive ? "#4a90e2" : "#a0b8d0",
                              width: "72px",
                              textAlign: "right",
                            }}
                          >
                            {isActive ? `₱${pricePhp.toLocaleString("en-PH")}` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Region subtotal row */}
                  <div
                    className="flex items-center px-5 py-3"
                    style={{
                      borderTop: "1px solid #eef3f9",
                      background: "#f4f8fb",
                    }}
                  >
                    <span
                      className="flex-1"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#6082a6",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Region Subtotal
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "16px",
                        fontWeight: 800,
                        color: hasData ? "#4a90e2" : "#a0b8d0",
                      }}
                    >
                      ₱{totalObj.php.toLocaleString("en-PH")}
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