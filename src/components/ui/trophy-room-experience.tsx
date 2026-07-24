"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SHELVES, type Emblem, type Shelf, type Statue, type Trophy } from "@/lib/sports";
import StatueScene from "@/components/ui/statue-scene";

/**
 * Sports "Hall of Fame" (/hobbies/sports) — a full-screen takeover (like the
 * arcade and ETHANFLIX) styled as a theatrical trophy room:
 *
 *   curtain → two velvet panels cover the screen with the title on them. Click
 *             (or Enter) to part them.
 *   hall    → the curtains pull to the sides under a gold valance, revealing lit
 *             wooden shelves. Each shelf is a category; each trophy is a gold
 *             *statue* whose shape depends on what it's about, with an optional
 *             sport emblem on its base.
 *
 * Motion is CSS-driven and bypassed under prefers-reduced-motion (curtains open
 * immediately so the hall is shown straight away).
 */
/** A trophy pulled into the focus view, with its resolved statue. */
type FocusedTrophy = { trophy: Trophy; statue: Statue };

export default function TrophyRoomExperience() {
  const [open, setOpen] = useState(false);
  // The statue currently pulled into the centre focus view (or null).
  const [focused, setFocused] = useState<FocusedTrophy | null>(null);
  // True while the focus view plays its exit animation before unmounting.
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Close the focus view through a short sink-and-fade (skipped under
  // reduced motion); guarded so a second Esc/click mid-exit is a no-op.
  const closeFocus = () => {
    if (closingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFocused(null);
      return;
    }
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closingRef.current = false;
      setClosing(false);
      setFocused(null);
    }, 300);
  };

  // Arriving from the homepage's hobby stack (scrolled near the bottom), the
  // old scroll position can survive the route change — land at the top before
  // first paint so the reveal always starts on the curtains.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Honor reduced-motion: skip the reveal and show the hall immediately. The
  // open is deferred into a timer (not set synchronously in the effect body).
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Enter parts the curtains; Esc closes the focus view, then the curtains.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !open) setOpen(true);
      else if (e.key === "Escape") {
        if (focused) closeFocus();
        else if (open) setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, focused]);

  return (
    <div className="trophy-page" data-open={open ? "" : undefined}>
      <Link className="trophy-page__back" href="/#hobby-sports" scroll={false}>
        <ArrowLeft aria-hidden="true" />
        Back
      </Link>

      {/* The hall, behind the curtains. Inert until the reveal so nothing inside
          is focusable / clickable through the closed velvet. */}
      <main className="hall" inert={!open}>
        <div className="hall__glow" aria-hidden="true" />
        <div className="hall__inner">
          <header className="hall__header">
            <p className="hall__kicker">Ethan Miclat&rsquo;s</p>
            <h1 className="hall__title">Hall of Fame</h1>
          </header>

          <div className="hall__shelves">
            {SHELVES.map((shelf, i) => (
              <ShelfRow
                key={shelf.category}
                shelf={shelf}
                index={i}
                onSelect={setFocused}
              />
            ))}
          </div>
        </div>
      </main>

      {/* The curtains, in front. Inert once open so the gathered velvet stays as
          a decorative frame without trapping focus. */}
      <div className="curtain" inert={open}>
        <div className="curtain__rod" aria-hidden="true" />
        <button
          type="button"
          className="curtain__open"
          onClick={() => setOpen(true)}
          aria-label="Part the curtains to enter Ethan's Hall of Fame"
        >
          <span className="curtain__panel curtain__panel--left" aria-hidden="true" />
          <span className="curtain__panel curtain__panel--right" aria-hidden="true" />
          <span className="curtain__valance" aria-hidden="true" />
          <span className="curtain__prompt">
            <span className="curtain__prompt-kicker">Ethan&rsquo;s</span>
            <span className="curtain__prompt-title">Hall of Fame</span>
          </span>
        </button>
      </div>

      {focused && (
        <TrophyFocus
          trophy={focused.trophy}
          statue={focused.statue}
          closing={closing}
          onClose={closeFocus}
        />
      )}

      <StatueDefs />
    </div>
  );
}

