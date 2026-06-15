import { useRef, useState } from "react";
import { Download, Trash2, User } from "lucide-react";

const PAYPAL_USD_TO_PHP = 60.75;

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Clean Code: Helper functions for dual-currency objects
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
  const [currency, setCurrency] = useState<"PHP" | "USD">("USD"); // Defaulted to USD

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
        }),
        currency
      );
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside
      className="flex flex-col h-full bg-slate-50"
      style={{ borderLeft: "1px solid #e2e8f0" }}
    >
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-sans text-[14px] font-bold text-slate-700 tracking-wide">
              Live Receipt
            </h3>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">
              {items.length === 0 ? "No services selected" : `${items.length} service${items.length !== 1 ? "s" : ""} added`}
            </p>
          </div>
          
          {/* Controls: Currency Toggle & Clear Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setCurrency("PHP")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  currency === "PHP" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                PHP
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  currency === "USD" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                USD
              </button>
            </div>

            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                title="Clear All"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Client Name */}
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg transition-all duration-200 placeholder:text-slate-400 bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 focus:bg-white text-[13px] font-sans text-slate-700"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3" ref={receiptRef}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-400">
              <span style={{ fontSize: "20px" }}>🧾</span>
            </div>
            <p className="font-sans text-[13px] text-slate-500 text-center">
              Select services from the left to build your receipt
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {groupByCategory(items).map(({ categoryLabel, services }) => (
              <div key={categoryLabel} className="mb-4">
                <p className="mb-2 font-sans text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {categoryLabel}
                </p>
                {services.map((item, idx) => (
                  <LineItem 
                    key={`${item.id}-${idx}`} 
                    item={item} 
                    currency={currency} 
                    onRemove={() => onRemoveItem(item.id)} 
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total + Export */}
      <div className="px-5 pb-5 pt-4 bg-slate-100 border-t border-slate-200">
        <div className="rounded-xl p-4 mb-4 bg-slate-50 border border-slate-200 shadow-sm flex flex-col">
          <p className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Grand Total
          </p>
          
          <div className="font-mono text-[26px] font-bold text-slate-700 leading-tight">
            {currency === "PHP" ? formatPHP(totalPhp) : formatUSD(totalUsd)}
          </div>
          
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[13px] text-slate-500">
            ≈ <span className="text-slate-700 font-semibold">
              {currency === "PHP" ? formatUSD(totalUsd) : formatPHP(totalPhp)}
            </span>
            <span className="text-[10px]">{currency === "PHP" ? "USD" : "PHP"}</span>
          </div>

          <p className="font-sans text-[10px] text-slate-400 mt-2 border-t border-slate-200 pt-2">
            Rate: 1 USD = ₱{PAYPAL_USD_TO_PHP.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={items.length === 0 || isExporting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 text-white font-sans text-[14px] font-semibold"
          style={
            items.length > 0
              ? {
                  background: "linear-gradient(135deg, #5b82a8, #7296b8)",
                  boxShadow: "0 4px 14px rgba(91, 130, 168, 0.25)",
                }
              : {
                  background: "#e2e8f0",
                  color: "#94a3b8",
                  cursor: "not-allowed",
                  boxShadow: "none"
                }
          }
        >
          <Download size={16} />
          {isExporting ? "Generating…" : `Export ${currency} Receipt`}
        </button>
      </div>
    </aside>
  );
}

/* ── Line Item ── */
function LineItem({ item, currency, onRemove }: { item: any; currency: "PHP" | "USD"; onRemove: () => void }) {
  const itemPhp = getPhp(item.price);
  const itemUsd = getUsd(item.price);
  
  const displayPrice = currency === "PHP" 
    ? `₱${itemPhp.toLocaleString("en-PH")}` 
    : `$${itemUsd.toFixed(2)}`;

  return (
    <div className="flex items-start justify-between gap-2 py-2 group border-b border-transparent hover:border-slate-200 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="truncate font-sans text-[12px] font-semibold text-slate-700">
          {item.name}
        </p>
        <p className="font-mono text-[10px] text-slate-500 mt-0.5">
          {item.detail}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <span className="font-mono text-[12px] font-bold text-[#5b82a8]">
          {displayPrice}
        </span>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600"
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

/* ── Custom "Aesthetic Floating Card" Canvas PNG Export ── */
async function exportReceiptAsPNG(
  clientName: string,
  items: any[],
  totalPhp: number,
  totalUsd: number,
  dateStr: string,
  currency: "PHP" | "USD"
) {
  const bannerImg = await loadImage("/hero-banner.png").catch(() => null);

  const CANVAS_W = 600;
  const CARD_W = 520;
  const CARD_X = (CANVAS_W - CARD_W) / 2;
  const CARD_Y = 40;
  
  const BANNER_H = bannerImg ? (bannerImg.height / bannerImg.width) * CARD_W : 0;
  
  const PADDING = 32;
  const LINE_H = 26;
  const SECTION_GAP = 20;

  let cardH = BANNER_H;
  cardH += PADDING;
  cardH += 40; 
  cardH += SECTION_GAP;
  cardH += items.length * LINE_H + SECTION_GAP; 
  cardH += SECTION_GAP;
  cardH += 70; 
  cardH += 40; 
  cardH += PADDING;

  const CANVAS_H = cardH + (CARD_Y * 2);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W * 2;
  canvas.height = CANVAS_H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Floating Card
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#f8fafc";
  roundRect(ctx, CARD_X, CARD_Y, CARD_W, cardH, 16);
  ctx.fill();
  ctx.shadowColor = "transparent";

  let currentY = CARD_Y;

  // Banner
  if (bannerImg) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CARD_X + 16, CARD_Y);
    ctx.lineTo(CARD_X + CARD_W - 16, CARD_Y);
    ctx.quadraticCurveTo(CARD_X + CARD_W, CARD_Y, CARD_X + CARD_W, CARD_Y + 16);
    ctx.lineTo(CARD_X + CARD_W, CARD_Y + BANNER_H);
    ctx.lineTo(CARD_X, CARD_Y + BANNER_H);
    ctx.lineTo(CARD_X, CARD_Y + 16);
    ctx.quadraticCurveTo(CARD_X, CARD_Y, CARD_X + 16, CARD_Y);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(bannerImg, CARD_X, CARD_Y, CARD_W, BANNER_H);
    ctx.restore();

    ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
    ctx.fillRect(CARD_X, CARD_Y + BANNER_H, CARD_W, 2);
    
    currentY += BANNER_H + PADDING;
  } else {
    currentY += PADDING * 2;
  }

  // Header Details
  const leftAlign = CARD_X + PADDING;
  const rightAlign = CARD_X + CARD_W - PADDING;

  ctx.fillStyle = "#64748b";
  ctx.font = "600 10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("BILLED TO", leftAlign, currentY);
  
  ctx.textAlign = "right";
  ctx.fillText("OFFICIAL RECEIPT", rightAlign, currentY);

  ctx.fillStyle = "#334155";
  ctx.font = "700 16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(clientName, leftAlign, currentY + 20);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(dateStr, rightAlign, currentY + 20);

  currentY += 40 + SECTION_GAP;

  // Items Header
  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 9px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DESCRIPTION", leftAlign, currentY);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", rightAlign, currentY);

  currentY += 12;

  // Divider
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(leftAlign, currentY);
  ctx.lineTo(rightAlign, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 20;

  // Line Items Output
  for (const item of items) {
    const itemPhp = getPhp(item.price);
    const itemUsd = getUsd(item.price);
    
    const displayPrice = currency === "PHP" 
      ? `₱${itemPhp.toLocaleString("en-PH")}` 
      : `$${itemUsd.toFixed(2)}`;

    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = "600 13px sans-serif";
    const shortName = item.name.length > 40 ? item.name.slice(0, 40) + "…" : item.name;
    ctx.fillText(shortName, leftAlign, currentY);

    ctx.fillStyle = "#64748b";
    ctx.font = "500 10px monospace";
    ctx.fillText(item.detail, leftAlign, currentY + 16);

    ctx.textAlign = "right";
    ctx.fillStyle = "#5b82a8";
    ctx.font = "700 14px 'JetBrains Mono', monospace";
    ctx.fillText(displayPrice, rightAlign, currentY + 8);

    currentY += LINE_H;
  }

  currentY += SECTION_GAP;

  // Grand Total Box Output
  ctx.fillStyle = "#f1f5f9"; 
  roundRect(ctx, leftAlign, currentY, CARD_W - (PADDING * 2), 64, 12);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  roundRect(ctx, leftAlign, currentY, CARD_W - (PADDING * 2), 64, 12);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#64748b";
  ctx.font = "700 10px sans-serif";
  ctx.fillText("GRAND TOTAL", leftAlign + 16, currentY + 24);

  const bigTotal = currency === "PHP"
    ? `₱${totalPhp.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
  const smallTotal = currency === "PHP"
    ? `≈ $${totalUsd.toFixed(2)} USD`
    : `≈ ₱${totalPhp.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  ctx.fillStyle = "#64748b";
  ctx.font = "500 12px monospace";
  ctx.fillText(smallTotal, leftAlign + 16, currentY + 46);

  ctx.textAlign = "right";
  ctx.fillStyle = "#334155"; 
  ctx.font = "800 26px 'JetBrains Mono', monospace";
  ctx.fillText(bigTotal, rightAlign - 16, currentY + 40);

  currentY += 64 + SECTION_GAP + 10;

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748b";
  ctx.font = "500 11px sans-serif";
  ctx.fillText("Thank you for choosing SUINO Piloting Service", CARD_X + (CARD_W / 2), currentY);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 10px sans-serif";
  ctx.fillText("suino.ph · @SuinoPilotingService", CARD_X + (CARD_W / 2), currentY + 16);

  // Download Trigger
  const link = document.createElement("a");
  link.download = `SUINO_Receipt_${clientName.replace(/\s+/g, "_")}_${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}