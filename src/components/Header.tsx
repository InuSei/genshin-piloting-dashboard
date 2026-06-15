import { Sparkles } from "lucide-react";

export type CategoryId =
  | "maintenance"
  | "exploration"
  | "quests"
  | "character"
  | "hunting";

interface CategoryTab {
  id: CategoryId;
  label: string;
}

const TABS: CategoryTab[] = [
  { id: "maintenance", label: "Maintenance"},
  { id: "exploration", label: "World Exploration"},
  { id: "quests", label: "Quests", },
  { id: "character", label: "Character Building"},
  { id: "hunting", label: "Hunting / Events"},
];

interface HeaderProps {
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  cartCount: number;
}

export function Header({ activeCategory, onCategoryChange, cartCount }: HeaderProps) {
  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(74, 144, 226, 0.15)",
      }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 gap-6"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #4a90e2, #89b4e5)" }}
        >
          <Sparkles size={16} color="#fff" />
        </div>
        <div className="leading-none">
          <span
            className="tracking-widest uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1e3a5f",
              letterSpacing: "0.14em",
            }}
          >
            SUINO
          </span>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9px",
              fontWeight: 600,
              color: "#6082a6",
              letterSpacing: "0.08em",
              marginTop: "1px",
            }}
          >
            PILOTING SERVICE
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <nav
        className="flex items-center gap-1 p-1 rounded-full bg-white"
        style={{
          border: "1px solid rgba(74, 144, 226, 0.15)",
          boxShadow: "0 2px 8px rgba(74, 144, 226, 0.04)"
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #4a90e2, #6bb0ff)",
                      color: "#fff",
                      boxShadow: "0 2px 10px rgba(74, 144, 226, 0.3)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                    }
                  : {
                      color: "#6082a6",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                    }
              }
            >
              <span style={{ fontSize: "12px" }}></span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Cart badge */}
      <div className="shrink-0 flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white"
          style={{
            border: "1px solid rgba(74, 144, 226, 0.15)",
            boxShadow: "0 2px 8px rgba(74, 144, 226, 0.04)"
          }}
        >
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 500, color: "#6082a6" }}>
            Items
          </span>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: cartCount > 0 ? "#4a90e2" : "rgba(74, 144, 226, 0.08)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              color: cartCount > 0 ? "#fff" : "#829ab1",
              transition: "all 0.2s ease",
            }}
          >
            {cartCount}
          </span>
        </div>
      </div>
    </header>
  );
}