function ShelfRow({
  shelf,
  index,
  onSelect,
}: {
  shelf: Shelf;
  index: number;
  onSelect: (f: FocusedTrophy) => void;
}) {
  return (
    <section className="shelf" style={{ ["--si" as string]: index }}>
      <div className="shelf__row">
        {shelf.trophies.map((t, i) => (
          <TrophyPiece
            key={`${t.title}-${i}`}
            trophy={t}
            fallback={shelf.statue}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="shelf__ledge" aria-hidden="true" />
      <h2 className="shelf__label">{shelf.category}</h2>
    </section>
  );
}

/** The statue / logo medallion / SVG figure a trophy displays — shared between
    the shelf tiles and the focus view. */
function TrophyMedia({
  trophy,
  statue,
  interactive = false,
}: {
  trophy: Trophy;
  statue: Statue;
  interactive?: boolean;
}) {
  if (trophy.model)
    return <StatueScene model={trophy.model} interactive={interactive} />;
  if (trophy.logo) {
    return (
      <span className="trophy__medal" aria-hidden="true">
        {trophy.logoTone === "fill" ? (
          // Paint the logo silhouette with the trophy-gold gradient (mask).
          <span
            className="trophy__logo trophy__logo--fill"
            style={{ ["--logo" as string]: `url(${trophy.logo})` }}
          />
        ) : (
          // Strip the logo's colors to gold tones, keeping inner detail.
          // eslint-disable-next-line @next/next/no-img-element -- small static logo; next/image adds no value here
          <img
            className="trophy__logo trophy__logo--duotone"
            src={trophy.logo}
            alt=""
            draggable={false}
          />
        )}
      </span>
    );
  }
  return <StatueArt statue={statue} />;
}

function TrophyPiece({
  trophy,
  fallback,
  index,
  onSelect,
}: {
  trophy: Trophy;
  fallback: Statue;
  index: number;
  onSelect: (f: FocusedTrophy) => void;
}) {
  const statue = trophy.statue ?? fallback;
  // The badge defaults to the statue's sport (a baller gets a basketball badge);
  // teams/players set it explicitly since their statue is a crest / shape.
  const emblem =
    trophy.emblem ?? (SPORT_STATUES.has(statue) ? (statue as Emblem) : undefined);
  return (
    <button
      type="button"
      className={`trophy${trophy.wide ? " trophy--wide" : ""}`}
      style={{ ["--i" as string]: index }}
      onClick={() => onSelect({ trophy, statue })}
      aria-haspopup="dialog"
      aria-label={`Take a closer look at ${trophy.title}`}
    >
      <span className="trophy__spot" aria-hidden="true" />
      <TrophyMedia trophy={trophy} statue={statue} />
      <span className="trophy__plinth" aria-hidden="true">
        <span className="trophy__plate">
          {emblem && <EmblemArt emblem={emblem} />}
          <span className="trophy__plate-text">
            <span className="trophy__title">{trophy.title}</span>
          </span>
        </span>
      </span>
    </button>
  );
}

/* ── Focus view: a statue pulled to centre stage ──────────────────────────── */

/** One gold fleck of a polish burst. */
type Spark = { tx: number; ty: number; d: number; s: number; r: number };

/**
 * Dialog overlay shown when a trophy is clicked: the statue takes centre stage
 * (large, drag-to-turn) with its story on a wooden panel beside it. Clicking
 * the statue "polishes" it — a burst of gold sparkles from the click point;
 * drags that were clearly a turn, not a tap, don't sparkle.
 */
function TrophyFocus({
  trophy,
  statue,
  closing,
  onClose,
}: {
  trophy: Trophy;
  statue: Statue;
  closing: boolean;
  onClose: () => void;
}) {
  const emblem =
    trophy.emblem ?? (SPORT_STATUES.has(statue) ? (statue as Emblem) : undefined);
  const [bursts, setBursts] = useState<
    { id: number; x: number; y: number; sparks: Spark[] }[]
  >([]);
  const burstId = useRef(0);
  const downAt = useRef({ x: 0, y: 0 });
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog and freeze the hall's scroll behind it.
  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const polish = (e: React.MouseEvent<HTMLButtonElement>) => {
    // A horizontal drag is a turn, not a tap — no sparkles for those.
    const moved = Math.hypot(
      e.clientX - downAt.current.x,
      e.clientY - downAt.current.y
    );
    if (moved > 8) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Keyboard "clicks" have no coordinates — burst from the statue's heart.
    const fromKeyboard = e.clientX === 0 && e.clientY === 0;
    const x = fromKeyboard ? rect.width / 2 : e.clientX - rect.left;
    const y = fromKeyboard ? rect.height * 0.44 : e.clientY - rect.top;
    const id = burstId.current++;
    const sparks = Array.from({ length: 14 }, (): Spark => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 130;
      return {
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist * 0.8 - 30,
        d: Math.random() * 0.18,
        s: 8 + Math.random() * 14,
        r: (Math.random() - 0.5) * 260,
      };
    });
    setBursts((b) => [...b, { id, x, y, sparks }]);
    // Sparks self-expire after the animation (0.9s + max 0.18s delay).
    window.setTimeout(
      () => setBursts((b) => b.filter((burst) => burst.id !== id)),
      1200
    );
  };

  return (
    <div
      className="trophy-focus"
      data-closing={closing ? "" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={trophy.title}
    >
      <button
        type="button"
        className="trophy-focus__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="trophy-focus__stage">
        <button
          type="button"
          className="trophy-focus__statue"
          onPointerDown={(e) => {
            downAt.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={polish}
          aria-label={`Polish the ${trophy.title} statue`}
        >
          <TrophyMedia trophy={trophy} statue={statue} interactive />
          {bursts.map((b) => (
            <span
              key={b.id}
              className="trophy-focus__burst"
              style={{ left: `${b.x}px`, top: `${b.y}px` }}
              aria-hidden="true"
            >
              {b.sparks.map((s, i) => (
                <span
                  key={i}
                  className="trophy-focus__spark"
                  style={{
                    ["--tx" as string]: `${s.tx}px`,
                    ["--ty" as string]: `${s.ty}px`,
                    ["--d" as string]: `${s.d}s`,
                    ["--s" as string]: `${s.s}px`,
                    ["--r" as string]: `${s.r}deg`,
                  }}
                />
              ))}
            </span>
          ))}
        </button>
      </div>
      <aside className="trophy-focus__panel">
        <span className="trophy-focus__plate">
          {emblem && <EmblemArt emblem={emblem} />}
          <span className="trophy-focus__name">{trophy.title}</span>
        </span>
        {trophy.description && (
          <p className="trophy-focus__desc">{trophy.description}</p>
        )}
        <button
          ref={closeRef}
          type="button"
          className="trophy-focus__close"
          onClick={onClose}
        >
          Back to the hall
        </button>
      </aside>
    </div>
  );
}

/* ── Gold statues ─────────────────────────────────────────────────────────
   Each sport gets its own gold athlete figure (thick rounded limbs + the sport's
   gear), so the statue reads as "what it's about". Teams get a crest, players a
   sport figure. The `#trophyGold` gradient is defined once in <StatueDefs/>. */

/** Statues whose name is also a sport (used to default the plate emblem). */
const SPORT_STATUES = new Set<string>([
  "basketball",
  "soccer",
  "tennis",
  "golf",
  "football",
  "baseball",
  "lifting",
  "mma",
  "racing",
]);

const STATUES: Record<Statue, React.ReactNode> = {
  basketball: <BasketballStatue />,
  soccer: <SoccerStatue />,
  tennis: <TennisStatue />,
  golf: <GolfStatue />,
  football: <FootballStatue />,
  baseball: <BaseballStatue />,
  lifting: <LiftingStatue />,
  mma: <MmaStatue />,
  racing: <RacingStatue />,
  crest: <CrestStatue />,
  star: <StarStatue />,
  cup: <CupStatue />,
};

function StatueArt({ statue }: { statue: Statue }) {
  return (
    <span className="trophy__statue" data-statue={statue} aria-hidden="true">
      {STATUES[statue]}
    </span>
  );
}

const GOLD = "url(#trophyGold)";
const ETCH = "#7a531a";

/** Shared <g> attrs for the limb strokes — thick, rounded, gold. */
const LIMBS = {
  fill: "none",
  stroke: GOLD,
  strokeWidth: 11,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CupStatue() {
  return (
    <svg viewBox="0 0 100 120">
      <path d="M26 16 H74 V24 Q74 52 50 60 Q26 52 26 24 Z" fill={GOLD} />
      <path d="M26 22 Q8 22 12 40 Q14 50 28 48" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
      <path d="M74 22 Q92 22 88 40 Q86 50 72 48" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
      <rect x="45" y="59" width="10" height="16" fill={GOLD} />
      <path d="M33 75 H67 L73 93 H27 Z" fill={GOLD} />
    </svg>
  );
}

function BasketballStatue() {
  // Jump shot — ball raised overhead, off-hand guiding.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M42 46 L44 80" />
        <path d="M43 54 L29 42" />
        <path d="M43 54 L55 34" />
        <path d="M44 80 L33 110" />
        <path d="M44 80 L57 104" />
      </g>
      <circle cx="42" cy="34" r="9" fill={GOLD} />
      <circle cx="62" cy="22" r="11" fill={GOLD} />
      <g stroke={ETCH} strokeWidth="1.6" fill="none" opacity="0.55">
        <path d="M51 22 H73" />
        <path d="M62 11 V33" />
      </g>
    </svg>
  );
}

function SoccerStatue() {
  // Striking a ball on the ground.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M40 32 L46 64" />
        <path d="M42 42 L28 50" />
        <path d="M42 42 L56 38" />
        <path d="M46 64 L40 88 L37 110" />
        <path d="M46 64 L64 74 L80 70" />
      </g>
      <circle cx="40" cy="22" r="9" fill={GOLD} />
      <circle cx="89" cy="78" r="9" fill={GOLD} />
      <polygon points="89,72 93,75.5 91.5,80 86.5,80 85,75.5" fill={ETCH} opacity="0.6" />
    </svg>
  );
}

function TennisStatue() {
  // Serve — racket overhead, toss hand up.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M46 42 L48 78" />
        <path d="M47 50 L34 36" />
        <path d="M47 50 L60 30" />
        <path d="M48 78 L38 108" />
        <path d="M48 78 L58 106" />
      </g>
      <circle cx="46" cy="32" r="9" fill={GOLD} />
      <path d="M60 30 L66 22" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="70" cy="16" rx="8" ry="11" fill="none" stroke={GOLD} strokeWidth="5" />
      <circle cx="31" cy="25" r="4.5" fill={GOLD} />
    </svg>
  );
}

function GolfStatue() {
  // Follow-through — torso turned through, club swept up over the shoulder.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M46 32 L52 70" />
        <path d="M48 45 L65 50" />
        <path d="M52 70 L42 106" />
        <path d="M52 70 L63 106" />
      </g>
      <circle cx="45" cy="23" r="9" fill={GOLD} />
      <path d="M65 50 L89 16" fill="none" stroke={GOLD} strokeWidth="5" strokeLinecap="round" />
      <path d="M89 16 L95 20" fill="none" stroke={GOLD} strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}

function FootballStatue() {
  // QB throwing motion — ball cocked back by the head.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M48 34 L46 72" />
        <path d="M47 44 L33 50" />
        <path d="M47 44 L60 32" />
        <path d="M46 72 L34 102" />
        <path d="M46 72 L60 90 L65 110" />
      </g>
      <circle cx="48" cy="24" r="9" fill={GOLD} />
      <g transform="rotate(-32 72 24)">
        <ellipse cx="72" cy="24" rx="12" ry="7" fill={GOLD} />
        <g stroke={ETCH} strokeWidth="1.5" opacity="0.6">
          <path d="M66 24 H78" />
          <path d="M69 21.5 V26.5 M72 21 V27 M75 21.5 V26.5" />
        </g>
      </g>
    </svg>
  );
}

function BaseballStatue() {
  // A level swing — bat swept out near-horizontal (distinct from golf's club).
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M44 34 L50 64" />
        <path d="M47 44 L60 48" />
        <path d="M50 64 L40 104" />
        <path d="M50 64 L62 102" />
      </g>
      <circle cx="44" cy="24" r="9" fill={GOLD} />
      <path d="M60 48 L92 38" fill="none" stroke={GOLD} strokeWidth="7.5" strokeLinecap="round" />
    </svg>
  );
}

function LiftingStatue() {
  // Overhead press — a loaded barbell held above the head.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M49 50 L51 80" />
        <path d="M45 53 L35 16" />
        <path d="M55 53 L65 16" />
        <path d="M51 80 L39 108" />
        <path d="M51 80 L63 108" />
      </g>
      <circle cx="50" cy="40" r="8.5" fill={GOLD} />
      <rect x="18" y="11" width="64" height="6" rx="3" fill={GOLD} />
      <rect x="13" y="3" width="9" height="22" rx="2" fill={GOLD} />
      <rect x="78" y="3" width="9" height="22" rx="2" fill={GOLD} />
    </svg>
  );
}

