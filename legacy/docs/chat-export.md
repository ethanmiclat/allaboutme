---
title: "Ethan Miclat Personal Website — Hero Section Build"
type: project-log
source: claude-code-chat
date: 2026-06-25
tags: [personal-website, portfolio, hero-section, html, css, design]
status: hero-section-complete
---

# Ethan Miclat Personal Website — Build Log & Context

A conversation log distilled into structured, ingestible facts. Covers the first build
session: a minimal, elegant hero section for a personal "all about me" website.

---

## 1. Project Overview

- **Goal:** Build a personal website that is "all about me" (Ethan Miclat).
- **Scope this session:** Hero section only. Other sections (About Me, Projects, Hobbies, Contact) are planned but not yet built.
- **Working directory:** `/Users/ethanmic/ethanmiclat`
- **Stack:** Plain HTML + CSS + a small inline JS snippet (no framework, no build step).
- **Files:**
  - `index.html` — hero markup + menu toggle script.
  - `styles.css` — all styling and animations.
  - `assets/hero-bg.jpeg` — background photo.
  - `docs/chat-export.md` — this document.

---

## 2. About the User (Ethan Miclat) — verified facts

These are the real, user-confirmed details (no invented content). Use these for any
biography/description copy across the site.

- **Name:** Ethan Miclat
- **School:** University of Arkansas — Walton Honors College of Business
- **Academic track:** Business Finance
- **Career path:** Pre-dental
- **Self-description / tagline (user's own words):** "A family-driven student who dreams big and always looks to be a positive, genuine, and good person."
- **Contact email (system context):** ethanmic6@gmail.com

### Hero copy currently in use
- **Eyebrow / wordmark:** "ETHAN MICLAT" (top-center logo)
- **Main heading:** "All About Me"
- **CTA:** "View My Work" → links to `#projects`
- **Secondary CTA:** "Contact Me" → links to `#contact`

> Note: An earlier draft included a longer descriptive paragraph and GitHub/Résumé buttons.
> These were **removed** from the hero at the user's request — GitHub and Résumé will live in
> the future **Work** section instead.

---

## 3. Design Direction & Decisions

### Final aesthetic (from the second reference: "Domitur Travel")
Minimal, airy, elegant editorial style.

- **Typography:**
  - Headings & wordmark: **Cormorant Garamond** (light serif).
  - Main heading "All About Me": Cormorant Garamond **Light Italic**, ~90% opacity — intentionally subtle and "fancy but readable."
  - Wordmark "ETHAN MICLAT": tracked uppercase, letter-spacing `0.31em` (tightened from an earlier `0.42em` for a more refined wordmark feel).
  - UI text (buttons, labels): **Inter**.
- **Layout:**
  - Top bar = 3 columns: empty left / centered wordmark / menu button on the right.
  - Center = "All About Me" heading + cream "View My Work" pill.
  - Footer = animated "scroll" cue (center) + dark "Contact Me" pill (bottom-right).
- **Navigation:** A single circular/pill **menu button** (top-right) opens a **full-screen overlay menu** containing all sections: Home, About Me, Projects, Hobbies, Contact. Hamburger morphs into an X; links stagger in; closes on link click or Escape.
- **Color palette (sampled from the background photo):**
  - Base/dark slate: `#1d2730`
  - Cream pill (echoes sky highlights): `#f6ead2`, text `#2b2419`
  - Text: white with reduced-opacity variants.
- **Background photo:** A real photo of Ethan on a boat watching a double rainbow over a calm, overcast sea. `background-position: 60% 88%` — pushed down/right to show more of the subject. Subtle slow zoom drift animation.
- **Overlay:** Light, airy wash (radial + linear gradient) — just enough contrast to keep white serif text legible over the bright water.

### Earlier direction (superseded)
The very first version followed a different reference ("Hubtown" — dark futuristic, glowing
cube, vertical FUTURE/INNOVATION list). That was fully replaced by the minimal Domitur-style
direction. Discarded elements: dark navy theme, pulsing "live" status dots, a "Beginning—Now"
vertical side marker, and an inline horizontal nav row.

---

## 4. Explicit User Preferences & Constraints

- Keep the hero **very minimal**.
- **No invented facts** — only use real, user-provided information for descriptions; ask interview questions rather than fabricating.
- Top-left of the hero: intentionally left empty.
- Avoid common "AI design" tells: **no emoji/unicode as icons** (use SVG), no decorative "live" status dots, consistent spacing, accessible contrast, visible focus states, `prefers-reduced-motion` support, 44px+ touch targets.
- Fonts should be "skinny and smooth" / fancy but readable and subtle.

---

## 5. Open Items / TODO (next sessions)

- [ ] Provide **GitHub URL** (placeholder `#` currently).
- [ ] Provide **Résumé** destination — PDF or link (placeholder `#` currently).
- [ ] Build the **About Me** section.
- [ ] Build the **Projects / Work** section (will host GitHub, Résumé, and website links).
- [ ] Build the **Hobbies** section.
- [ ] Build the **Contact** section.
- [ ] Optional: evaluate alternate heading fonts (Marcellus, Italiana) if the italic feels too decorative.

---

## 6. Background Photo — Access Note (operational)

The original photo lived inside the macOS Photos Library and was **not accessible** to
command-line tools due to macOS privacy (TCC) protection. It was manually copied out by the
user and now lives at `assets/hero-bg.jpeg`. Future image assets from the Photos Library will
need the same manual export step.
