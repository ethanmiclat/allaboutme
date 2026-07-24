# Ethan Miclat — Personal Website

A personal "all about me" website for Ethan Miclat, rebuilt on **Next.js (App Router) +
TypeScript + Tailwind CSS v4 + shadcn structure**, with **GSAP / ScrollTrigger**, **Lenis**
smooth scrolling, and **lucide-react** icons.

> Previously a plain HTML/CSS/JS static site. It was ported to this stack so the Music page
> could use the GSAP `ScrollTrigger` 3-column carousel component. The original static files
> are preserved under `legacy/` for reference.

---

## Run / Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes prerender static)
npm start        # serve the production build
npm run lint
```

Requires Node 18+ (developed on Node 24).

---

## Stack

- **Next.js 16** (App Router, `src/` dir, `@/*` import alias) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config via `@import "tailwindcss"` in `globals.css`)
- **shadcn structure** — `components.json`, `src/lib/utils.ts` (`cn()`), `src/components/ui/`
  (no shadcn primitives are used yet, but new ones drop straight into `components/ui`)
- **GSAP + ScrollTrigger** — the album carousel
- **Lenis** — smooth inertia scrolling (`src/components/smooth-scroll.tsx`)
- **lucide-react** — icons (brand marks GitHub/LinkedIn/Instagram live in
  `src/components/brand-icons.tsx`, since lucide dropped them)
- **next/font** — Cormorant Garamond + Inter + Press Start 2P (the 8-bit arcade page) +
  Bebas Neue (the ETHANFLIX page), exposed as `--font-cormorant` / `--font-inter` /
  `--font-press-start` / `--font-bebas`

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # fonts, <html class="js dark">, Lenis + ScrollReveal providers
│   ├── globals.css             # Tailwind import + ported site styles + theme tokens
│   ├── page.tsx                # Home: ScrollToHash, Hero, About, Hobbies, Projects, Contact, Location, Footer
│   └── hobbies/
│       ├── music/page.tsx      # STANDALONE page (fixed Back + ScrollToTop) → album carousel
│       ├── sports/page.tsx     # STANDALONE "Hall of Fame" → velvet-curtain reveal → trophy shelves
│       ├── games/page.tsx      # STANDALONE 8-bit B&W "Ethan's Arcade" → dive-in zoom experience
│       └── films/page.tsx      # STANDALONE "ETHANFLIX" → red-"E" intro → Netflix-style catalogue
├── components/
│   ├── site-menu.tsx           # menu button + full-screen overlay menu (client)
│   ├── hero.tsx                # sticky hero + "All About Me" title write-on + fade-on-scroll (client)
│   ├── contact-form.tsx        # mailto form (client)
│   ├── local-time.tsx          # live Central-time clock (client)
│   ├── smooth-scroll.tsx       # Lenis provider (client; skipped on /hobbies/music)
│   ├── scroll-reveal.tsx       # IntersectionObserver reveal (client)
│   ├── scroll-to-top.tsx       # forces window to top on mount (music page)
│   ├── scroll-to-hash.tsx      # lands the home page directly on a #hash section, no visible scroll (used by page.tsx)
│   ├── brand-icons.tsx         # GitHub / LinkedIn / Instagram SVGs
│   └── ui/
│       ├── album-impact-carousel.tsx   # GSAP ScrollTrigger 3-column album carousel
│       ├── arcade-experience.tsx       # CLIENT: dive-in zoom (room → full-screen CRT)
│       ├── arcade-cabinet.tsx          # arcade attract + CRT screen pieces; exports WelcomeScreen / GamesScreen
│       ├── ethanflix-experience.tsx    # CLIENT: red-"E" intro → Netflix-style poster catalogue
│       └── trophy-room-experience.tsx  # CLIENT: velvet-curtain reveal → lit shelves of gold trophy statues
├── lib/
│   ├── utils.ts                # cn()
│   ├── albums.ts               # album data (id / title / artist / cover / nudgeDown)
│   ├── games.ts                # arcade games list (rank / title / score) — Ethan's 15 favorites
│   ├── catalogue.json          # ETHANFLIX titles by row (Movies/Shows/Anime/Books) — source of truth
│   ├── posters.json            # generated kind:title → poster URL map (`npm run posters`)
│   ├── films.ts                # builds ETHANFLIX `ROWS` from catalogue.json + posters.json
│   └── sports.ts               # Hall of Fame data — `SHELVES` of trophies (title / sub / statue / emblem)
public/assets/                  # hero-bg, IMG_3456 (portrait), rebel-hauling.* (poster/mp4),
│                               #   music-cover.jpeg (Music card cover), albums/*.jpg,
│                               #   arcade-scene.png (the arcade room),
│                               #   cursor-arrow.png / cursor-hand.png (pixel cursors),
│                               #   trophies/*.png (team logos on trophy bases)
legacy/                         # the original static site (index.html, styles.css, docs, …)
```

---

## How sections map to the old site

Everything from the original is reproduced faithfully (same theme tokens, fonts, layout,
animations — the CSS was ported into `globals.css`):

| Section   | Notes |
|-----------|-------|
| Hero      | sticky, fades on scroll; full-screen overlay menu; **"All About Me"** title (Cormorant italic) sits in the lower-left so it clears Ethan on the right |
| About     | portrait + Philosophy card + Journey timeline |
| Hobbies   | 4 cards; each is a **link to its own route** (not in scroll flow or menu). The **Music** card uses `public/assets/music-cover.jpeg` (a concert photo) as its background via `.hobby-card__media--music` |
| Projects  | Rebel Hauling featured video → rebelhauling.com; placeholder cards; GitHub/Résumé pills |
| Contact   | socials + mailto form |
| Location  | Fayetteville + live Central-time clock |
| Footer    | brand / nav / © |

### Hobby routes (the "can't be scrolled to" sections)

Each hobby card links to a dedicated route — `/hobbies/music`, `/hobbies/sports`,
`/hobbies/games`, `/hobbies/films` — reachable **only** by clicking a card. They are not in
the menu and not part of the home scroll. **All four are standalone full-page takeovers**
(the old shared back-bar shell was removed); each has its own **Back** link to `/#hobbies`.

- **Sports** is a **standalone full page** (`.trophy-room-page`) — a theatrical "**Hall of
  Fame**" (`trophy-room-experience.tsx`, a client component holding an `open` boolean on
  `.trophy-page[data-open]`):
  1. **curtain** — two velvet panels cover the screen with the title on them; **click or Enter**
     parts them.
  2. **hall** — the curtains pull to the sides under a gold valance, revealing lit wooden
     shelves. Each shelf is a category; each trophy is a gold **statue** whose figure depends on
     what it's about (a baller shooting, a keeper striking, a QB throwing…), with an optional
     sport **emblem** badge on its base (team logos live in `public/assets/trophies/`).
  - Motion is CSS-driven and bypassed under `prefers-reduced-motion` (curtains open immediately).
    **Esc** re-closes the curtains; **Back** → `/#hobbies`. The hall is `inert` until the reveal.
    Content lives in `src/lib/sports.ts` (`SHELVES` — currently sample/placeholder picks). All
    trophy-room styles are under their section of `globals.css`.
- **Games** is a **standalone full page** (`.arcade-page`) — a fully black & white, 8-bit
  "**Ethan's Arcade**" takeover built as a **two-stage dive-in zoom** (`arcade-experience.tsx`,
  a client component holding a `scene | screen` state on `.arcade-stage[data-stage]`):
  1. **scene** — the arcade-room photo `public/assets/arcade-scene.png` sized to **cover** the
     whole viewport (aspect-locked, `flex: none` so it never shrinks; crops ceiling/floor). The
     center machine, **"Ethan's Arcade", is already in the photo** (marquee name baked in) — we
     overlay a **welcome / attract screen** (`WelcomeScreen`: "WELCOME TO ETHAN'S ARCADE" + a
     blinking "CLICK HERE TO START!") onto its blank screen (`.arcade-scene__screen`, positioned
     with %s measured from the 1398×1125 source; the screen is dark so the opaque overlay blends
     in, with `border-radius` so its corners tuck inside the CRT glass). The actual games list
     only appears full-screen, after the dive. Clicking the machine (an invisible
     `.arcade-scene__enter` hotspot — no visible box)…
  2. **screen** — …the camera **flies into the CRT**: the scene zooms toward the center machine
     (`transform: scale(4)` with `transform-origin` on the screen — past the point where the CRT
     covers the whole viewport) over a slow `1.8s cubic-bezier(0.5, 0, 0.25, 1)`. To make the
     hand-off **seamless** (rather than crossfading two different text layouts, which ghosts),
     it's a timed **black-wipe**: once the room's black CRT fills the frame, the full-page
     backdrop (`.arcade-screen-full`, `100vw × 100dvh`, no border) wipes in **black-on-black**
     (invisible, ~`0.9s`→`1.4s`); then the games **resolve into focus** on that black
     (`.arcade-screen-full__in` fades + eases inward, delayed to ~`1.45s`). One continuous dive
     into the machine; no intermediate cabinet stage.
  - The zooming room (`.arcade-layer--room`) and the full-page CRT (`.arcade-layer--screen`) are
    separate layers; the dive is sequenced (fly in → black beat → resolve) so the two text
    layouts never crossfade. Scene overlay text sizes in `cqw` units (`container-type: size` on
    `.arcade-scene`) so it scales with the zoom; the full-page CRT sizes in `vh`-based `clamp()`s
    so the whole table fits the viewport exactly (no clipping). Hidden layers are `inert`.
    **Back** (or **Esc**) steps out (quick reverse transitions); from the scene, Back → `/#hobbies`.
  - The favorite-games high-score table (`GamesScreen`, exported from `arcade-cabinet.tsx`)
    renders on the full-page screen. The list (Ethan's real 15 favorites) is in `src/lib/games.ts`.
    The list is **arrow-key navigable** (↑/↓, ←/→, Home/End move a highlighted row, kept scrolled
    into view; mouse hover highlights too) — selection state lives in `ArcadeExperience` and is
    passed to `GamesScreen`. Each row is an `<a>` (opens in a new tab) pointing at the game's
    trailer via its `url` in `games.ts` — currently a YouTube search per game (always lands on
    relevant results; swap in a specific watch link to override). Clicking a row, or pressing
    **Enter** on the highlighted one, opens it. Long titles fit the width via `min(vh, vw)` font
    sizing (tightened further on phones). Uses the pixel font **Press Start 2P** (`--font-press-start`, added in
    `layout.tsx`). The whole arcade page uses **pixel cursors** (`/assets/cursor-arrow.png`
    default, `/assets/cursor-hand.png` on clickables). All arcade styles are under the
    `ETHAN'S ARCADE` section of `globals.css`.
  - ⚠️ The overlay + zoom are tuned to **this exact room photo** (and its 1398×1125 size /
    aspect-ratio, hard-coded in `.arcade-scene`). If you swap `arcade-scene.png`, update the
    `aspect-ratio` + `width` calc, and re-measure the center cabinet's screen `%`s
    (`.arcade-scene__screen` / `.arcade-scene__enter`) and the `.arcade-scene`
    `transform-origin` + zoom `scale()`. (Tip: a %-grid overlay on the source makes this quick.)
    Because the cover image is referenced via `<img>` (not CSS `url()`), it doesn't hit the
    stale-CSS gotcha — but CSS edits to `globals.css` sometimes need a Turbopack restart.
- **Films** is a **standalone full page** (`.flix-page`) — an "**ETHANFLIX**" Netflix-style
  takeover (`ethanflix-experience.tsx`, a client component holding an `intro` boolean on
  `.flix[data-intro]`):
  1. **intro** — a black screen with a big red **"E"** logo (a Netflix-intro homage). The "E"
     is four `<rect>`s drawn as an SVG `data:` URI used as a CSS **mask** (`--flix-e` on
     `.flix-page`) over a near-flat red fill, so it reads as one clean solid letter
     (`.flix-intro__logo`, a very slightly darker red than Netflix's; the four mask rects
     overlap the spine so there's no hairline seam at the junctions). A `.flix-intro__shade`
     overlay (masked to the E) adds a subtle top gloss + a sweeping sheen, and
     `.flix-intro__fold` adds the **fold on the middle arm only** — masked to that arm's rect
     (`--flix-e-mid`) so it stops dead at the vertical column: the whole arm is a flat, slightly
     darker hue of red with a shadow only where it **connects to the spine**. (The sheen and
     gloss are background layers on the masked `.flix-intro__shade`, not a transformed
     pseudo-element, so they stay clipped to the E — no stray box.) The intro is **one
     continuous zoom**, carried by a single wrapper (`.flix-intro__zoom`) that every layer
     rides so nothing starts a second zoom: the E is **drawn on** (a `clip-path` wipe,
     left→right), then — without stopping — the wrapper **zooms straight into the middle of the
     letter**; about half-way the E **turns into** `.flix-intro__lines` (a full-screen **warp
     of many fine vertical streak-lines**, backed briefly by `.flix-intro__flood`), and the
     same zoom carries the streaks past the camera as the black backdrop dissolves
     (`flix-veil`) and the catalogue settles in beneath (`flix-land`) — one motion all the way
     in (`@keyframes flix-zoom` / `flix-logo` / `flix-shade` / `flix-sheen` / `flix-flood` /
     `flix-lines` / `flix-veil` / `flix-land`, ~3s). Plays once on load; **click or Esc skips
     it**, and it's bypassed under `prefers-reduced-motion` (the timer fires at 0ms).
  2. **catalogue** (`.flix-catalogue`) — settles in as the intro lifts: the **ETHANFLIX**
     wordmark (Bebas Neue, red) sticky header + a **Back** link (→ `/#hobbies`), a billboard,
     then one **row per category**. Titles live in `src/lib/catalogue.json` (**Movies / Shows
     / Anime / Books**); `src/lib/films.ts` builds `ROWS` from it, attaching real poster art
     from `src/lib/posters.json`. Each row is a horizontally-scrollable strip (`.flix-strip`)
     of poster tiles. Hover scales a tile; edge **arrows** (hidden on touch) `scrollBy`.
  - **Infinite loop** (the `Row` client logic): any row that overflows its viewport renders
    its tiles **×3** and seamlessly **wraps** — `onScroll` jumps by exactly one set-width at
    each seam (invisible since the copies are identical), so arrows/scroll/drift never hit an
    end. It also **auto-drifts** (a `requestAnimationFrame` crawl; a fractional accumulator is
    applied in whole-pixel steps since `scrollLeft` snaps to integers) and is **grabbable** —
    pointer **drag-to-scroll** (a >4px move swallows the click so taps still open the trailer),
    plus pause-on-hover/wheel/touch with a ~1.4s idle **resume**. Short rows (e.g. the single
    Book) don't loop, and `prefers-reduced-motion` disables the drift (wrap still works).
    Looping strips drop scroll-snap/smoothing (`.flix-strip[data-looping]`) and show a grab cursor.
  - Tiles are `<a>`s opening `item.url` in a new tab (a YouTube **search** per title; set a
    specific `item.url` to pin one). **Poster art** comes from `npm run posters`
    (`scripts/fetch-posters.mjs`): it reads `catalogue.json` and resolves each title's art —
    **TMDB** for movies/shows/anime (needs a free `TMDB_API_KEY`), **Open Library** for books
    (no key) — writing a `kind:title → URL` map to `posters.json`. Titles with no resolved art
    fall back to the styled red/black "E" placeholder tile. All ETHANFLIX styles are under the
    `ETHANFLIX` banner in `globals.css`.
- **Music** is a **standalone full page** (`.music-page`) — it deliberately does *not* use
  the shared shell. The shell applies an entrance `transform`, and a transformed ancestor
  breaks GSAP ScrollTrigger's `position: fixed` pin (it collapses the pinned carousel into a
  small box). Instead Music has its own **fixed** (non-transformed) Back button, a
  `<ScrollToTop />` so the page always opens at the top, and a short text intro above the
  carousel.

Navigating into any hobby page plays a short **opacity-only** fade-in (`hobbyPageIn` in
`globals.css`, disabled under `prefers-reduced-motion`). It's opacity-only on purpose — a
transform here would re-break the carousel pin.

### Music carousel

> ⚠️ **Don't rebuild the scroll mechanic.** The carousel's scroll feel is dialed in and
> Ethan is happy with it. Attempts to "improve" it (seamless looping, even-start, pinning the
> whole section in one timeline) were tried and **reverted** — they broke it. Only change
> **layout** (column sizing, padding) and **data** (`albums.ts`); leave the GSAP
> `gsap.matchMedia` + per-column `gsap.to(..., { yPercent: 100, pin: true, scrub: true })`
> block alone.

`src/components/ui/album-impact-carousel.tsx` is the GSAP `ScrollTrigger` carousel (the
"executive impact" 3-column layout): the **two outer columns** are `column-reverse`, pinned,
and scroll-scrubbed (`yPercent: 100`) while the **middle column** scrolls normally. It's fed
from `src/lib/albums.ts` and themed to the site. Covers show **art only** (no title/artist
overlay). On mobile it collapses to a clean stacked list (no pin).

Key behaviors / gotchas:

- **Lenis is disabled** on `/hobbies/music` (`smooth-scroll.tsx`) so GSAP owns the scroll.
- `overflow-x: clip` (not `hidden`) on the carousel so it doesn't create a scroll container
  that fights the pin.
- The side columns are sized to the viewport **below the intro**, not a flat `100vh`:
  `height: calc(100dvh - var(--cz-top))`, where `--cz-top` is the intro height measured in JS
  (on mount, after fonts load, and on resize). Without this their bottom album falls below
  the fold. A `+14px` bottom-padding tweak fine-tunes the bottom album into view.
- `nudgeDown` on an album shifts that card down ~0.5in via a *relative* offset (preserves
  layout flow, so it never changes the list height the animation measures).

`src/lib/albums.ts` holds 21 albums split into 3 columns. Because the outer columns render
reversed, the **last** album in each column's group shows at the **top** of that column —
so order matters (the file is grouped/commented by column).

---

## Content facts (confirmed)

- University of Arkansas — **Walton Honors College of Business**; **Business Finance** track,
  **pre-dental** path. Based in **Fayetteville, Arkansas**. Email: ethanmic6@gmail.com
- Tagline: *"A family-driven student who dreams big and always looks to be a positive,
  genuine, and good person."*
- Project: **Rebel Hauling** (rebelhauling.com).
- Albums currently in the Music carousel (21, grouped by column in `src/lib/albums.ts`):
  - **Left:** *Unorthodox Jukebox* — Bruno Mars · *4 Your Eyez Only* — J. Cole ·
    *ICEMAN* — Drake · *Graduation* — Kanye West · *My Beautiful Dark Twisted Fantasy* —
    Kanye West · *Take Care* — Drake · *Blonde* — Frank Ocean
  - **Middle:** *Gold: Greatest Hits* — ABBA · *The Stranger* — Billy Joel · *IGOR* —
    Tyler, the Creator · *Freudian* — Daniel Caesar · *Love Is Only a Feeling* — Joey Bada$$ ·
    *For All the Dogs* — Drake · *2014 Forest Hills Drive* — J. Cole
  - **Right:** *Rumours* — Fleetwood Mac · *Currents* — Tame Impala · *CTRL* — SZA ·
    *After Hours* — The Weeknd · *CHROMAKOPIA* — Tyler, the Creator · *Views* — Drake ·
    *Thriller* — Michael Jackson

**Guardrail:** never invent biographical facts — use confirmed info or ask. Editable spots
are marked with `[brackets]` and `data-placeholder`.

---

## TODO / Next steps

- [ ] About bio paragraph + 2 timeline milestones.
- [ ] **Hall of Fame** trophies — the shelves in `src/lib/sports.ts` hold sample/placeholder
      picks; swap in Ethan's real favorites (set `title` / `sub` / `statue` / `emblem`, drop any
      team logos in `public/assets/trophies/`).
- [ ] **ETHANFLIX poster art** — titles are real (`src/lib/catalogue.json`); run
      `TMDB_API_KEY=… npm run posters` to populate `posters.json` with real cover art (get a
      free key at themoviedb.org). Optionally pin specific trailer `url`s in `films.ts`.
- [ ] A few carousel slots still hold filler picks (e.g. *Currents*, *CTRL*, *After Hours*,
      *Views*) — swap for more of Ethan's own favorites when ready.
- [ ] 3 secondary Projects cards.
- [ ] Real GitHub / Résumé / LinkedIn / Instagram URLs (currently `#`).
- [ ] Add/replace albums any time by editing `src/lib/albums.ts` (drop a cover in
      `public/assets/albums/`). Keep columns even (currently 7 / 7 / 7).

---

## Notes

- Album covers are mostly fetched from public catalog APIs (iTunes Search / Cover Art
  Archive) and saved to `public/assets/albums/`. Just name an album and the cover can be
  pulled in — but **verify the result**, the search occasionally returns the wrong release
  (e.g. it once grabbed Frank Ocean's *Moon River* art for *Channel Orange*). Covers that
  aren't on the catalog (e.g. *Love Is Only a Feeling*) were dropped in manually.
- Large source images are downscaled/compressed before use. The current pipeline (much better
  than `sips`) is ffmpeg → mozjpeg: `ffmpeg -i in.jpg -vf "scale=900:-2" -f image2pipe -vcodec
  ppm - | cjpeg -quality 80 -optimize > out.jpg`. Album covers are 900px/q80 (~100–300 KB each);
  the portrait & Music card cover are 1600px. The unused `rebel-hauling.mov` source (32 MB) was
  removed from `public/` (recoverable from git history).
- Restart the dev server after editing `globals.css` if a style change doesn't show — the
  Turbopack dev server can serve stale CSS (kill anything on port 3000, `rm -rf .next`,
  `npm run dev`).
- Photos from the macOS Photos Library can't be read by command-line tools (macOS privacy/TCC)
  and need a manual export.
- The original static site is intact in `legacy/` if you ever want to diff against it.