function MmaStatue() {
  // A fighter throwing a cross — weight driving forward, rear glove guarding the
  // chin, bulky gloves on both hands.
  return (
    <svg viewBox="0 0 100 120">
      <g {...LIMBS}>
        <path d="M43 35 L50 64" />
        <path d="M46 45 L72 43" />
        <path d="M47 46 L38 33" />
        <path d="M50 64 L37 104" />
        <path d="M50 64 L65 86 L71 106" />
      </g>
      <circle cx="42" cy="25" r="9" fill={GOLD} />
      {/* gloves */}
      <circle cx="77" cy="43" r="8.5" fill={GOLD} />
      <path d="M74 47 q3 3 6 0" fill="none" stroke={ETCH} strokeWidth="1.4" opacity="0.5" />
      <circle cx="35" cy="30" r="6.5" fill={GOLD} />
    </svg>
  );
}

function RacingStatue() {
  // A racing helmet — the icon for the sports Ethan only watches.
  return (
    <svg viewBox="0 0 100 120">
      <path
        d="M50 18 C72 18 82 36 82 60 L82 78 C82 92 72 100 58 100 L42 100 C28 100 18 90 18 76 L18 56 C18 34 28 18 50 18 Z"
        fill={GOLD}
      />
      <path d="M26 56 C42 48 64 48 78 56 L75 70 C62 64 42 64 30 70 Z" fill="#5a3d12" />
      <path d="M42 90 H62" stroke="#5a3d12" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44 20 Q50 18 56 20 L53 46 H47 Z" fill="#fdf0c0" opacity="0.45" />
    </svg>
  );
}

