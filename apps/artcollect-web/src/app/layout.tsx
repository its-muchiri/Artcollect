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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artcollect-web.vercel.app";
const SITE_TITLE = "ArtCollect — Collect the work you can't stop thinking about";
const SITE_DESCRIPTION =
  "Buy original art from East African artists, donate to real art causes with public receipts, and get opening-night tickets — all on ArtCollect.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "buy original art online",
    "art exhibitions Nairobi",
    "donate to art programs",
    "art auctions",
    "East African artists",
    "art events Kenya",
    "how to value artwork",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "ArtCollect",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export interface RootLayoutProps {
  children: ReactNode;
}

// Site-wide structured data: one Organization/WebSite pair, kept to facts
// this app can actually back up (it makes no nonprofit or tax-status
// claims anywhere — see the Journal's donation posts for why).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ArtCollect",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ArtCollect",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body className="relative min-h-screen bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
