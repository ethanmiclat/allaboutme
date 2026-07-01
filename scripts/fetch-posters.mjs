// Resolves real poster art for every title in src/lib/catalogue.json and writes
// the result to src/lib/posters.json as a { "kind:title": "https://…" } map that
// films.ts reads at build time.
//
//   movie / tv  → The Movie Database (needs a free API key)
//   book        → Open Library covers (no key required)
//
// Usage:
//   TMDB_API_KEY=your_key npm run posters
//
// Get a key at https://www.themoviedb.org/settings/api (v3 "API Key").
// Books still resolve without a key; movies/shows/anime are skipped without one.

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Load TMDB_API_KEY from .env.local / .env (gitignored) so it can live in a file
// instead of being passed on every command. Precedence (high → low): inline
// `TMDB_API_KEY=… npm run posters`, then .env.local, then .env.
const inlineKey = process.env.TMDB_API_KEY;
for (const f of [".env", ".env.local"]) {
  const p = join(ROOT, f);
  if (existsSync(p)) process.loadEnvFile(p); // later files overwrite earlier ones
}
if (inlineKey) process.env.TMDB_API_KEY = inlineKey;
const CATALOGUE = join(ROOT, "src/lib/catalogue.json");
const OUT = join(ROOT, "src/lib/posters.json");

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const j = async (url) => {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
};

async function tmdbPoster(title, kind) {
  if (!TMDB_KEY) return null;
  const url =
    `https://api.themoviedb.org/3/search/${kind}` +
    `?api_key=${TMDB_KEY}&include_adult=false&query=${encodeURIComponent(title)}`;
  const data = await j(url);
  const results = (data.results ?? []).filter((r) => r.poster_path);
  if (!results.length) return null;
  // Prefer an exact title match (so "Game of Thrones" doesn't lose to the more
  // popular "House of the Dragon"); otherwise fall back to the most popular hit
  // (so loose titles like "The Office" still land on the well-known one).
  const norm = (s) => (s ?? "").toLowerCase().trim();
  const exact = results.filter((r) => norm(r.name ?? r.title) === norm(title));
  const hit = (exact.length ? exact : results).sort(
    (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
  )[0];
  return TMDB_IMG + hit.poster_path;
}

async function bookCover(title) {
  const data = await j(
    `https://openlibrary.org/search.json?limit=5&title=${encodeURIComponent(title)}`,
  );
  const hit = (data.docs ?? []).find((d) => d.cover_i);
  return hit ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null;
}

async function resolve(title, kind) {
  return kind === "book" ? bookCover(title) : tmdbPoster(title, kind);
}

const main = async () => {
  const { rows } = JSON.parse(await readFile(CATALOGUE, "utf8"));
  if (!TMDB_KEY) {
    console.warn(
      "⚠  No TMDB_API_KEY set — movies/shows/anime will be skipped (books still resolve).\n" +
        "   Get a key at https://www.themoviedb.org/settings/api and re-run:\n" +
        "   TMDB_API_KEY=your_key npm run posters\n",
    );
  }

  const out = {};
  let found = 0;
  let missed = 0;
  for (const row of rows) {
    for (const entry of row.titles) {
      // An entry is a bare title string, or { title, query?, poster? } where
      // `query` overrides the search term and `poster` hard-codes the art.
      const title = typeof entry === "string" ? entry : entry.title;
      const query = typeof entry === "string" ? entry : entry.query ?? entry.title;
      const override = typeof entry === "object" ? entry.poster : undefined;
      const key = `${row.kind}:${title}`;
      try {
        const poster = override ?? (await resolve(query, row.kind));
        if (poster) {
          out[key] = poster;
          found++;
          console.log(`✓ ${key}`);
        } else {
          missed++;
          console.log(`·  ${key} — no art found`);
        }
      } catch (err) {
        missed++;
        console.log(`✗ ${key} — ${err.message}`);
      }
    }
  }

  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${found} poster(s) to src/lib/posters.json (${missed} unresolved).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