function StarStatue() {
  return (
    <svg viewBox="0 0 100 120">
      <path
        d="M50 14 L62 50 L99 50 L69 72 L80 108 L50 86 L20 108 L31 72 L1 50 L38 50 Z"
        fill={GOLD}
      />
    </svg>
  );
}

function CrestStatue() {
  return (
    <svg viewBox="0 0 100 120">
      <path d="M50 8 L86 20 V58 Q86 92 50 112 Q14 92 14 58 V20 Z" fill={GOLD} />
      <path
        d="M50 19 L78 28 V58 Q78 84 50 100 Q22 84 22 58 V28 Z"
        fill="none"
        stroke="#7a531a"
        strokeWidth="3"
        opacity="0.55"
      />
      <path
        d="M50 40 L56 56 L73 56 L59 67 L64 84 L50 73 L36 84 L41 67 L27 56 L44 56 Z"
        fill="#7a531a"
        opacity="0.5"
      />
    </svg>
  );
}

/* ── Sport emblems (small badges on the plinth) ──────────────────────────── */

const DISC = "#e6b94e";
const ENGRAVE = "#6e4a16";

function EmblemArt({ emblem }: { emblem: Emblem }) {
  return (
    <span className="trophy__emblem" aria-hidden="true">
      <svg viewBox="0 0 40 40">{EMBLEMS[emblem]}</svg>
    </span>
  );
}

