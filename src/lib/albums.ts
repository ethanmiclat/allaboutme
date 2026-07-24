import { SONG_PREVIEWS } from "@/lib/song-previews";

export interface Song {
  /** Track title shown in the album's dropdown. */
  title: string;
  /**
   * YouTube video id (the 11-char id in a watch URL) used for the inline
   * audio preview + visualizer. Fallback for tracks with no iTunes preview
   * (see `songPreviewUrl`). When both are missing, the song's play button
   * opens a YouTube search for the track in a new tab instead.
   */
  youtubeId?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  /** Nudge this card down slightly (fine-tune position; doesn't affect scroll). */
  nudgeDown?: boolean;
  /**
   * Open the song panel ABOVE the cover instead of below it. Use for cards
   * that sit at the bottom of a column, where a downward panel would be
   * clipped by the bottom of the page.
   */
  dropUp?: boolean;
  /** Favorite tracks from the album, shown when the cover is clicked. */
  songs: Song[];
}

/**
 * 30-second inline preview (official Apple preview clip) for a song, if one
 * was found — see `song-previews.ts` for how the map is generated.
 */
export const songPreviewUrl = (album: Album, song: Song): string | undefined =>
  SONG_PREVIEWS[`${album.artist}|${song.title}`];

/** YouTube search URL fallback for songs with no inline preview. */
export const songSearchUrl = (album: Album, song: Song) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${album.artist} ${song.title} official audio`
  )}`;

/**
 * Ethan's favorite albums (covers in /public/assets/albums), grouped by
 * carousel column. The left & right columns render reversed — so the LAST
 * item in each of those groups shows at the TOP of its column, and the FIRST
 * item sits at the bottom (give those `dropUp` so their panel stays on
 * screen).
 *
 * `songs` are the favorites listed in each album's click-to-open dropdown.
 * Most get an inline 30s preview automatically via `songPreviewUrl`; a
 * `youtubeId` is the fallback for tracks Apple doesn't carry.
 */
const LEFT_COLUMN: Album[] = [
  {
    id: "unorthodox-jukebox",
    title: "Unorthodox Jukebox",
    artist: "Bruno Mars",
    cover: "/assets/albums/unorthodox-jukebox.jpg",
    nudgeDown: true,
    dropUp: true, // bottom of the left column — a downward panel would clip
    songs: [
      { title: "Locked Out of Heaven" },
      { title: "Treasure" },
      { title: "When I Was Your Man" },
    ],
  },
  {
    id: "4-your-eyez-only",
    title: "4 Your Eyez Only",
    artist: "J. Cole",
    cover: "/assets/albums/4-your-eyez-only.jpg",
    songs: [
      { title: "Neighbors" },
      { title: "Ville Mentality" },
      { title: "4 Your Eyez Only" },
    ],
  },
  {
    id: "iceman",
    title: "ICEMAN",
    artist: "Drake",
    cover: "/assets/albums/iceman.jpg",
    songs: [
      { title: "Whisper My Name" },
      { title: "National Treasures" },
      { title: "2 Hard 4 The Radio" },
    ],
  },
  {
    id: "graduation",
    title: "Graduation",
    artist: "Kanye West",
    cover: "/assets/albums/graduation.jpg",
    songs: [
      { title: "Homecoming" },
      { title: "Flashing Lights" },
      { title: "I Wonder" },
    ],
  },
  {
    id: "mbdtf",
    title: "My Beautiful Dark Twisted Fantasy",
    artist: "Kanye West",
    cover: "/assets/albums/mbdtf.jpg",
    songs: [
      { title: "Devil in a New Dress" },
      { title: "Runaway" },
      { title: "All of the Lights" },
    ],
  },
  {
    id: "take-care",
    title: "Take Care",
    artist: "Drake",
    cover: "/assets/albums/take-care.jpg",
    songs: [
      { title: "Over My Dead Body" },
      { title: "Shot for Me" },
      { title: "Take Care" },
    ],
  },
  {
    id: "blonde",
    title: "Blonde",
    artist: "Frank Ocean",
    cover: "/assets/albums/blonde.jpg",
    songs: [
      { title: "Nights" },
      { title: "Pink + White" },
      { title: "Self Control" },
    ],
  },
  {
    id: "bewitched-goddess",
    title: "Bewitched: The Goddess Edition",
    artist: "Laufey",
    cover: "/assets/albums/bewitched-goddess.jpg",
    songs: [
      { title: "From the Start" },
      { title: "Promise" },
      { title: "Goddess" },
    ],
  }, // top of left column
];

