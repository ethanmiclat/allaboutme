"use client";

import { useEffect, useState } from "react";

const LINKS: [string, string][] = [
  ["#home", "Home"],
  ["#about", "About Me"],
  ["#hobbies", "Hobbies"],
  ["#projects", "Projects"],
  ["#contact", "Contact"],
];

/** Persistent menu button + full-screen overlay menu (home page only). */
export default function SiteMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <>
      <button
        className="menu-btn"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav
        className="menu"
        id="menu"
        aria-label="Primary"
        inert={!open}
        onClick={() => setOpen(false)}
      >
        <ul className="menu__list">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a className="menu__link" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
