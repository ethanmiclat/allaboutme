/**
 * Data for the Sports "Hall of Fame" page (/hobbies/sports) — a theatrical
 * trophy room that's revealed when two velvet curtains part. Each shelf is a
 * category; each trophy is a gold *statue* whose figure depends on the sport
 * it's about (a baller shooting, a keeper striking, a QB throwing…), plus an
 * optional sport `emblem` badge on its base.
 *
 * ┌─ HOW TO EDIT ──────────────────────────────────────────────────────────┐
 * │ The content below is sample/placeholder — swap in Ethan's real favorites.│
 * │ • title : the engraved name on the plate (sport / team / player)         │
 * │ • sub   : a short second line (position, league, "since '14"…) optional  │
 * │ • statue: which gold figure stands on the trophy (defaults per category)  │
 * │ • emblem: small sport badge on the base; defaults to the statue's sport   │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/**
 * The gold statue on a trophy. The first group are sport athletes (the figure
 * matches the sport); the rest are shape statues for teams / players / fallback.
 */
export type Statue =
  | "basketball"
  | "soccer"
  | "tennis"
  | "golf"
  | "football"
  | "baseball"
  | "lifting"
  | "mma"
  | "racing"
  | "crest"
  | "star"
  | "cup";

/** Small sport badge fixed to a trophy's base. */
export type Emblem =
  | "basketball"
  | "soccer"
  | "football"
  | "tennis"
  | "baseball"
  | "lifting"
  | "mma"
  | "racing"
  | "golf"
  | "star";

export interface Trophy {
  /** Engraved name (sport, team, or player). */
  title: string;
  /** Optional engraved second line. */
  sub?: string;
  /** The gold statue on top. Defaults to the shelf's `statue` when omitted. */
  statue?: Statue;
  /** Optional sport badge on the base. Defaults to the statue's sport. */
  emblem?: Emblem;
  /**
   * Optional logo image (e.g. a team crest in `public/assets/trophies/`). When
   * set, it's shown in a gold medallion instead of a statue.
   */
  logo?: string;
  /**
   * How to recolor the logo to gold:
   *  • "fill"    — paint the logo's silhouette with the trophy-gold gradient
   *                (best for solid single-color marks like the Padres SD).
   *  • "duotone" — strip the logo's colors to gold tones, keeping inner detail
   *                (best for multi-color marks like the Thunder shield).
   * Defaults to "duotone".
   */
  logoTone?: "fill" | "duotone";
}

export interface Shelf {
  /** Engraved category label on the wooden ledge. */
  category: string;
  /** Default statue for trophies on this shelf. */
  statue: Statue;
  trophies: Trophy[];
}

export const SHELVES: Shelf[] = [
  {
    category: "Sports I Play",
    statue: "cup",
    trophies: [
      { title: "Basketball", sub: "Pickup, all day", statue: "basketball" },
      { title: "Golf", sub: "Working on the slice", statue: "golf" },
      { title: "Lifting", sub: "Gym, most days", statue: "lifting" },
    ],
  },
  {
    category: "Sports I Watch",
    statue: "cup",
    trophies: [
      { title: "Basketball", sub: "Playoff szn", statue: "basketball" },
      { title: "Football", sub: "Sunday ritual", statue: "football" },
      { title: "Baseball", sub: "Summer nights", statue: "baseball" },
      { title: "UFC", sub: "Fight night", statue: "mma" },
    ],
  },
  {
    category: "Favorite Teams",
    statue: "crest",
    trophies: [
      {
        title: "Oklahoma City Thunder",
        sub: "NBA",
        emblem: "basketball",
        logo: "/assets/trophies/thunder.png",
        logoTone: "duotone",
      },
      {
        title: "San Diego Padres",
        sub: "MLB",
        emblem: "baseball",
        logo: "/assets/trophies/padres.png",
        logoTone: "fill",
      },
    ],
  },
  {
    category: "Favorite Players",
    statue: "star",
    trophies: [
      { title: "Shai Gilgeous-Alexander", sub: "No. 2 · Guard", statue: "basketball" },
      { title: "Kyrie Irving", sub: "No. 11 · Guard", statue: "basketball" },
      { title: "Jordan Poole", sub: "No. 13 · Guard", statue: "basketball" },
      { title: "Fernando Tatis Jr.", sub: "No. 23 · RF", statue: "baseball" },
      { title: "DeVonta Smith", sub: "No. 6 · WR", statue: "football" },
    ],
  },
];
