"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LenisContext } from "@/lib/lenis-context";
import { prefersReducedMotion } from "@artcollect/ui";

export interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * RAF SYNCHRONIZATION LOOP — Lenis <-> GSAP <-> ScrollTrigger
 * ------------------------------------------------------------------
 * There is exactly ONE animation-frame loop driving scroll in this app:
 * GSAP's central ticker (`gsap.ticker`), which itself runs on a single
 * `requestAnimationFrame` callback internally.
 *
 * Each tick does three things, in order:
 *
 *   1. `lenis.raf(time)` advances Lenis's internal spring/lerp simulation
 *      and, as a side effect, writes the smoothed value to the real
 *      `window.scrollY` (Lenis's default mode is not a fake/virtual
 *      scrollbar — it drives the actual document scroll position every
 *      frame). Because of that, nothing else in the app needs a
 *      `scrollerProxy` — ScrollTrigger keeps reading the native scroll
 *      position as usual.
 *
 *   2. The `lenis.on('scroll', ScrollTrigger.update)` listener (registered
 *      once below) fires synchronously inside that same `raf` call, forcing
 *      ScrollTrigger to recompute pins/scrub progress immediately rather
 *      than waiting for its own next internal tick. Without this, pinned
 *      sections and scrubbed tweens lag Lenis's eased value by up to a
 *      frame, which reads as visible jitter.
 *
 *   3. GSAP's own tweens/ScrollTriggers (registered by ScrollTrigger
 *      internally on `gsap.ticker`) run as part of the same ticker flush,
 *      so DOM tween updates land in the same frame as the Lenis position
 *      update that caused them.
 *
 * `gsap.ticker.lagSmoothing(0)` disables GSAP's default behaviour of
 * silently "catching up" (skipping/compressing elapsed time) after a long
 * task or tab-switch. That catch-up logic is meant for keyframe animations,
 * but for scroll-scrubbed animations it causes a sudden jump; disabling it
 * keeps scroll position and animation progress always in lockstep with each
 * other, even if it means a visibly slower frame after a stall.
 *
 * Downstream of this loop, `@react-three/fiber`'s `<Canvas>` runs its own
 * `requestAnimationFrame` render loop (via `frameloop="always"`, the R3F
 * default) to draw the WebGL scene. That is a second, independent rAF
 * subscription — but since both this ticker and R3F's loop are bound to the
 * same browser paint cycle, they still fire once per frame in visual
 * lockstep. What actually threads the two together is *data*, not a shared
 * callback: `SceneCanvas` reads the live `Lenis` instance (`lenis.scroll`,
 * `lenis.progress`) straight off this provider inside its own `useFrame`,
 * so the WebGL scene always reflects the exact same scroll value GSAP just
 * used, one paint later at the most.
 *
 * Reduced motion (docs/11 Phase 1): when the OS-level
 * `prefers-reduced-motion: reduce` setting is on, Lenis is simply never
 * instantiated — scroll stays native and unsmoothed, the context exposes
 * `null` (every consumer already treats a null instance as "read native
 * scroll, render the static state"), and scrubbed/pinned sections render
 * their assembled static fallbacks. This is the scroll-engine half of the
 * reduced-motion infrastructure; the per-scene fallbacks live with the
 * scenes themselves.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Skip the smoothing engine entirely under reduced motion.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      // Lenis's own recommended easing curve (an ease-out-expo
      // approximation): fast initial response that settles smoothly,
      // without the overshoot a true cubic-bezier would need extra
      // control-point tuning to avoid.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;
    // One deliberate cascade: publishing the mounted instance to context
    // consumers. Deferred placement would leave consumers reading a null
    // instance for a full extra frame, so the synchronous set is the
    // intended behavior (react-hooks/set-state-in-effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenisInstance(lenis);

    // Step 2 of the RAF loop described above: force ScrollTrigger to
    // resync the instant Lenis reports a new scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    // Step 1 + 3: drive Lenis from GSAP's ticker instead of a second,
    // independent `requestAnimationFrame` loop. `gsap.ticker`'s callback
    // receives elapsed time in *seconds*; Lenis's `raf()` expects
    // *milliseconds*, hence the `* 1000`.
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);

    // Prevent GSAP from compressing/skipping elapsed time after a long
    // task, which would otherwise desync Lenis's eased scroll value from
    // ScrollTrigger's scrub progress.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
