"use client";

/**
 * Central GSAP singleton.
 *
 * ScrollTrigger (and GSAP itself) touch `window`/`document` on import, so it
 * must never be registered during server-side rendering. Every component
 * that needs GSAP should import `gsap`/`ScrollTrigger` from this module
 * instead of `gsap`/`gsap/ScrollTrigger` directly, so the plugin is
 * registered exactly once for the whole app.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
