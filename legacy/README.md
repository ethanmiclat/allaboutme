# Ethan Miclat — Personal Website

A personal "all about me" website for Ethan Miclat. Built with plain HTML + CSS and a
tiny bit of vanilla JS — no framework, no build step. Open it and it just runs.

> **Reopening this project?** Start here. `docs/chat-export.md` covers the original hero
> build only and is now behind — this README is the source of truth for current state.

---

## Status

The full multi-section site is built. Remaining work is real content / links to drop into
existing placeholders (search the codebase for `data-placeholder` or `[` to find every spot).

| Section    | State        |
|------------|--------------|
| Hero       | ✅ Done       |
| About Me   | ✅ Built — real bio + Philosophy card + Journey timeline (bio paragraph & 2 milestones still `[placeholder]`) |
| Hobbies    | ✅ Built — 4 cards (Music, Sports, Video Games, Software/App Dev) each **open a dedicated off-canvas detail view**. **Music** has a working album-cover **carousel** with real art; Sports / Games / Dev detail copy still `[placeholder]` |
| Projects   | ✅ Built — **Rebel Hauling** featured (live video → rebelhauling.com); 3 secondary cards are placeholders; GitHub/Résumé pills need URLs |
| Contact    | ✅ Built — glass form opens a pre-filled email; LinkedIn/GitHub/Instagram links need URLs |
| Location   | ✅ Built — Fayetteville, AR + live Central-time clock (uses a grayscale hero photo as the media) |
| Footer     | ✅ Done       |

---

## Run / Preview

It's a static site — no install required.

**Quickest:** open `index.html` directly in a browser.

**With a local server** (better for fonts/paths):
```bash
cd /Users/ethanmic/ethanmiclat
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Project Structure

```
ethanmiclat/
├── index.html          # All section markup + inline JS (menu, scroll-reveal, clock, form)
├── styles.css          # All styles, theme tokens, and animations
├── assets/
│   ├── hero-bg.jpeg            # Hero background photo (Ethan on a boat, rainbow over the sea)
│   ├── IMG_3456.jpeg          # About-section portrait (used by .portrait)
│   ├── rebel-hauling.mp4       # Featured project demo video (used in Projects)
│   ├── rebel-hauling.mov       # Source/original of the project video
│   ├── rebel-hauling-poster.jpg # Poster frame for the project video
│   └── albums/                 # Album covers for the Music carousel (one .jpg per album)
│       ├── take-care.jpg · blonde.jpg · unorthodox-jukebox.jpg · 4-your-eyez-only.jpg
│       ├── iceman.jpg · graduation.jpg · mbdtf.jpg · abba-gold.jpg
│       └── billy-joel-the-stranger.jpg · igor.jpg · freudian.jpg
├── docs/
│   └── chat-export.md  # Original hero build log (historical; now behind current state)
├── stitch_personal_portfolio_website.zip  # Reference design ("Atmospheric Minimalist")
└── README.md           # You are here
```

---

## Behavior / JS (all inline in `index.html`)

- **Full-screen menu:** circular menu button toggles a top-level overlay; closes on link click or `Escape`.
- **Scroll-reveal:** `IntersectionObserver` toggles `.is-visible` on `.reveal` / `.stagger` (re-animates on re-entry); falls back to fully-visible under `prefers-reduced-motion` / no IO support.
- **Hero fade:** hero contents fade out on scroll while the background stays.
- **Live clock:** Location section shows current Central time (`America/Chicago`).
- **Contact form:** no backend — submit opens a pre-filled `mailto:ethanmic6@gmail.com`.
- **Smooth scrolling:** Lenis loaded from CDN; gracefully skipped offline or under reduced-motion. In-page anchors route through Lenis for smooth jumps. The instance is exposed as `window.__lenis`.
- **Hobby detail views:** clicking a hobby card opens a fixed off-canvas panel (`.hobby-detail`, top-level, `hidden` by default). On open the page scroll is frozen (`window.__lenis.stop()` + `overscroll-behavior: contain`) so only the panel scrolls; closing resumes it. Back button or `Escape` closes; focus is restored to the card.
- **Album carousel (Music panel):** horizontal `.albums__track` with prev/next arrows (auto-disable at the ends), drag/swipe to scroll, and scroll-snap. Covers are plain `background-image` on `.album__cover`.

---

## Design System (keep consistent across changes)

- **Style:** minimal, airy, elegant editorial.
- **Fonts:**
  - Headings / wordmark → **Cormorant Garamond** (light serif; main heading uses *Light Italic*).
  - UI text → **Inter**.
- **Theme tokens** (defined in `:root` in `styles.css`):
  - Dark slate `#1d2730` · Cream pill `#f6ead2` (text `#2b2419`) · white text variants.
  - Palette is sampled from the hero photo.
- **Components:** cream pill (`.pill--cream`), dark pill (`.pill--dark`), ghost pill
  (`.pill--ghost`), circular menu button (`.menu-btn`), full-screen overlay menu (`.menu`),
  glass contact form, bento hobby grid, project cards (featured / pair / wide),
  off-canvas hobby detail panel (`.hobby-detail`), album carousel (`.albums`).
- **Conventions / guardrails:**
  - SVG icons only — **no emoji/unicode as icons**.
  - Accessible: visible `:focus-visible` rings, 44px+ touch targets, `prefers-reduced-motion` respected.
  - No decorative "live" status dots.
  - **Never invent biographical facts** — use only confirmed info (below) or ask.

---

## About Ethan (confirmed content facts)

- University of Arkansas — **Walton Honors College of Business**
- Track: **Business Finance** · Path: **Pre-dental**
- Based in **Fayetteville, Arkansas**
- Tagline (his words): *"A family-driven student who dreams big and always looks to be a
  positive, genuine, and good person."*
- Contact email: ethanmic6@gmail.com
- Project: **Rebel Hauling** — built and deployed a website for a hauling business
  (live at rebelhauling.com).
- Favorite albums (in the Music carousel): *Take Care* — Drake · *Blonde* — Frank Ocean ·
  *Unorthodox Jukebox* — Bruno Mars · *4 Your Eyez Only* — J. Cole · *ICEMAN* — Drake ·
  *Graduation* — Kanye West · *My Beautiful Dark Twisted Fantasy* — Kanye West ·
  *Gold: Greatest Hits* — ABBA · *The Stranger* — Billy Joel · *IGOR* — Tyler, the Creator ·
  *Freudian* — Daniel Caesar.

---

## TODO / Next Steps

- [ ] Fill the **About** bio paragraph and 2 **timeline** milestones.
- [ ] Fill the **Music** panel intro lede (the album carousel is done).
- [ ] Fill the **Sports / Video Games / Software-App Dev** detail views: intro lede, 3 highlight cards, and media. These are off-canvas panels reachable only by clicking a hobby card — intentionally **not** in the scroll flow or the menu.
- [ ] Fill the 3 secondary **Projects** cards.
- [ ] Add real **GitHub** URL (Projects + Contact links are `#`).
- [ ] Add **Résumé** link/PDF (Projects pill is `#`).
- [ ] Add **LinkedIn** and **Instagram** URLs (Contact links are `#`).

---

## Notes

- Photos from the macOS Photos Library can't be read by command-line tools (macOS privacy/TCC).
  Re-exporting future Photos assets needs a manual export step.
- The menu button opens a full-screen overlay listing all sections; it closes on link click or `Escape`.
- Album covers are fetched from public catalog APIs (iTunes Search / Cover Art Archive) and
  saved into `assets/albums/`. To add another album, just name it and the cover gets pulled in.
