export type Project = {
  key: string;
  name: string;
  /** Small uppercase line on the tab and sheet, e.g. "Website" */
  meta: string;
  /** One-liner shown on the folder tab */
  blurb: string;
  /** Fuller copy shown on the preview sheet */
  description: string;
  /** External link (omit for placeholders) */
  href?: string;
  linkLabel?: string;
  /** Optional small disclaimer shown under the preview, e.g. "demo only" */
  note?: string;
  /** Screen-recording preview; omit to show the "coming soon" sheet */
  video?: string;
  poster?: string;
  placeholder?: boolean;
  /** Large pull-quote shown in place of a recording, for real (non-placeholder) projects with no video */
  tagline?: string;
};

export const PROJECTS: Project[] = [
  {
    key: "rebel-hauling",
    name: "Rebel Hauling",
    meta: "Website",
    blurb: "A live site for a local hauling business.",
    description:
      "Built and deployed the website for a hauling business, from first layout to live launch.",
    href: "https://rebelhauling.com",
    linkLabel: "Visit Site",
    video: "/assets/rebel-hauling.mp4",
    poster: "/assets/rebel-hauling-poster.jpg",
  },
  {
    key: "purchasing-power",
    name: "Purchasing Power",
    meta: "Web App",
    blurb: "See what your salary is really worth across countries and generations.",
    description:
      "A tool that compares the real value of a paycheck across countries around the world and across generations, using official price, wage, and tax data — housing, goods, and taxes broken out to show true take-home purchasing power over place and time.",
    href: "https://ethanmiclat.github.io/purchasepower/",
    linkLabel: "Visit Site",
    video: "/assets/purchasing-power.mp4",
    poster: "/assets/purchasing-power-poster.jpg",
  },
  {
    key: "cadence",
    name: "Cadence",
    meta: "Web App",
    blurb: "A nutrition and training tracker for daily habits.",
    description:
      "A fitness app that tracks daily calories and macros, builds a meal plan across breakfast, lunch, and dinner, and turns it into a weekly grocery list — with training and progress views to keep everything on pace.",
    href: "https://ethanmiclat.github.io/cadence/onboarding",
    linkLabel: "Visit Site",
    note: "Preview only — this is a front-end demo with no account security or database. Anything you enter stays in your browser, so please don't use real personal information.",
    video: "/assets/cadence.mp4",
    poster: "/assets/cadence-poster.jpg",
  },
  {
    key: "musicbox",
    name: "Musicbox",
    meta: "Web App",
    blurb: "A place to share and discover music with friends.",
    description:
      "A social music app for sharing tracks and playlists with friends and discovering what they're listening to.",
    href: "https://ethanmiclat.github.io/musicbox/",
    linkLabel: "Visit Site",
    note: "Preview only — this is a front-end demo with no account security or database. Anything you enter stays in your browser, so please don't use real personal information.",
    video: "/assets/musicbox.mp4",
    poster: "/assets/musicbox-poster.jpg",
  },
  {
    key: "tinker",
    name: "Tinker",
    meta: "Web Game",
    blurb: "A browser repair sim — take a ticket, fix it up.",
    description:
      "A browser-based repair game: take a ticket, sit down at the workbench, and fix whatever small machine or odd job comes next, one object at a time.",
    href: "https://ethanmiclat.github.io/Tinker/",
    linkLabel: "Play",
    video: "/assets/tinker.mp4",
    poster: "/assets/tinker-poster.jpg",
  },
  {
    key: "this-site",
    name: "This Site!",
    meta: "Portfolio",
    blurb: "A personal portfolio built from scratch with Next.js.",
    description:
      "This portfolio — the folder you're clicking through, the smooth scroll, the hero, all of it. Built with Next.js and TypeScript, styled with hand-written CSS, and animated with GSAP for the scroll-driven layout and transitions throughout.",
    tagline: "You're already here.",
  },
];
