export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  /** Nudge this card down slightly (fine-tune position; doesn't affect scroll). */
  nudgeDown?: boolean;
}

/**
 * Ethan's favorite albums (covers in /public/assets/albums).
 * Order matters: the carousel splits this list into 3 columns, and the left &
 * right columns render reversed — so the LAST item in each column's group shows
 * at the TOP of that column.
 */
export const ALBUMS: Album[] = [
  // ----- Left column -----
  { id: "unorthodox-jukebox", title: "Unorthodox Jukebox", artist: "Bruno Mars", cover: "/assets/albums/unorthodox-jukebox.jpg", nudgeDown: true },
  { id: "4-your-eyez-only", title: "4 Your Eyez Only", artist: "J. Cole", cover: "/assets/albums/4-your-eyez-only.jpg" },
  { id: "iceman", title: "ICEMAN", artist: "Drake", cover: "/assets/albums/iceman.jpg" },
  { id: "graduation", title: "Graduation", artist: "Kanye West", cover: "/assets/albums/graduation.jpg" },
  { id: "mbdtf", title: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", cover: "/assets/albums/mbdtf.jpg" },
  { id: "take-care", title: "Take Care", artist: "Drake", cover: "/assets/albums/take-care.jpg" },
  { id: "blonde", title: "Blonde", artist: "Frank Ocean", cover: "/assets/albums/blonde.jpg" }, // top of left column

  // ----- Middle column -----
  { id: "abba-gold", title: "Gold: Greatest Hits", artist: "ABBA", cover: "/assets/albums/abba-gold.jpg" },
  { id: "the-stranger", title: "The Stranger", artist: "Billy Joel", cover: "/assets/albums/billy-joel-the-stranger.jpg" },
  { id: "igor", title: "IGOR", artist: "Tyler, the Creator", cover: "/assets/albums/igor.jpg" },
  { id: "freudian", title: "Freudian", artist: "Daniel Caesar", cover: "/assets/albums/freudian.jpg" },
  { id: "love-is-only-a-feeling", title: "Love Is Only a Feeling", artist: "Joey Bada$$", cover: "/assets/albums/love-is-only-a-feeling.jpg" },
  { id: "for-all-the-dogs", title: "For All the Dogs", artist: "Drake", cover: "/assets/albums/for-all-the-dogs.jpg" },
  { id: "2014-forest-hills-drive", title: "2014 Forest Hills Drive", artist: "J. Cole", cover: "/assets/albums/2014-forest-hills-drive.jpg" },

  // ----- Right column -----
  { id: "rumours", title: "Rumours", artist: "Fleetwood Mac", cover: "/assets/albums/rumours.jpg", nudgeDown: true },
  { id: "currents", title: "Currents", artist: "Tame Impala", cover: "/assets/albums/currents.jpg" },
  { id: "ctrl", title: "CTRL", artist: "SZA", cover: "/assets/albums/ctrl.jpg" },
  { id: "after-hours", title: "After Hours", artist: "The Weeknd", cover: "/assets/albums/after-hours.jpg" },
  { id: "chromakopia", title: "CHROMAKOPIA", artist: "Tyler, the Creator", cover: "/assets/albums/chromakopia.jpg" },
  { id: "views", title: "Views", artist: "Drake", cover: "/assets/albums/views.jpg" },
  { id: "thriller", title: "Thriller", artist: "Michael Jackson", cover: "/assets/albums/thriller.jpg" }, // top of right column
];
