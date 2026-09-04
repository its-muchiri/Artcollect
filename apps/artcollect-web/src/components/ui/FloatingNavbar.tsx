"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLenisScroll } from "@/hooks/useLenis";

const NAV_LINKS = ["Collection", "Artists", "Journal"] as const;

const CONDENSE_THRESHOLD = 80;

/**
 * The v2 navbar: a paper pill with an ink rule and an Anton wordmark,
 * restyled from the v1 glassmorphic dark pill but keeping its engine —
 * scroll position from the same Lenis instance via `useLenisScroll`
 * (data), the condense/hover transitions in pure Framer Motion
 * (transition). Entrance is skipped entirely under reduced motion.
 */
export function FloatingNavbar() {
  const { scroll } = useLenisScroll();
  const reduced = useReducedMotion();
  const condensed = scroll > CONDENSE_THRESHOLD;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.header
      initial={reduced ? false : { y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <motion.div
        animate={condensed ? "condensed" : "expanded"}
        variants={{
          expanded: { paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 },
          condensed: { paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7 },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex w-full max-w-2xl items-center justify-between gap-8 rounded-full border-2 border-ink bg-paper shadow-[3px_4px_0_rgba(22,19,17,1)]"
      >
        <Link href="/" className="font-display text-lg leading-none tracking-wide text-ink">
          ARTCOLLECT
        </Link>

        <nav
          className="hidden items-center gap-1 sm:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onMouseEnter={() => setHovered(link)}
              className="relative rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {hovered === link && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-paper-deep"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link}</span>
            </a>
          ))}
          {/* Real navigation, not a same-page anchor: crosses into the
              (tickets) route group, one merged site's other section. */}
          <Link
            href="/events"
            onMouseEnter={() => setHovered("Tickets")}
            className="relative rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            {hovered === "Tickets" && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute inset-0 -z-10 rounded-full bg-paper-deep"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">Tickets</span>
          </Link>
        </nav>

        <motion.a
          href="#events"
          whileHover={reduced ? undefined : { scale: 1.05 }}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          className="rounded-full bg-coral px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink"
        >
          Openings
        </motion.a>
      </motion.div>
    </motion.header>
  );
}
