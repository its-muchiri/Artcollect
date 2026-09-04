"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Ticket, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Art & artists", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Donate", href: "/donate" },
  { label: "How it works", href: "/events#how-it-works" },
  { label: "For organisers", href: "/events#organisers" },
  { label: "Find my ticket", href: "/lookup" },
] as const;

/**
 * The ticketing section's own header (docs/11: calm, no loud styles — see
 * eslint.config.mjs's no-restricted-imports gate on this file's siblings).
 * The wordmark links to the site root (now ArtCollect's homepage) rather
 * than `/events` — one merged site, one logo-goes-home target — with an
 * explicit "Art & artists" link alongside it so a ticket buyer can find
 * their way back to the browsing side without relying on the browser's
 * back button.
 *
 * Below `sm` the link row collapses into a hamburger sheet: hiding it
 * outright with no fallback (the previous behaviour) left phones with no
 * way to reach Donate, how-it-works, or ticket lookup at all.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900 dark:text-zinc-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Ticket size={18} strokeWidth={2.25} />
          </span>
          TikoYetu
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-300 sm:block"
          >
            Browse events
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:scale-90 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:hidden"
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 sm:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-zinc-800 dark:text-zinc-200 active:bg-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/events"
                onClick={() => setMenuOpen(false)}
                className="block rounded-full bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
              >
                Browse events
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
