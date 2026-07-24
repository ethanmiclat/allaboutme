"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Light/dark toggle for the reading page.
 *
 * The real theme is applied before paint by the inline script in layout.tsx
 * (which reads `localStorage.theme` and sets `data-theme` on <html>), so there
 * is no flash. This button just reflects and flips that attribute, persisting
 * the choice. It renders "dark" on the server; a mount effect syncs it to the
 * attribute the script already set, so at most the icon (never the page)
 * corrects on first load.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage can be unavailable (private mode) — the toggle still works for
         the session, it just won't persist. */
    }
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Show the mode you'll switch TO. */}
      {theme === "dark" ? (
        <Sun key="sun" aria-hidden="true" />
      ) : (
        <Moon key="moon" aria-hidden="true" />
      )}
    </button>
  );
}
