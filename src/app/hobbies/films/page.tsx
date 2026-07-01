import type { Metadata } from "next";
import EthanflixExperience from "@/components/ui/ethanflix-experience";

export const metadata: Metadata = {
  title: "ETHANFLIX — Ethan Miclat",
};

/**
 * Standalone "ETHANFLIX" Films / Movies page. Like the arcade, this hobby takes
 * over the whole screen rather than using the shared HobbyDetail shell: a
 * Netflix-style intro animation (the red "E" logo) dives into a scrollable
 * catalogue. All of it lives in <EthanflixExperience> (a client component).
 */
export default function FilmsPage() {
  return (
    <main className="flix-page">
      <EthanflixExperience />
    </main>
  );
}
