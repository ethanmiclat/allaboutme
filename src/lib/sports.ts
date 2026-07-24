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
  /** Shown in the focus view's side panel when the statue is clicked. */
  description?: string;
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
  /**
   * Path to a Blender-exported .glb in `public/assets/statues/` (e.g.
   * "/assets/statues/basketball.glb"). When set, a 3D viewer replaces the
   * SVG statue / logo medallion for this trophy. Author models ~2 units tall,
   * centered at the origin.
   */
  model?: string;
  /** Widen the plinth/nameplate for titles too long to fit the default width. */
  wide?: boolean;
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
      {
        title: "Basketball",
        statue: "basketball",
        model: "/assets/statues/basketball.glb",
        description:
          "My first love. I've been around basketball my entire life and I love playing with my friends. This sport will always be my number 1.",
      },
      {
        title: "Golf",
        statue: "golf",
        model: "/assets/statues/golf.glb",
        description:
          "I picked this sport up later in my life and I'm still extremely bad, but something always brings me back to the course.",
      },
      {
        title: "Lifting",
        statue: "lifting",
        model: "/assets/statues/lifting.glb",
        description:
          "An important part of my day — I love the process and love the gym.",
      },
    ],
  },
  {
    category: "Sports I Watch",
    statue: "cup",
    trophies: [
      {
        title: "Basketball",
        statue: "basketball",
        model: "/assets/statues/basketball.glb",
        description:
          "The game of basketball is evolving every day. I used to mainly be an NBA watcher but have grown to enjoy watching college basketball as well.",
      },
      {
        title: "Football",
        statue: "football",
        model: "/assets/statues/football.glb",
        description:
          "Sunday Football is a hobby I've picked up recently — it's a great time until my fantasy football team ruins (or makes) the day after the first couple games.",
      },
      {
        title: "Baseball",
        statue: "baseball",
        model: "/assets/statues/baseball.glb",
        description:
          "A great sport to throw on in the background — until those last couple innings, when the game is suddenly a nail biter and has my full attention.",
      },
      {
        title: "UFC",
        statue: "mma",
        model: "/assets/statues/mma.glb",
        description:
          "UFC fight nights are always a good time — the environment, the walkouts, the knockouts, the celebrations. What more can you ask for?",
      },
    ],
  },
  {
    category: "Favorite Teams",
    statue: "crest",
    trophies: [
      {
        title: "OKC Thunder",
        emblem: "basketball",
        // The team logo is textured onto the crest's shield face inside the
        // .glb itself (see logo_decal in scripts/build-statues.py), so no
        // `logo` medallion is set here.
        model: "/assets/statues/crest-thunder.glb",
        description:
          "Been watching this team my whole life — watched KD and Russell Westbrook tear up the league, and watched the come-up of SGA. Love this team.",
      },
      {
        title: "San Diego Padres",
        emblem: "baseball",
        model: "/assets/statues/crest-padres.glb",
        description:
          "The main reason I was brought into this team was Fernando Tatis Jr., but I stayed for the rest of the elements — the players, the park, all of the above.",
      },
    ],
  },
  {
    category: "Favorite Players",
    statue: "star",
    trophies: [
      {
        title: "Shai Gilgeous‑Alexander",
        statue: "basketball",
        model: "/assets/statues/basketball.glb",
        wide: true,
        description:
          "Not much to say here — one of the smoothest players to ever touch a basketball. People love to hate, but real ones see the greatness.",
      },
      {
        title: "Kyrie Irving",
        statue: "basketball",
        model: "/assets/statues/basketball.glb",
        description:
          "I've grown up watching him my entire life. Not only has he been an inspiration to me in basketball, but in my life as well.",
      },
      {
        title: "Jordan Poole",
        statue: "basketball",
        model: "/assets/statues/basketball.glb",
        description:
          "The 2021-22 Playoffs were one of my favorite playoff performances I've watched — been loving the Poole Party ever since.",
      },
      {
        title: "Fernando Tatis Jr.",
        statue: "baseball",
        model: "/assets/statues/baseball.glb",
        description:
          "Brought me to baseball himself — from his electric play on the field to his loving personality. Tatis will be my favorite baseball player until the end of time.",
      },
      {
        title: "DeVonta Smith",
        statue: "football",
        model: "/assets/statues/football.glb",
        description:
          "From his Heisman speech to being on my fantasy team every year. He'll always be my favorite football player — one of the underdogs of the league who continues to shine.",
      },
    ],
  },
];
