import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Caveat, Inter } from "next/font/google";
import "./globals.css";

/*
 * The v2 maximalist typography set (docs/11) — three faces, loaded once at
 * the true root since both the editorial and ticketing sections share them:
 *   - Anton: the poster/display face (graffiti headlines, section shouters).
 *   - Inter: the body/UI/transactional face — the ONE typeface prices,
 *     dates, and confirmations are ever set in.
 *   - Caveat: handwriting, always rendered inside the shared <Annotation>
 *     component's sticky-note backing for guaranteed contrast.
 *
 * This root layout is deliberately minimal — fonts and global CSS only.
 * `SmoothScrollProvider` (Lenis + GSAP) lives in `(editorial)/layout.tsx`,
 * not here, so the `(tickets)` route group (checkout, ticket wallet, order
 * lookup) never loads it. Both design briefs are explicit that those pages
 * must stay calm and motion-free; nesting the heavy providers under a route
 * group rather than the true root is what makes that a build-time
 * guarantee instead of a discipline problem.
 */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArtCollect — Collect the work you can't stop thinking about",
  description:
    "ArtCollect is a maximalist home for East African art: collage-built exhibitions, artist portfolios, and TikoYetu ticketing, in one place.",
};

export interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body className="relative min-h-screen bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