const EMBLEMS: Record<Emblem, React.ReactNode> = {
  basketball: (
    <>
      <circle cx="20" cy="20" r="15" fill={DISC} />
      <g stroke={ENGRAVE} strokeWidth="1.8" fill="none">
        <line x1="5" y1="20" x2="35" y2="20" />
        <line x1="20" y1="5" x2="20" y2="35" />
        <path d="M9 9 Q20 20 9 31" />
        <path d="M31 9 Q20 20 31 31" />
      </g>
    </>
  ),
  soccer: (
    <>
      <circle cx="20" cy="20" r="15" fill={DISC} />
      <polygon points="20,13 26,17.5 23.5,25 16.5,25 14,17.5" fill={ENGRAVE} />
      <g stroke={ENGRAVE} strokeWidth="1.6" fill="none">
        <path d="M20 13 L20 6" />
        <path d="M26 17.5 L33 15" />
        <path d="M23.5 25 L28 31" />
        <path d="M16.5 25 L12 31" />
        <path d="M14 17.5 L7 15" />
      </g>
    </>
  ),
  football: (
    <>
      <ellipse cx="20" cy="20" rx="15" ry="10" fill={DISC} />
      <g stroke={ENGRAVE} strokeWidth="1.8" fill="none">
        <path d="M7 20 Q20 11 33 20 Q20 29 7 20 Z" />
        <line x1="13" y1="20" x2="27" y2="20" />
        <line x1="16" y1="17" x2="16" y2="23" />
        <line x1="20" y1="17" x2="20" y2="23" />
        <line x1="24" y1="17" x2="24" y2="23" />
      </g>
    </>
  ),
  tennis: (
    <>
      <circle cx="20" cy="20" r="15" fill={DISC} />
      <g stroke={ENGRAVE} strokeWidth="1.8" fill="none">
        <path d="M9 8 Q23 20 9 32" />
        <path d="M31 8 Q17 20 31 32" />
      </g>
    </>
  ),
  baseball: (
    <>
      <circle cx="20" cy="20" r="15" fill={DISC} />
      <g stroke={ENGRAVE} strokeWidth="1.6" fill="none">
        <path d="M11 7 Q17 20 11 33" />
        <path d="M29 7 Q23 20 29 33" />
        <g strokeWidth="1.2">
          <path d="M12 11 l3 1 M11 16 l3 1 M11 21 l3 1 M11 26 l3 1" />
          <path d="M28 11 l-3 1 M29 16 l-3 1 M29 21 l-3 1 M28 26 l-3 1" />
        </g>
      </g>
    </>
  ),
  lifting: (
    <>
      <rect x="11" y="17.5" width="18" height="5" rx="2" fill={DISC} />
      <rect x="5" y="12" width="6" height="16" rx="2" fill={DISC} />
      <rect x="29" y="12" width="6" height="16" rx="2" fill={DISC} />
      <rect x="2" y="16" width="3.5" height="8" rx="1.5" fill={DISC} />
      <rect x="34.5" y="16" width="3.5" height="8" rx="1.5" fill={DISC} />
    </>
  ),
  mma: (
    <>
      <path
        d="M13 16 Q13 10 19 10 L27 10 Q33 10 33 17 L33 24 Q33 30 26 30 L19 30 Q13 30 13 25 Z"
        fill={DISC}
      />
      <path d="M13 19 Q8 19 8 23 Q8 27 13 26 Z" fill={DISC} />
      <g stroke={ENGRAVE} strokeWidth="1.2" opacity="0.45">
        <path d="M20 11 V29 M25 11 V29 M30 13 V27" />
      </g>
    </>
  ),
  racing: (
    <>
      <line x1="11" y1="6" x2="11" y2="34" stroke={ENGRAVE} strokeWidth="2.4" />
      <g fill={ENGRAVE}>
        <rect x="13" y="8" width="5" height="5" />
        <rect x="23" y="8" width="5" height="5" />
        <rect x="18" y="13" width="5" height="5" />
        <rect x="28" y="13" width="4" height="5" />
        <rect x="13" y="18" width="5" height="5" />
        <rect x="23" y="18" width="5" height="5" />
      </g>
      <rect x="13" y="8" width="19" height="15" fill="none" stroke={DISC} strokeWidth="1" />
    </>
  ),
  golf: (
    <>
      <line x1="14" y1="6" x2="14" y2="32" stroke={ENGRAVE} strokeWidth="2.2" />
      <path d="M14 7 L30 12 L14 17 Z" fill={DISC} stroke={ENGRAVE} strokeWidth="1" />
      <ellipse cx="14" cy="33" rx="9" ry="3" fill={ENGRAVE} opacity="0.6" />
    </>
  ),
  star: (
    <path
      d="M20 5 L24 16 L36 16 L26 23 L30 35 L20 28 L10 35 L14 23 L4 16 L16 16 Z"
      fill={DISC}
    />
  ),
};

/** Shared SVG defs: the gold gradient every statue paints with. */
function StatueDefs() {
  return (
    <svg className="trophy-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcebb0" />
          <stop offset="0.4" stopColor="#e8bd55" />
          <stop offset="0.72" stopColor="#bd8a2f" />
          <stop offset="1" stopColor="#8a5e1c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
