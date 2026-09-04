import type { ReactNode } from "react";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

/**
 * The editorial/browsing section's layout: Lenis + GSAP scroll sync and
 * everything downstream of it (pinned sections, scroll-scrubbed reveals,
 * the collage hero) is scoped to this route group only — see the root
 * `app/layout.tsx` for why it isn't at the true root.
 */
export default function EditorialLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="relative z-10">{children}</div>
    </SmoothScrollProvider>
  );
}
