// Shared price overrides, stored in Upstash Redis (Vercel Marketplace).
//   GET  /api/prices        → public, read by every page on load
//   POST /admin/api/prices  → admin only (rewritten here by vercel.json)
//
// ESM on Vercel needs the .js extension on relative imports.
import { isAdmin, unauthorized } from "./_auth.js";
import {
  GENSHIN_STORAGE_KEY,
  HSR_STORAGE_KEY,
  normalizeOverrides,
} from "../src/data/priceStorage.js";

// Vercel's Upstash integration injects one of these pairs.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const STORAGE_KEYS = { genshin: GENSHIN_STORAGE_KEY, hsr: HSR_STORAGE_KEY } as const;

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

export async function GET(): Promise<Response> {
  try {
    const [genshin, hsr] = (await redis(["MGET", "prices:genshin", "prices:hsr"])) as (string | null)[];
    return Response.json(
      { genshin: genshin ? JSON.parse(genshin) : null, hsr: hsr ? JSON.parse(hsr) : null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load prices" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!isAdmin(request)) return unauthorized();

  let body: { game?: unknown; overrides?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.game !== "genshin" && body.game !== "hsr") {
    return Response.json({ error: "Unknown game" }, { status: 400 });
  }
  const overrides = normalizeOverrides(body.overrides, STORAGE_KEYS[body.game]);
  if (!overrides) return Response.json({ error: "Invalid price overrides" }, { status: 400 });

  try {
    await redis(["SET", `prices:${body.game}`, JSON.stringify(overrides)]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not save prices" }, { status: 500 });
  }
}
