import { useEffect, useState, type KeyboardEvent } from "react";
import {
  isActCoveredByBundle,
  PRIMO_PULL_UNITS,
  getPrimoResourceRate,
  type Category,
  type Service,
  type ServiceSelection,
} from "../data/services";

interface ServiceListProps {
  category: Category;
  selections: ServiceSelection;
  onToggleCheckbox: (serviceId: string) => void;
  onQuantityChange: (serviceId: string, value: number) => void;
  primoResourceLevel?: number;
  onPrimoResourceChange?: (level: number) => void;
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatItemPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcPrice(
  type: "checkbox" | "quantity" | "nested-list",
  basePrice: number,
  value: number
): number {
  if (type === "checkbox") return value > 0 ? basePrice : 0;
  if (type === "nested-list") return 0;
  return basePrice * value;
}

const FOCUS_RING = "rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d7a99]";

// Makes a clickable row behave like a real checkbox for keyboard and screen-reader users.
function checkboxA11y(checked: boolean, onToggle: () => void, disabled = false) {
  return {
    role: "checkbox" as const,
    "aria-checked": checked,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (!disabled && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        onToggle();
      }
    },
  };
}

// Keeps a service if its name matches; otherwise keeps only the groups/items that match.
function filterService(service: Service, query: string): Service | null {
  const matches = (text: string) => text.toLowerCase().includes(query);
  if (!query || matches(service.name)) return service;
  if (!service.groups) return matches(service.description) ? service : null;
  const groups = service.groups
    .map((group) => (matches(group.name) ? group : { ...group, items: group.items.filter((i) => matches(i.name)) }))
    .filter((group) => group.items.length > 0);
  return groups.length > 0 ? { ...service, groups } : null;
}

export function ServiceList({
  category,
  selections,
  onToggleCheckbox,
  onQuantityChange,
  primoResourceLevel,
  onPrimoResourceChange,
}: ServiceListProps) {
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(""), [category.id]);
  const trimmedQuery = query.trim().toLowerCase();
  const visibleServices = category.services
    .map((service) => filterService(service, trimmedQuery))
    .filter((service): service is Service => service !== null);

  return (
    <div className="flex flex-col gap-4">
      {/* Category header — eyebrow + accent bar, light text for the dark backdrop */}
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
            Select Services
          </p>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "22px",
              fontWeight: 800,
              color: "#f4f8fb",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {category.label}
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#a9bccb",
              marginTop: "4px",
            }}
          >
            {category.description}
          </p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${category.label}…`}
        aria-label={`Search ${category.label}`}
        className="w-full rounded-xl px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-[#8fb8d1]"
        style={{
          border: "1px solid rgba(77, 122, 153, 0.25)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          color: "#17222c",
        }}
      />

      <div className="flex flex-col gap-3">
        {visibleServices.length === 0 && (
          <p className="px-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#a9bccb" }}>
            No services match “{query.trim()}”.
          </p>
        )}
        {visibleServices.map((service) => {
          const currentVal = selections[service.id] ?? 0;
          const price = calcPrice(service.type, service.basePrice, currentVal);

          let isActive = currentVal > 0;
          if (service.type === "nested-list" && service.groups) {
            isActive = service.groups.some((group) =>
              group.items.some((item) => (selections[item.id] ?? 0) > 0)
            );
          }

          return (
            <div
              key={service.id}
              className="group rounded-2xl p-4 transition-all duration-300 bg-white hover:-translate-y-0.5"
              style={{
                border: isActive ? "1px solid rgba(77, 122, 153, 0.5)" : "1px solid rgba(77, 122, 153, 0.15)",
                boxShadow: isActive ? "0 8px 24px rgba(77, 122, 153, 0.14)" : "0 2px 8px rgba(77, 122, 153, 0.05)",
              }}
            >
              {service.type === "checkbox" && (
                <CheckboxService
                  service={service}
                  isChecked={currentVal > 0}
                  price={price}
                  onToggle={() => onToggleCheckbox(service.id)}
                />
              )}
              {service.type === "quantity" && (
                <QuantityService
                  service={service}
                  value={currentVal}
                  price={price}
                  onQuantityChange={(v) => onQuantityChange(service.id, v)}
                />
              )}
              {service.type === "nested-list" && service.groups && (
                <NestedListService
                  service={service}
                  selections={selections}
                  onToggle={onToggleCheckbox}
                  onQuantityChange={onQuantityChange}
                  primoResourceLevel={primoResourceLevel}
                  onPrimoResourceChange={onPrimoResourceChange}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxService({
  service,
  isChecked,
  price,
  onToggle,
}: {
  service: { id: string; name: string; description: string; basePrice: number; tag?: string };
  isChecked: boolean;
  price: number;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-center gap-4 cursor-pointer ${FOCUS_RING}`} onClick={onToggle} {...checkboxA11y(isChecked, onToggle)}>
      <div
        className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300"
        style={
          isChecked
            ? {
                background: "linear-gradient(135deg, #4d7a99, #8fb8d1)",
                border: "none",
                boxShadow: "0 4px 12px rgba(77, 122, 153, 0.35)",
                transform: "scale(1.05)",
              }
            : { background: "#eef3f6", border: "2px solid #cfdce4" }
        }
      >
        {isChecked && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1.5 4.5L4.5 7.5L10.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: isChecked ? "#17222c" : "#3c4d59",
            }}
          >
            {service.name}
          </span>
          {service.tag && (
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(77, 122, 153, 0.1)",
                color: "#4d7a99",
                border: "1px solid rgba(77, 122, 153, 0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {service.tag}
            </span>
          )}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#56697a", marginTop: "3px", lineHeight: 1.4 }}>
          {service.description}
        </p>
      </div>

      <div
        className="shrink-0 text-right"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 800, color: isChecked ? "#4d7a99" : "#627789" }}
      >
        {formatPHP(service.basePrice)}
      </div>
    </div>
  );
}

