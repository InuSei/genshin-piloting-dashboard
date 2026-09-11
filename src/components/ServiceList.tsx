import type { Category, ServiceSelection } from "../data/services";

interface ServiceListProps {
  category: Category;
  selections: ServiceSelection;
  onToggleCheckbox: (serviceId: string) => void;
  onQuantityChange: (serviceId: string, value: number) => void;
}

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

export function ServiceList({
  category,
  selections,
  onToggleCheckbox,
  onQuantityChange,
}: ServiceListProps) {
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

      <div className="flex flex-col gap-3">
        {category.services.map((service) => {
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
    <div className="flex items-center gap-4 cursor-pointer" onClick={onToggle}>
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
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#7891a3", marginTop: "3px", lineHeight: 1.4 }}>
          {service.description}
        </p>
      </div>

      <div
        className="shrink-0 text-right"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 800, color: isChecked ? "#4d7a99" : "#9db0bc" }}
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
            color: isActive ? "#17222c" : "#7891a3",
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
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#7891a3", marginTop: "3px", lineHeight: 1.4 }}>
          {service.description}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "16px", fontWeight: 800, color: isActive ? "#4d7a99" : "#9db0bc" }}>
          {formatPHP(price)}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, color: "#7891a3", marginTop: "2px" }}>
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
}: {
  service: any;
  selections: Record<string, number>;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, value: number) => void;
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
        {service.groups.map((group: any) => (
          <div key={group.name} className="flex flex-col gap-3">
            <h4 className="text-[12px] font-extrabold tracking-widest uppercase" style={{ color: "#7891a3" }}>
              {group.name}
            </h4>

            <div className="flex flex-col gap-2.5 pl-4 border-l-[3px] py-1" style={{ borderColor: "#e2eaef" }}>
              {group.items.map((item: any) => {
                const val = selections[item.id] ?? 0;
                const isChecked = val > 0;
                const itemPhp = typeof item.price === "object" ? item.price.php : item.price;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 ${!item.isQuantity ? "cursor-pointer group/item" : ""}`}
                    onClick={() => !item.isQuantity && onToggle(item.id)}
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
                            onQuantityChange(item.id, parsed);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-full text-center py-1.5"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: isChecked ? "#17222c" : "#7891a3",
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
                          isChecked
                            ? {
                                background: "linear-gradient(135deg, #4d7a99, #8fb8d1)",
                                border: "none",
                                boxShadow: "0 3px 8px rgba(77, 122, 153, 0.3)",
                                transform: "scale(1.05)",
                              }
                            : { background: "#eef3f6", border: "2px solid #cfdce4" }
                        }
                      >
                        {isChecked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    )}

                    <span
                      className="flex-1 text-[14px] transition-colors"
                      style={{ color: isChecked ? "#17222c" : "#5c7284", fontWeight: isChecked ? 700 : 500 }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-[14px] font-mono font-bold transition-colors"
                      style={{ color: isChecked ? "#4d7a99" : "#9db0bc" }}
                    >
                      ₱{(itemPhp * (item.isQuantity && isChecked ? val : 1)).toLocaleString("en-PH")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}