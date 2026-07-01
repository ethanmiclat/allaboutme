export interface ArcadeGame {
  /** Two-digit rank shown on the cabinet screen, e.g. "01". */
  rank: string;
  /** Game title. */
  title: string;
  /** Retro high-score number (purely decorative). */
  score: string;
  /** Where the row links to — opens in a new tab (a YouTube trailer / search). */
  url: string;
}

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} trailer`)}`;

/**
 * Ethan's favorite games — shown full-screen on the "Ethan's Arcade" cabinet
 * (/hobbies/games), styled as a retro high-score table. The list is navigable
 * with the arrow keys; clicking a row (or Enter on the highlighted one) opens
 * its `url` in a new tab.
 *
 * `url` defaults to a YouTube search for the game's trailer (always lands on
 * relevant results). To point a row at a specific video instead, just replace
 * the `url` string with that watch link. Scores are decorative (descending, for
 * the arcade look). Renumber `rank` if you reorder/add/remove rows.
 */
export const GAMES: ArcadeGame[] = [
  { rank: "01", title: "Overwatch", score: "999999", url: "https://www.youtube.com/watch?v=FqnKB22pOC0" },
  { rank: "02", title: "Fortnite", score: "952400", url: "https://www.youtube.com/watch?v=WJW-bzXZM8M" },
  { rank: "03", title: "Valorant", score: "918750", url: "https://www.youtube.com/watch?v=e_E9W2vsRbQ" },
  { rank: "04", title: "Call of Duty", score: "884100", url: yt("Call of Duty") },
  { rank: "05", title: "Rocket League", score: "851900", url: "https://www.youtube.com/watch?v=SgSX3gOrj60" },
  { rank: "06", title: "NBA 2K", score: "823450", url: yt("NBA 2K") },
  { rank: "07", title: "League of Legends", score: "798200", url: "https://www.youtube.com/watch?v=vzHrjOMfHPY" },
  { rank: "08", title: "Rainbow Six Siege", score: "765050", url: "https://www.youtube.com/watch?v=BI9fgQY0d5I" },
  { rank: "09", title: "Minecraft", score: "731600", url: "https://www.youtube.com/watch?v=MmB9b5njVbA" },
  { rank: "10", title: "Teamfight Tactics", score: "702400", url: "https://www.youtube.com/watch?v=liNLLx874g4" },
  { rank: "11", title: "GTA V", score: "678150", url: "https://www.youtube.com/watch?v=hvoD7ehZPcM" },
  { rank: "12", title: "Chess", score: "642100", url: "https://www.chess.com/play" },
  { rank: "13", title: "MLB the Show", score: "615900", url: yt("MLB the Show") },
  { rank: "14", title: "Fifa", score: "588200", url: yt("Fifa") },
  { rank: "15", title: "Counter-Strike", score: "552750", url: "https://www.youtube.com/watch?v=c80dVYcL69E" },
];