function QuantityService({
  service,
  value,
  price,
  onQuantityChange,
}: {
  service: { id: string; name: string; description: string; basePrice: number; max?: number; tag?: string };
  value: number;
  price: number;
  onQuantityChange: (v: number) => void;
}) {
  const isActive = value > 0;
  const max = service.max ?? 20;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center rounded-xl overflow-hidden shrink-0" style={{ background: "#eef3f6", border: "1px solid #cfdce4" }}>
        <button
          onClick={() => onQuantityChange(Math.max(0, value - 1))}
          className="w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-[#e2eaef]"
          style={{ color: "#4d7a99", fontSize: "18px", fontWeight: 600 }}
        >
          −
        </button>
        <div
          className="w-10 h-10 flex items-center justify-center bg-white"
          style={{
            borderLeft: "1px solid #cfdce4",
            borderRight: "1px solid #cfdce4",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "15px",
            fontWeight: 800,
            color: isActive ? "#17222c" : "#56697a",
          }}
        >
          {value}
        </div>
        <button
          onClick={() => onQuantityChange(Math.min(max, value + 1))}
          className="w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-[#e2eaef]"
          style={{ color: "#4d7a99", fontSize: "18px", fontWeight: 600 }}
        >
          +
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", fontWeight: 700, color: isActive ? "#17222c" : "#3c4d59" }}>
            {service.name}
          </span>
          {service.tag && (
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(77, 122, 153, 0.1)",
                color: "#4d7a99",
                border: "1px solid rgba(77, 122, 153, 0.2)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {service.tag}
            </span>
          )}
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#56697a", marginTop: "3px", lineHeight: 1.4 }}>
          {service.description}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 800, color: isActive ? "#4d7a99" : "#627789" }}>
          {formatPHP(price)}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, color: "#56697a", marginTop: "2px" }}>
          {formatPHP(service.basePrice)} ea.
        </div>
      </div>
    </div>
  );
}

