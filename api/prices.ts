// Shared catalog (services + prices), stored in Upstash Redis (Vercel Marketplace).
//   GET  /api/prices        → public, read by every page on load
//   POST /admin/api/prices  → admin only (rewritten here by vercel.json)
//     { game, action: "save", catalog }  validate + save, keeping the previous version
//     { game, action: "restore" }        undo the last save
//
// Older price-only overrides (prices:<game>) are still returned so sites that
// never saved a catalog keep their prices.
//
// ESM on Vercel needs the .js extension on relative imports.
import { isAdmin, unauthorized } from "./_auth.js";
import { LIMITS, normalizeCatalog, type CatalogGame } from "../src/data/catalog.js";

// Vercel's Upstash integration injects one of these pairs.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const HISTORY_LENGTH = 10;
// Stored in history when there was no catalog yet, so undo can return to "none".
const NO_CATALOG = "null";

async function redis(command: string[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error("Redis env vars are not set");
  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

const parse = (raw: string | null) => (raw ? JSON.parse(raw) : null);

export async function GET(): Promise<Response> {
  try {
    const [genshin, hsr, catalogGenshin, catalogHsr] = (await redis([
      "MGET", "prices:genshin", "prices:hsr", "catalog:genshin", "catalog:hsr",
    ])) as (string | null)[];
    return Response.json(
      {
        genshin: parse(genshin),
        hsr: parse(hsr),
        catalog: { genshin: parse(catalogGenshin), hsr: parse(catalogHsr) },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load prices" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!isAdmin(request)) return unauthorized();

  const raw = await request.text();
  if (raw.length > LIMITS.json + 1000) return Response.json({ error: "Request too large" }, { status: 413 });

  let body: { game?: unknown; action?: unknown; catalog?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.game !== "genshin" && body.game !== "hsr") {
    return Response.json({ error: "Unknown game" }, { status: 400 });
  }
  const game: CatalogGame = body.game;
  const key = `catalog:${game}`;
  const historyKey = `${key}:history`;

  try {
    if (body.action === "save") {
      const result = normalizeCatalog(body.catalog, game);
      if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

      const previous = (await redis(["GET", key])) as string | null;
      await redis(["LPUSH", historyKey, previous ?? NO_CATALOG]);
      await redis(["LTRIM", historyKey, "0", String(HISTORY_LENGTH - 1)]);
      await redis(["SET", key, JSON.stringify(result.catalog)]);
      return Response.json({ ok: true });
    }

    if (body.action === "restore") {
      const previous = (await redis(["LPOP", historyKey])) as string | null;
      if (previous === null) return Response.json({ error: "Nothing to undo" }, { status: 409 });
      if (previous === NO_CATALOG) {
        await redis(["DEL", key]);
        return Response.json({ ok: true, catalog: null });
      }
      await redis(["SET", key, previous]);
      return Response.json({ ok: true, catalog: JSON.parse(previous) });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not save" }, { status: 500 });
  }
}
