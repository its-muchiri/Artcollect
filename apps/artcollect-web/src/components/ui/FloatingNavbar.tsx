"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLenisScroll } from "@/hooks/useLenis";

const NAV_LINKS = [
  { label: "Collection", href: "/browse" },
  { label: "Artists", href: "/artists" },
  { label: "Journal", href: "/journal" },
  { label: "Tickets", href: "/events" },
  { label: "Timeline", href: "/timeline" },
] as const;

const CONDENSE_THRESHOLD = 80;

/**
 * The v2 navbar: a paper pill with an ink rule and an Anton wordmark.
 * Links go to real routes (not homepage scroll-anchors) so this bar works
 * identically wherever it's rendered — not just the homepage. Below the
 * `sm` breakpoint the link row is replaced by a hamburger that opens a
 * full-width sheet: the desktop pill has no room for five links plus a
 * CTA, and hiding them outright (the pre-mobile-pass behaviour) left
 * phones with no way to reach Artists/Journal/Tickets/Timeline at all.
 */
export function FloatingNavbar() {
  const { scroll } = useLenisScroll();
  const reduced = useReducedMotion();
  const condensed = scroll > CONDENSE_THRESHOLD;
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      initial={reduced ? false : { y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4"
    >
      <motion.div
        animate={condensed ? "condensed" : "expanded"}
        variants={{
          expanded: { paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 },
          condensed: { paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7 },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex w-full max-w-2xl items-center justify-between gap-4 rounded-full border-2 border-ink bg-paper shadow-[3px_4px_0_var(--ac-shadow-ink)] sm:gap-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/monogram.png"
            alt="artcollect.co.ke monogram"
            width={24}
            height={26}
            className="h-6 w-auto"
            priority
          />
          <span className="font-display text-lg leading-none tracking-wide text-ink">
            ARTCOLLECT
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" onMouseLeave={() => setHovered(null)}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => setHovered(link.label)}
              className="relative rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {hovered === link.label && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-paper-deep"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        <Link
          href="/events"
          className="hidden shrink-0 rounded-full bg-coral px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-transform hover:scale-105 active:scale-95 sm:block"
        >
          Openings
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-paper-deep active:scale-90 sm:hidden"
        >
          {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2 flex w-full max-w-2xl flex-col gap-1 rounded-3xl border-2 border-ink bg-paper p-3 shadow-[3px_4px_0_var(--ac-shadow-ink)] sm:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-full px-4 py-3 text-base font-semibold text-ink transition-colors active:bg-paper-deep"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/events"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-full bg-coral px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-ink"
            >
              Openings
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
