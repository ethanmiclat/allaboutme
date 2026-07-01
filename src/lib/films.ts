import catalogue from "./catalogue.json";
import posters from "./posters.json";

export interface FlixItem {
  /** Title shown on the poster tile. */
  title: string;
  /** Where the tile links to — opens in a new tab (a YouTube trailer / search). */
  url: string;
  /**
   * Optional poster image URL. Populated from `posters.json`, which is generated
   * by `npm run posters` (TMDB for movies/shows/anime, Open Library for books).
   * When absent, a styled red/black placeholder tile (with the title) is shown.
   */
  poster?: string;
}

export interface FlixRow {
  /** Row label shown above the strip, e.g. "Movies". */
  category: string;
  items: FlixItem[];
}

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} trailer`)}`;

/** Generated `kind:title` → poster-URL map (empty until `npm run posters` runs). */
const POSTERS = posters as Record<string, string>;

/**
 * ETHANFLIX catalogue — the Netflix-style rows shown on the Films / Movies page
 * (/hobbies/films). Each row renders as a horizontally-scrollable strip of
 * poster tiles; clicking a tile opens its `url` (a YouTube trailer search) in a
 * new tab.
 *
 * The titles live in `catalogue.json` (a single source the poster-fetch script
 * also reads). Run `npm run posters` to populate `posters.json` with real art;
 * to pin an exact trailer, set a specific `url` here instead of the search.
 */
/** A catalogue entry is a bare title, or an object that overrides the poster
 *  search (`query`) or the art outright (`poster`) while keeping the display title. */
type Entry = string | { title: string; query?: string; poster?: string };

export const ROWS: FlixRow[] = catalogue.rows.map((row) => ({
  category: row.category,
  items: (row.titles as Entry[]).map((entry) => {
    const title = typeof entry === "string" ? entry : entry.title;
    const poster = POSTERS[`${row.kind}:${title}`];
    return poster ? { title, url: yt(title), poster } : { title, url: yt(title) };
  }),
}));
