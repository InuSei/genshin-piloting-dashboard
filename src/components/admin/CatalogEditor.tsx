// Building blocks for the admin Price Editor: price/text fields plus editors
// for service cards (sections + items) and exploration regions (sub-areas).
// Every edit is staged in the editor until "Save All".

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Lock, Plus, Tag, Trash2 } from "lucide-react";
import type { CatalogItem, CatalogRegion, CatalogService } from "../../data/catalog";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

function move<T>(list: T[], index: number, dir: -1 | 1): void {
  const target = index + dir;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
}

export function parseCurrencyInput(raw: string): number | null {
  const normalized = raw.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;

  const value = Number(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function CurrencyInput({
  value,
  onChange,
  className = "flex-1",
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  label?: string;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setDraft(String(value));
  }, [isEditing, value]);

  const commitDraft = () => {
    const nextValue = parseCurrencyInput(draft);
    if (nextValue === null) {
      setDraft(String(value));
    } else {
      onChange(nextValue);
      setDraft(String(nextValue));
    }
    setIsEditing(false);
  };

  return (
    <div className={className} style={{ minWidth: 0 }}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        value={draft}
        onFocus={(event) => {
          setIsEditing(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          setIsEditing(true);
          const nextValue = parseCurrencyInput(nextDraft);
          if (nextValue !== null) onChange(nextValue);
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full px-2 py-2 text-[13px] font-mono font-semibold bg-white rounded-lg outline-none transition-all focus:border-[#4d7a99] focus:ring-2 focus:ring-[rgba(77,122,153,0.18)]"
        style={{ border: "1px solid #cfdce4", color: "#17222c" }}
      />
    </div>
  );
}

export function RatePair({
  valuePhp,
  valueUsd,
  onPhp,
  onUsd,
  label = "",
}: {
  valuePhp: number;
  valueUsd: number;
  onPhp: (v: number) => void;
  onUsd: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[12px] font-bold shrink-0" style={{ color: "#627789" }}>₱</span>
      <CurrencyInput value={valuePhp} onChange={onPhp} label={`${label} price in pesos`.trim()} />
      <span className="text-[12px] font-bold shrink-0" style={{ color: "#627789" }}>$</span>
      <CurrencyInput value={valueUsd} onChange={onUsd} label={`${label} price in dollars`.trim()} />
    </div>
  );
}

function TextInput({
  value,
  onChange,
  label,
  className = "",
  strong = false,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  className?: string;
  strong?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      aria-label={label}
      placeholder={placeholder ?? label}
      onChange={(e) => onChange(e.target.value)}
      className={`min-w-0 px-2 py-1.5 rounded-lg bg-transparent outline-none transition-all hover:bg-white focus:bg-white focus:ring-2 focus:ring-[rgba(77,122,153,0.18)] ${className}`}
      style={{
        border: value.trim() ? "1px solid transparent" : "1px solid #e08a95",
        color: strong ? "#17222c" : "#3c4d59",
        fontWeight: strong ? 700 : 500,
      }}
    />
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 inline-flex items-center justify-center rounded-lg transition-colors hover:bg-[#eef3f6] disabled:opacity-30 disabled:hover:bg-transparent shrink-0"
      style={{ color: danger ? "#b3303f" : "#56697a" }}
    >
      {children}
    </button>
  );
}

function MoveButtons({ index, count, onMove, what }: { index: number; count: number; onMove: (dir: -1 | 1) => void; what: string }) {
  return (
    <>
      <IconButton label={`Move ${what} up`} onClick={() => onMove(-1)} disabled={index === 0}>
        <ChevronUp size={15} />
      </IconButton>
      <IconButton label={`Move ${what} down`} onClick={() => onMove(1)} disabled={index === count - 1}>
        <ChevronDown size={15} />
      </IconButton>
    </>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors hover:bg-[#eef3f6]"
      style={{ color: "#4d7a99", border: "1px dashed #b8cad6" }}
    >
      <Plus size={14} aria-hidden="true" />
      {children}
    </button>
  );
}

function LockBadge({ what }: { what: string }) {
  return (
    <span
      title={`${what} is used by the calculator's built-in logic, so it can't be deleted`}
      className="w-7 h-7 inline-flex items-center justify-center shrink-0"
      style={{ color: "#8fa4b3" }}
    >
      <Lock size={13} aria-label="Protected" />
    </span>
  );
}

export interface CatalogEditContext {
  protectedIds: Set<string>;
  newId: (prefix: string) => string;
}

function ItemRow({
  item,
  index,
  count,
  isProtected,
  onChange,
  onMove,
  onDelete,
}: {
  item: CatalogItem;
  index: number;
  count: number;
  isProtected: boolean;
  onChange: (fn: (draft: CatalogItem) => void) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const label = item.name || "Item";
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f7fafc]"
      style={item.isBundle ? { background: "#eef3f6", border: "1px solid #cfdce4" } : { border: "1px solid transparent" }}
    >
      <TextInput
        value={item.name}
        onChange={(v) => onChange((d) => { d.name = v; })}
        label="Item name"
        className="flex-1 basis-48 text-[13px]"
      />
      {item.isBundle ? (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest" style={{ color: "#4d7a99", background: "rgba(77, 122, 153, 0.12)" }}>
          100% bundle
        </span>
      ) : (
        <select
          aria-label={`${label} type`}
          value={item.isQuantity ? "quantity" : "checkbox"}
          disabled={isProtected}
          onChange={(e) =>
            onChange((d) => {
              if (e.target.value === "quantity") d.isQuantity = true;
              else {
                delete d.isQuantity;
                delete d.max;
              }
            })
          }
          className="px-1.5 py-1.5 rounded-lg text-[12px] font-semibold bg-white disabled:opacity-60"
          style={{ border: "1px solid #cfdce4", color: "#3c4d59" }}
        >
          <option value="checkbox">Checkbox</option>
          <option value="quantity">Quantity</option>
        </select>
      )}
      {item.isQuantity && (
        <label className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#56697a" }}>
          max
          <input
            type="number"
            min={1}
            max={9999}
            step={1}
            value={item.max ?? ""}
            placeholder="∞"
            aria-label={`${label} maximum quantity`}
            onChange={(e) =>
              onChange((d) => {
                const parsed = parseInt(e.target.value, 10);
                if (Number.isFinite(parsed) && parsed >= 1) d.max = Math.min(9999, parsed);
                else delete d.max;
              })
            }
            className="w-16 px-1.5 py-1.5 rounded-lg text-[12px] font-mono bg-white"
            style={{ border: "1px solid #cfdce4", color: "#17222c" }}
          />
        </label>
      )}
      <div className="w-[210px] shrink-0">
        <RatePair
          label={label}
          valuePhp={item.price.php}
          valueUsd={item.price.usd}
          onPhp={(v) => onChange((d) => { d.price.php = v; })}
          onUsd={(v) => onChange((d) => { d.price.usd = v; })}
        />
      </div>
      <div className="flex items-center shrink-0">
        <MoveButtons index={index} count={count} onMove={onMove} what={label} />
        {isProtected ? (
          <LockBadge what={label} />
        ) : (
          <IconButton label={`Delete ${label}`} onClick={onDelete} danger>
            <Trash2 size={14} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

export function ServiceCardEditor({
  service,
  index,
  count,
  ctx,
  onChange,
  onMove,
  onDelete,
}: {
  service: CatalogService;
  index: number;
  count: number;
  ctx: CatalogEditContext;
  onChange: (next: CatalogService) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const edit = (fn: (draft: CatalogService) => void) => {
    const next = clone(service);
    fn(next);
    onChange(next);
  };
  const isItemProtected = (item: CatalogItem) => ctx.protectedIds.has(item.id) || !!item.isBundle;
  const cardHasProtected = service.groups.some((g) => g.items.some(isItemProtected));
  const itemTotal = service.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e2eaef" }}>
      <div
        className="flex items-start gap-3 px-4 py-3"
        style={{ background: "linear-gradient(180deg,#fafcfd,#f2f6f9)", borderBottom: "1px solid #eef3f6" }}
      >
        <div className="w-8 h-8 mt-1 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(77,122,153,0.1)" }}>
          <Tag size={15} style={{ color: "#4d7a99" }} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <TextInput value={service.name} onChange={(v) => edit((d) => { d.name = v; })} label="Card name" strong className="flex-1 basis-48 text-[15px]" />
            <TextInput value={service.tag ?? ""} onChange={(v) => edit((d) => { if (v) d.tag = v; else delete d.tag; })} label="Tag (optional)" className="w-36 text-[11px] uppercase" />
          </div>
          <TextInput
            value={service.description}
            onChange={(v) => edit((d) => { d.description = v; })}
            label="Description (optional)"
            className="w-full text-[12px]"
          />
        </div>
        <div className="flex items-center shrink-0">
          <MoveButtons index={index} count={count} onMove={onMove} what={`card ${service.name}`} />
          {cardHasProtected ? (
            <LockBadge what={`Card ${service.name}`} />
          ) : (
            <IconButton
              label={`Delete card ${service.name}`}
              danger
              onClick={() => {
                if (confirm(`Delete the card “${service.name}” and its ${itemTotal} item${itemTotal !== 1 ? "s" : ""}?`)) onDelete();
              }}
            >
              <Trash2 size={14} />
            </IconButton>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {service.groups.map((group, gi) => {
          const groupHasProtected = group.items.some(isItemProtected);
          return (
            <div key={gi} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-mono text-[10px] font-bold" style={{ color: "#4d7a99" }}>
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <TextInput
                  value={group.name}
                  onChange={(v) => edit((d) => { d.groups[gi].name = v; })}
                  label="Section name"
                  className="flex-1 text-[11px] font-extrabold uppercase tracking-widest"
                />
                <MoveButtons index={gi} count={service.groups.length} onMove={(dir) => edit((d) => move(d.groups, gi, dir))} what={`section ${group.name}`} />
                {groupHasProtected ? (
                  <LockBadge what={`Section ${group.name}`} />
                ) : (
                  <IconButton
                    label={`Delete section ${group.name}`}
                    danger
                    onClick={() => {
                      const n = group.items.length;
                      if (n === 0 || confirm(`Delete the section “${group.name}” and its ${n} item${n !== 1 ? "s" : ""}?`)) {
                        edit((d) => { d.groups.splice(gi, 1); });
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </div>
              {group.items.map((item, ii) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={ii}
                  count={group.items.length}
                  isProtected={isItemProtected(item)}
                  onChange={(fn) => edit((d) => fn(d.groups[gi].items[ii]))}
                  onMove={(dir) => edit((d) => move(d.groups[gi].items, ii, dir))}
                  onDelete={() => edit((d) => { d.groups[gi].items.splice(ii, 1); })}
                />
              ))}
              <div className="pl-2 pt-1">
                <AddButton onClick={() => edit((d) => { d.groups[gi].items.push({ id: ctx.newId("item"), name: "New item", price: { php: 0, usd: 0 } }); })}>
                  Add item
                </AddButton>
              </div>
            </div>
          );
        })}
        <AddButton onClick={() => edit((d) => { d.groups.push({ name: "New section", items: [] }); })}>Add section</AddButton>
      </div>
    </div>
  );
}

export function RegionListEditor({
  regions,
  ctx,
  onChange,
}: {
  regions: CatalogRegion[];
  ctx: CatalogEditContext;
  onChange: (next: CatalogRegion[]) => void;
}) {
  const edit = (fn: (draft: CatalogRegion[]) => void) => {
    const next = clone(regions);
    fn(next);
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      {regions.map((region, ri) => (
        <div key={region.id} style={{ borderTop: ri !== 0 ? "1px solid #eef3f6" : "none" }}>
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-[#f7fafc]">
            <TextInput value={region.name} onChange={(v) => edit((d) => { d[ri].name = v; })} label="Region name" strong className="flex-1 basis-40 text-[13px]" />
            <TextInput value={region.tag} onChange={(v) => edit((d) => { d[ri].tag = v; })} label="Patch tag" placeholder="Patch tag (optional)" className="w-36 text-[11px] uppercase" />
            <div className="flex items-center">
              <MoveButtons index={ri} count={regions.length} onMove={(dir) => edit((d) => move(d, ri, dir))} what={`region ${region.name}`} />
              <IconButton
                label={`Delete region ${region.name}`}
                danger
                onClick={() => {
                  const n = region.subAreas.length;
                  if (n === 0 || confirm(`Delete the region “${region.name}” and its ${n} sub-area${n !== 1 ? "s" : ""}?`)) {
                    edit((d) => { d.splice(ri, 1); });
                  }
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </div>
          <div className="flex flex-col px-2 py-1">
            {region.subAreas.map((sa, ai) => (
              <div key={sa.id} className="flex flex-wrap items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#f7fafc]">
                <TextInput value={sa.name} onChange={(v) => edit((d) => { d[ri].subAreas[ai].name = v; })} label="Sub-area name" className="flex-1 basis-40 text-[13px]" />
                <div className="w-[210px] shrink-0">
                  <RatePair
                    label={`${sa.name} per 1%`}
                    valuePhp={sa.pricePerPct.php}
                    valueUsd={sa.pricePerPct.usd}
                    onPhp={(v) => edit((d) => { d[ri].subAreas[ai].pricePerPct.php = v; })}
                    onUsd={(v) => edit((d) => { d[ri].subAreas[ai].pricePerPct.usd = v; })}
                  />
                </div>
                <div className="flex items-center">
                  <MoveButtons index={ai} count={region.subAreas.length} onMove={(dir) => edit((d) => move(d[ri].subAreas, ai, dir))} what={`sub-area ${sa.name}`} />
                  <IconButton label={`Delete sub-area ${sa.name}`} danger onClick={() => edit((d) => { d[ri].subAreas.splice(ai, 1); })}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            ))}
            <div className="px-2 py-1.5">
              <AddButton onClick={() => edit((d) => { d[ri].subAreas.push({ id: ctx.newId("area"), name: "New area", pricePerPct: { php: 0, usd: 0 } }); })}>
                Add sub-area
              </AddButton>
            </div>
          </div>
        </div>
      ))}
      <div className="px-4 py-3" style={{ borderTop: "1px solid #eef3f6" }}>
        <AddButton onClick={() => edit((d) => { d.push({ id: ctx.newId("region"), name: "New region", tag: "", subAreas: [] }); })}>Add region</AddButton>
      </div>
    </div>
  );
}
