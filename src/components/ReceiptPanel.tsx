import { useRef, useState } from "react";
import { Download, Trash2, User } from "lucide-react";

const PAYPAL_USD_TO_PHP = 60.75;

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Clean Code: Helper functions to intelligently handle both Price types
function getPhp(price: any): number {
  return typeof price === "object" ? price.php : price;
}

function getUsd(price: any): number {
  return typeof price === "object" ? price.usd : price / PAYPAL_USD_TO_PHP;
}

export function ReceiptPanel({
  clientName,
  onClientNameChange,
  items,
  onClearAll,
  onRemoveItem,
}: {
  clientName: string;
  onClientNameChange: (name: string) => void;
  items: any[];
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Intelligently calculate totals using the helpers
  const totalPhp = items.reduce((sum, item) => sum + getPhp(item.price), 0);
  const totalUsd = items.reduce((sum, item) => sum + getUsd(item.price), 0);

  const handleExport = async () => {
    if (items.length === 0) return;
    setIsExporting(true);
    try {
      await exportReceiptAsPNG(
        clientName || "Client",
        items,
        totalPhp,
        totalUsd,
        new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside
      className="flex flex-col h-full bg-white"
      style={{
        borderLeft: "1px solid rgba(74, 144, 226, 0.15)",
        boxShadow: "-4px 0 24px rgba(74, 144, 226, 0.05)",
      }}
    >
      {/* Panel Header */}
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid rgba(74, 144, 226, 0.1)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1e3a5f",
                letterSpacing: "0.02em",
              }}
            >
              Live Receipt
            </h3>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: "#6082a6",
                marginTop: "2px",
              }}
            >
              {items.length === 0 ? "No services selected" : `${items.length} service${items.length !== 1 ? "s" : ""} added`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 hover:bg-red-50 hover:text-red-500 hover:border-red-100"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                color: "#829ab1",
                background: "rgba(74, 144, 226, 0.04)",
                border: "1px solid rgba(74, 144, 226, 0.1)",
              }}
            >
              <Trash2 size={11} />
              Clear
            </button>
          )}
        </div>

        {/* Client Name */}
        <div className="relative">
          <User
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6082a6]"
          />
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg transition-all duration-200 placeholder:text-[#a0b8d0]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#1e3a5f",
              background: "rgba(74, 144, 226, 0.04)",
              border: "1px solid rgba(74, 144, 226, 0.15)",
              outline: "none",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "#4a90e2";
              (e.target as HTMLInputElement).style.background = "#fff";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "rgba(74, 144, 226, 0.15)";
              (e.target as HTMLInputElement).style.background = "rgba(74, 144, 226, 0.04)";
            }}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3" ref={receiptRef}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74, 144, 226, 0.08)", color: "#4a90e2" }}
            >
              <span style={{ fontSize: "20px" }}>🧾</span>
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#6082a6",
                textAlign: "center",
              }}
            >
              Select services from the left to build your receipt
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {groupByCategory(items).map(({ categoryLabel, services }) => (
              <div key={categoryLabel} className="mb-3">
                <p
                  className="mb-1.5"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#829ab1",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  {categoryLabel}
                </p>
                {services.map((item, idx) => (
                  <LineItem key={`${item.id}-${idx}`} item={item} onRemove={() => onRemoveItem(item.id)} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total + Export */}
      <div
        className="px-5 pb-5 pt-4 bg-[#f8fbfe]"
        style={{ borderTop: "1px solid rgba(74, 144, 226, 0.1)" }}
      >
        <div
          className="rounded-xl p-4 mb-4 bg-white"
          style={{
            border: "1px solid rgba(74, 144, 226, 0.2)",
            boxShadow: "0 2px 12px rgba(74, 144, 226, 0.04)"
          }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              color: "#829ab1",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            Grand Total
          </p>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "26px",
              fontWeight: 700,
              color: "#4a90e2",
              lineHeight: 1.1,
            }}
          >
            {formatPHP(totalPhp)}
          </div>
          <div
            className="flex items-center gap-1.5 mt-1"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              color: "#6082a6",
            }}
          >
            ≈
            <span style={{ color: "#1e3a5f", fontWeight: 600 }}>${totalUsd.toFixed(2)}</span>
            <span style={{ fontSize: "10px" }}>USD</span>
          </div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              color: "#829ab1",
              marginTop: "6px",
            }}
          >
            Rate: 1 USD = ₱{PAYPAL_USD_TO_PHP.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={items.length === 0 || isExporting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50"
          style={
            items.length > 0
              ? {
                  background: "linear-gradient(135deg, #4a90e2, #6bb0ff)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(74, 144, 226, 0.3)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }
              : {
                  background: "rgba(74, 144, 226, 0.05)",
                  color: "#829ab1",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                }
          }
        >
          <Download size={16} />
          {isExporting ? "Generating…" : "Export Clean Receipt"}
        </button>
      </div>
    </aside>
  );
}

/* ── Line Item ── */
function LineItem({
  item,
  onRemove,
}: {
  item: any;
  onRemove: () => void;
}) {
  const itemPhp = getPhp(item.price);
  
  return (
    <div className="flex items-start justify-between gap-2 py-2 group border-b border-transparent hover:border-[#eef3f9] transition-colors">
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#1e3a5f",
          }}
        >
          {item.name}
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "#6082a6",
            marginTop: "2px"
          }}
        >
          {item.detail}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4a90e2",
          }}
        >
          {`₱${itemPhp.toLocaleString("en-PH")}`}
        </span>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 text-[#a0b8d0] hover:text-red-500"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function groupByCategory(items: any[]) {
  const map = new Map<string, any[]>();
  for (const item of items) {
    if (!map.has(item.categoryLabel)) map.set(item.categoryLabel, []);
    map.get(item.categoryLabel)!.push(item);
  }
  return Array.from(map.entries()).map(([categoryLabel, services]) => ({
    categoryLabel,
    services,
  }));
}