function NestedListService({
  service,
  selections,
  onToggle,
  onQuantityChange,
  primoResourceLevel,
  onPrimoResourceChange,
}: {
  service: any;
  selections: Record<string, number>;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, value: number) => void;
  primoResourceLevel?: number;
  onPrimoResourceChange?: (level: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "#e2eaef" }}>
        <span className="font-bold text-[16px]" style={{ color: "#17222c" }}>
          {service.name}
        </span>
        {service.tag && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "#eef3f6", color: "#4d7a99", border: "1px solid #cfdce4" }}
          >
            {service.tag}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6 pl-2">
        {service.groups.map((group: any) => {
          const bundleItem: any = group.items.find((item: any) => item.isBundle);
          const actItems: any[] = group.items.filter((item: any) => !item.isBundle);
          const isBundleSelected = bundleItem ? (selections[bundleItem.id] ?? 0) > 0 : false;
          const bundlePhp = bundleItem
            ? typeof bundleItem.price === "object"
              ? bundleItem.price.php
              : bundleItem.price
            : 0;

          return (
            <div key={group.name} className="flex flex-col gap-3">
              <h4 className="text-[12px] font-extrabold tracking-widest uppercase" style={{ color: "#56697a" }}>
                {group.name}
              </h4>

              {bundleItem && (
                <div
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-px ${FOCUS_RING}`}
                  {...checkboxA11y(isBundleSelected, () => onToggle(bundleItem.id))}
                  style={{
                    background: isBundleSelected
                      ? "linear-gradient(135deg, #4d7a99, #8fb8d1)"
                      : "#f7fafc",
                    border: isBundleSelected ? "1px solid transparent" : "1px solid #cfdce4",
                    boxShadow: isBundleSelected ? "0 4px 14px rgba(77, 122, 153, 0.32)" : "none",
                  }}
                  onClick={() => onToggle(bundleItem.id)}
                >
                  <div
                    className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300"
                    style={
                      isBundleSelected
                        ? { background: "rgba(255, 255, 255, 0.22)", border: "1px solid rgba(255, 255, 255, 0.65)" }
                        : { background: "#eef3f6", border: "2px solid #cfdce4" }
                    }
                  >
                    {isBundleSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <span
                    className="flex-1 min-w-0 text-[14px] font-bold transition-colors"
                    style={{ color: isBundleSelected ? "#ffffff" : "#17222c" }}
                  >
                    {bundleItem.name}
                  </span>

                  <span
                    className="px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider shrink-0"
                    style={
                      isBundleSelected
                        ? { background: "rgba(255, 255, 255, 0.22)", color: "#ffffff" }
                        : {
                            background: "rgba(77, 122, 153, 0.1)",
                            color: "#4d7a99",
                            border: "1px solid rgba(77, 122, 153, 0.2)",
                          }
                    }
                  >
                    100%
                  </span>

                  <span
                    className="font-mono text-[15px] font-bold shrink-0 text-right transition-colors"
                    style={{ color: isBundleSelected ? "#ffffff" : "#4d7a99", minWidth: "74px" }}
                  >
                    {formatPHP(bundlePhp)}
                  </span>
                </div>
              )}

              <div
                className="flex flex-col gap-2.5 pl-4 border-l-[3px] py-1"
                style={{ borderColor: isBundleSelected ? "#4d7a99" : "#e2eaef" }}
              >
                {actItems.map((item: any) => {
                  const val = selections[item.id] ?? 0;
                  const isChecked = val > 0;
                  const isLocked = isActCoveredByBundle(selections, item.id);
                  const primoUnits = PRIMO_PULL_UNITS[item.id];
                  const primoRate = primoUnits ? getPrimoResourceRate(primoResourceLevel ?? 0) : null;
                  const itemPhp = primoRate
                    ? primoRate.php * primoUnits
                    : typeof item.price === "object"
                      ? item.price.php
                      : item.price;
                  const isInteractive = !item.isQuantity && !isLocked;
                  const itemMax = typeof item.max === "number" ? item.max : undefined;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 transition-opacity ${isInteractive ? `cursor-pointer group/item ${FOCUS_RING}` : ""}`}
                      {...(item.isQuantity ? {} : checkboxA11y(isChecked || isLocked, () => onToggle(item.id), isLocked))}
                      style={{ opacity: isLocked ? 0.45 : 1 }}
                      onClick={() => isInteractive && onToggle(item.id)}
                    >
                      {item.isQuantity ? (
                        <div
                          className="flex items-center rounded-lg overflow-hidden bg-white shrink-0"
                          style={{
                            width: "64px",
                            border: isChecked ? "1px solid #4d7a99" : "1px solid #cfdce4",
                            boxShadow: isChecked ? "0 0 0 2px rgba(77,122,153,0.12)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <input
                            type="number"
                            min={0}
                            max={itemMax}
                            step={1}
                            value={val === 0 ? "" : val}
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                onQuantityChange(item.id, 0);
                                return;
                              }
                              const parsed = Math.max(0, parseInt(raw, 10) || 0);
                              onQuantityChange(
                                item.id,
                                itemMax === undefined ? parsed : Math.min(itemMax, parsed)
                              );
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full text-center py-1.5"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: isChecked ? "#17222c" : "#56697a",
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              MozAppearance: "textfield",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300"
                          style={
                            isChecked || isLocked
                              ? {
                                  background: isLocked ? "#cfdce4" : "linear-gradient(135deg, #4d7a99, #8fb8d1)",
                                  border: "none",
                                  boxShadow: isLocked ? "none" : "0 3px 8px rgba(77, 122, 153, 0.3)",
                                  transform: isLocked ? "none" : "scale(1.05)",
                                }
                              : { background: "#eef3f6", border: "2px solid #cfdce4" }
                          }
                        >
                          {(isChecked || isLocked) && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      )}

                      <span
                        className="flex-1 text-[14px] transition-colors"
                        style={{ color: isChecked || isLocked ? "#17222c" : "#5c7284", fontWeight: isChecked || isLocked ? 700 : 500 }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-[14px] font-mono font-bold transition-colors"
                        style={{ color: isChecked ? "#4d7a99" : "#627789" }}
                      >
                        {isLocked
                          ? "—"
                          : formatItemPHP(itemPhp * (item.isQuantity && isChecked ? val : 1))}
                      </span>
                    </div>
                  );
                })}
              </div>
              {Array.isArray(group?.items) && group.items.some((i: any) => String(i?.id || "").startsWith("hunt_primo_")) && (
                <div className="flex flex-col gap-2.5 px-4 py-3 border-t" style={{ borderColor: "#e2eaef" }}>
                  <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#56697a" }}>
                    Resource Level
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: "#627789" }}>
                    Mid / High replace the pull prices above with a flat rate per 10 pulls.
                  </div>
                  {[
                    { level: 0, label: "Low (Low exploration / High resource)", price: "Base pricing" },
                    {
                      level: 1,
                      label: "Mid (Mid exploration / Mid resource)",
                      price: `${formatItemPHP(getPrimoResourceRate(1)?.php ?? 0)} / $${(getPrimoResourceRate(1)?.usd ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} per 10 pulls`,
                    },
                    {
                      level: 2,
                      label: "High (High exploration / Low resource)",
                      price: `${formatItemPHP(getPrimoResourceRate(2)?.php ?? 0)} / $${(getPrimoResourceRate(2)?.usd ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} per 10 pulls`,
                    },
                  ].map((opt) => (
                    <label key={opt.level} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="primo-resource-level"
                        checked={(primoResourceLevel ?? 0) === opt.level}
                        onChange={() => onPrimoResourceChange && onPrimoResourceChange(opt.level)}
                        className="w-4 h-4"
                        style={{ accentColor: "#4d7a99" }}
                      />
                      <span className="flex-1 text-[13px] font-medium" style={{ color: "#5c7284" }}>
                        {opt.label}
                      </span>
                      <span className="font-mono text-[12px] font-bold" style={{ color: "#4d7a99" }}>
                        {opt.price}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
