"use client";

import { useEffect, useState } from "react";

/**
 * Shared reduced-motion signal for everything Framer Motion doesn't own:
 * the Lenis/GSAP scroll engine, R3F scenes, and scrubbed sequences.
 *
 * Framer-driven reveals use Framer's own `useReducedMotion()` — this hook
 * exists for the pieces outside Framer's reach (it is dependency-free so
 * it can live in `@artcollect/ui` and serve both apps).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Non-reactive check for use inside effects/one-shot guards (GSAP context
 * setup, scene mounting decisions) where subscribing to changes isn't
 * needed. Always `false` on the server — callers must treat SSR as
 * "possibly reduced motion" anyway, because the poster fallback renders
 * there.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