/* ── Custom Light-Blue Canvas PNG export ── */
async function exportReceiptAsPNG(
  clientName: string,
  items: any[],
  totalPhp: number,
  totalUsd: number,
  dateStr: string
) {
  const W = 520;
  const PADDING = 32;
  const LINE_H = 24;
  const SECTION_GAP = 16;

  let h = 60 + PADDING * 2;
  h += 40; 
  h += SECTION_GAP * 2;
  h += items.length * LINE_H + SECTION_GAP;
  h += 2; 
  h += SECTION_GAP;
  h += 52 + SECTION_GAP; 
  h += 40; 
  h += PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // Background - Light Pastel Blue
  ctx.fillStyle = "#f4f8fb";
  ctx.fillRect(0, 0, W, h);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(74, 144, 226, 0.05)";
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Top accent bar - Suino Blue
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#4a90e2");
  grad.addColorStop(1, "#89b4e5");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  let y = PADDING + 6;

  // Logo area
  ctx.fillStyle = "rgba(74, 144, 226, 0.12)";
  roundRect(ctx, PADDING, y, 36, 36, 8);
  ctx.fill();
  ctx.fillStyle = "#4a90e2";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦", PADDING + 18, y + 24);

  ctx.textAlign = "left";
  ctx.fillStyle = "#1e3a5f";
  ctx.font = "800 18px 'JetBrains Mono', monospace";
  ctx.fillText("SUINO", PADDING + 48, y + 16);
  ctx.fillStyle = "#6082a6";
  ctx.font = "600 9px sans-serif";
  ctx.fillText("PILOTING SERVICE", PADDING + 48, y + 30);

  ctx.textAlign = "right";
  ctx.fillStyle = "#6082a6";
  ctx.font = "600 10px sans-serif";
  ctx.fillText("OFFICIAL RECEIPT", W - PADDING, y + 16);
  ctx.fillStyle = "#829ab1";
  ctx.font = "500 10px monospace";
  ctx.fillText(dateStr, W - PADDING, y + 30);

  y += 36 + SECTION_GAP * 2;

  // Divider
  ctx.strokeStyle = "rgba(74, 144, 226, 0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);

  y += SECTION_GAP;

  // Client name
  ctx.fillStyle = "#829ab1";
  ctx.font = "600 10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("BILLED TO", PADDING, y);
  ctx.fillStyle = "#1e3a5f";
  ctx.font = "700 14px sans-serif";
  ctx.fillText(clientName, PADDING, y + 18);

  y += 40;

  // Items header
  ctx.fillStyle = "#829ab1";
  ctx.font = "700 9px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DESCRIPTION", PADDING, y);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", W - PADDING, y);

  y += 14;

  // Divider
  ctx.strokeStyle = "rgba(74, 144, 226, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.stroke();

  y += 14;

  // Line items
  for (const item of items) {
    const itemPhp = getPhp(item.price);

    ctx.textAlign = "left";
    ctx.fillStyle = "#1e3a5f";
    ctx.font = "600 12px sans-serif";
    const shortName = item.name.length > 40 ? item.name.slice(0, 40) + "…" : item.name;
    ctx.fillText(shortName, PADDING, y);

    ctx.fillStyle = "#6082a6";
    ctx.font = "500 10px monospace";
    ctx.fillText(item.detail, PADDING, y + 14);

    ctx.textAlign = "right";
    ctx.fillStyle = "#4a90e2";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillText(`₱${itemPhp.toLocaleString("en-PH")}`, W - PADDING, y + 6);

    y += LINE_H;
  }

  y += SECTION_GAP;

  // Dashed divider
  ctx.strokeStyle = "rgba(74, 144, 226, 0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(W - PADDING, y);
  ctx.stroke();
  ctx.setLineDash([]);

  y += SECTION_GAP + 8;

  // Grand total box
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, PADDING, y, W - PADDING * 2, 56, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(74, 144, 226, 0.2)";
  ctx.lineWidth = 1;
  roundRect(ctx, PADDING, y, W - PADDING * 2, 56, 12);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#829ab1";
  ctx.font = "700 10px sans-serif";
  ctx.fillText("GRAND TOTAL", PADDING + 16, y + 20);

  ctx.fillStyle = "#6082a6";
  ctx.font = "500 11px monospace";
  ctx.fillText(`≈ $${totalUsd.toFixed(2)} USD`, PADDING + 16, y + 40);

  ctx.textAlign = "right";
  ctx.fillStyle = "#4a90e2";
  ctx.font = "800 24px 'JetBrains Mono', monospace";
  ctx.fillText(
    `₱${totalPhp.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    W - PADDING - 16,
    y + 34
  );

  y += 56 + SECTION_GAP * 2;

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#6082a6";
  ctx.font = "500 10px sans-serif";
  ctx.fillText("Thank you for choosing SUINO Piloting Service", W / 2, y);
  ctx.fillStyle = "#829ab1";
  ctx.font = "500 9px sans-serif";
  ctx.fillText("suino.ph · @SuinoPilotingService", W / 2, y + 16);

  // Download
  const link = document.createElement("a");
  link.download = `SUINO_Receipt_${clientName.replace(/\s+/g, "_")}_${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}