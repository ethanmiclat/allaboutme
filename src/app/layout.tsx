import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Press_Start_2P, Bebas_Neue } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import ScrollReveal from "@/components/scroll-reveal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Pixel display font for the 8-bit arcade (Video Games) page only.
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

// Tall, condensed display font for the "ETHANFLIX" (Films / Movies) page —
// stands in for the Netflix wordmark look.
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ethan Miclat",
  description:
    "Ethan Miclat — a family-driven student at the University of Arkansas's Walton Honors College of Business who dreams big and always looks to be a positive, genuine, and good person.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`js dark ${inter.variable} ${cormorant.variable} ${pressStart.variable} ${bebas.variable}`}
    >
      <body>
        <SmoothScroll />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
