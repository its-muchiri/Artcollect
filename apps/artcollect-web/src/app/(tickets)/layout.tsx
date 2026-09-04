import type { ReactNode } from "react";

/**
 * The ticketing/checkout section's layout — deliberately does NOT wrap
 * children in `SmoothScrollProvider` (Lenis + GSAP) the way
 * `(editorial)/layout.tsx` does. Both design briefs are explicit that
 * checkout, the ticket wallet, and order lookup must stay calm and
 * motion-free; this route group is what makes that a structural guarantee
 * rather than a discipline problem — pages here simply have no path to the
 * heavy providers, so they can't end up depending on them by accident.
 *
 * `Header`/`Footer` render per-page (see each page under this group) since
 * their content varies slightly by context (e.g. the lookup page has no
 * need for the full nav); this layout is intentionally just a pass-through.
 */
export default function TicketsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
