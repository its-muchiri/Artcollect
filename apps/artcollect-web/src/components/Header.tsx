import Link from "next/link";
import { Ticket } from "lucide-react";

const NAV_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Donate", href: "/donate" },
  { label: "How it works", href: "/events#how-it-works" },
  { label: "For organisers", href: "/events#organisers" },
] as const;

/**
 * The ticketing section's own header (docs/11: calm, no loud styles — see
 * eslint.config.mjs's no-restricted-imports gate on this file's siblings).
 * The wordmark links to the site root (now ArtCollect's homepage) rather
 * than `/events` — one merged site, one logo-goes-home target — with an
 * explicit "Art & artists" link alongside it so a ticket buyer can find
 * their way back to the browsing side without relying on the browser's
 * back button.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Ticket size={18} strokeWidth={2.25} />
          </span>
          TikoYetu
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Art &amp; artists
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/lookup"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 sm:block"
          >
            Find my ticket
          </Link>
          <Link
            href="/events"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Browse events
          </Link>
        </div>
      </div>
    </header>
  );
}