const MIDDLE_COLUMN: Album[] = [
  {
    id: "abba-gold",
    title: "Gold: Greatest Hits",
    artist: "ABBA",
    cover: "/assets/albums/abba-gold.jpg",
    songs: [
      { title: "The Winner Takes It All" },
      { title: "Angeleyes" },
      { title: "Dancing Queen" },
    ],
  },
  {
    id: "the-stranger",
    title: "The Stranger",
    artist: "Billy Joel",
    cover: "/assets/albums/billy-joel-the-stranger.jpg",
    songs: [
      { title: "Vienna" },
      { title: "She's Always a Woman" },
      { title: "Just the Way You Are" },
    ],
  },
  {
    id: "igor",
    title: "IGOR",
    artist: "Tyler, the Creator",
    cover: "/assets/albums/igor.jpg",
    songs: [
      { title: "EARFQUAKE" },
      { title: "GONE, GONE / THANK YOU" },
      { title: "ARE WE STILL FRIENDS?" },
    ],
  },
  {
    id: "freudian",
    title: "Freudian",
    artist: "Daniel Caesar",
    cover: "/assets/albums/freudian.jpg",
    songs: [
      { title: "Best Part" },
      { title: "Loose" },
      { title: "Hold Me Down" },
    ],
  },
  {
    id: "love-is-only-a-feeling",
    title: "Love Is Only a Feeling",
    artist: "Joey Bada$$",
    cover: "/assets/albums/love-is-only-a-feeling.jpg",
    // A standalone single, not an album — one track is the whole story.
    songs: [{ title: "Love Is Only a Feeling", youtubeId: "93ufch_2mfw" }],
  },
  {
    id: "for-all-the-dogs",
    title: "For All the Dogs",
    artist: "Drake",
    cover: "/assets/albums/for-all-the-dogs.jpg",
    songs: [
      { title: "Tried Our Best" },
      { title: "Slime You Out" },
      { title: "Virginia Beach" },
    ],
  },
  {
    id: "2014-forest-hills-drive",
    title: "2014 Forest Hills Drive",
    artist: "J. Cole",
    cover: "/assets/albums/2014-forest-hills-drive.jpg",
    songs: [
      { title: "Wet Dreamz" },
      { title: "Love Yourz" },
      { title: "Winter Wonderland" },
    ],
  },
];

const RIGHT_COLUMN: Album[] = [
  {
    id: "rumours",
    title: "Rumours",
    artist: "Fleetwood Mac",
    cover: "/assets/albums/rumours.jpg",
    nudgeDown: true,
    dropUp: true, // bottom of the right column — a downward panel would clip
    songs: [
      { title: "Dreams" },
      { title: "Landslide" },
      { title: "Silver Springs" },
    ],
  },
  {
    id: "currents",
    title: "Currents",
    artist: "Tame Impala",
    cover: "/assets/albums/currents.jpg",
    songs: [
      { title: "The Less I Know the Better" },
      { title: "Let It Happen" },
      { title: "Eventually" },
    ],
  },
  {
    id: "ctrl",
    title: "CTRL",
    artist: "SZA",
    cover: "/assets/albums/ctrl.jpg",
    songs: [
      { title: "Broken Clocks" },
      { title: "Love Galore" },
      { title: "Drew Barrymore" },
    ],
  },
  {
    id: "the-weeknd-highlights",
    // Stands in for The Weeknd's catalog in general — greatest-hits cover,
    // same treatment as ABBA's Gold.
    title: "The Highlights",
    artist: "The Weeknd",
    cover: "/assets/albums/the-weeknd-highlights.jpg",
    songs: [
      { title: "Blinding Lights" },
      { title: "Take Me Back to LA" },
      { title: "Die For You" },
    ],
  },
  {
    id: "chromakopia",
    title: "CHROMAKOPIA",
    artist: "Tyler, the Creator",
    cover: "/assets/albums/chromakopia.jpg",
    songs: [
      { title: "Take Your Mask Off" },
      { title: "Darling, I" },
      { title: "Like Him" },
    ],
  },
  {
    id: "views",
    title: "Views",
    artist: "Drake",
    cover: "/assets/albums/views.jpg",
    songs: [
      { title: "One Dance" },
      { title: "Feel No Ways" },
      { title: "Keep the Family Close" },
    ],
  },
  {
    id: "thriller",
    title: "Thriller",
    artist: "Michael Jackson",
    cover: "/assets/albums/thriller.jpg",
    songs: [
      { title: "Human Nature" },
      { title: "Billie Jean" },
      { title: "Beat It" },
    ],
  },
  {
    id: "sweet-boy",
    title: "Sweet Boy",
    artist: "Malcolm Todd",
    cover: "/assets/albums/sweet-boy.jpg",
    songs: [
      { title: "Roommates" },
      { title: "Earrings" },
      { title: "Sweet Boy" },
    ],
  }, // top of right column
];

/** The three carousel columns, left to right. */
export const ALBUM_COLUMNS: [Album[], Album[], Album[]] = [
  LEFT_COLUMN,
  MIDDLE_COLUMN,
  RIGHT_COLUMN,
];

/** Flat list of every album (order: left, middle, right column). */
export const ALBUMS: Album[] = [...LEFT_COLUMN, ...MIDDLE_COLUMN, ...RIGHT_COLUMN];
