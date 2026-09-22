import { useState } from "react";

export type CategoryId = string;

export interface CategoryTab {
  id: string;
  label: string;
}

export const GENSHIN_TABS: CategoryTab[] = [
  { id: "maintenance", label: "Maintenance" },
  { id: "exploration", label: "World Exploration" },
  { id: "quests", label: "Quests" },
  { id: "character", label: "Character Building" },
  { id: "others", label: "Other Services" },
];

export const HSR_TABS: CategoryTab[] = [
  { id: "maintenance", label: "Maintenance" },
  { id: "exploration", label: "World Exploration" },
  { id: "quests", label: "Quests" },
  { id: "endgame", label: "Endgame" },
  { id: "memoir", label: "Conventional Memoir" },
];

interface HeaderProps {
  tabs?: CategoryTab[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  cartCount: number;
}

export function Header({ tabs = GENSHIN_TABS, activeCategory, onCategoryChange, cartCount }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        background: "rgba(13, 20, 32, 0.92)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(77, 122, 153, 0.25)",
      }}
      className="sticky top-0 z-50 flex flex-col w-full"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 w-full">
        {/* Left: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="leading-none">
            <span
              className="tracking-widest uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                fontWeight: 700,
                color: "#eef3f6",
                letterSpacing: "0.14em",
              }}
            >
              ZAPOLYARNY BUREAU
            </span>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "9px",
                fontWeight: 600,
                color: "#8fb8d1",
                letterSpacing: "0.08em",
                marginTop: "1px",
              }}
            >
              PILOTING SERVICES
            </p>
          </div>
        </div>

        {/* Middle: Desktop Category Tabs */}
        <nav
          className="hidden lg:flex items-center gap-1 p-1 rounded-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(77, 122, 153, 0.25)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #4d7a99, #8fb8d1)",
                        color: "#0d1420",
                        boxShadow: "0 2px 10px rgba(77, 122, 153, 0.35)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        fontWeight: 700,
                      }
                    : {
                        color: "#a9bccb",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                      }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Cart + Mobile Toggle */}
        <div className="shrink-0 flex items-center gap-2 lg:gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(77, 122, 153, 0.25)",
            }}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, color: "#8fa4b3" }}>
              Items
            </span>
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: cartCount > 0 ? "#4d7a99" : "rgba(77, 122, 153, 0.12)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 700,
                color: cartCount > 0 ? "#fff" : "#7891a3",
              }}
            >
              {cartCount}
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center h-10 px-4 rounded-xl transition-colors"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(77, 122, 153, 0.25)",
              color: "#eef3f6",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {isMobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden flex flex-col w-full px-4 pt-2 pb-5 gap-1.5 absolute top-16 left-0"
          style={{
            background: "#0d1420",
            borderTop: "1px solid rgba(77, 122, 153, 0.2)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 mt-2 px-2" style={{ color: "#7891a3" }}>
            Select Service Category
          </p>
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onCategoryChange(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-3 rounded-xl transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: "rgba(77, 122, 153, 0.15)",
                        color: "#8fb8d1",
                        border: "1px solid rgba(77, 122, 153, 0.4)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }
                    : {
                        background: "transparent",
                        color: "#a9bccb",
                        border: "1px solid transparent",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "14px",
                        fontWeight: 600,
                      }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}