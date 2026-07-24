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

const DESCRIPTION =
  "Ethan Miclat — a family-driven student at the University of Arkansas's Walton Honors College of Business who dreams big and always looks to be a positive, genuine, and good person.";

export const metadata: Metadata = {
  // TODO: once deployed, set this to the real domain so social-card image URLs
  // resolve absolutely, e.g. metadataBase: new URL("https://ethanmiclat.com"),
  title: "Ethan Miclat",
  description: DESCRIPTION,
  openGraph: {
    title: "Ethan Miclat",
    description: DESCRIPTION,
    siteName: "Ethan Miclat",
    type: "website",
    images: [{ url: "/assets/hero-bg.jpeg", width: 2016, height: 1512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethan Miclat",
    description: DESCRIPTION,
    images: ["/assets/hero-bg.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`js ${inter.variable} ${cormorant.variable} ${pressStart.variable} ${bebas.variable}`}
    >
      <head>
        {/* Apply the saved theme before first paint so there's no flash. Runs
            synchronously during HTML parsing (see Next's "Preventing Flash
            before hydration" guide). Defaults to the server-rendered dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
