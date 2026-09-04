"use client";

import { useContext, useEffect, useState } from "react";
import type Lenis from "lenis";
import { LenisContext } from "@/lib/lenis-context";

/**
 * Returns the app-wide Lenis instance created by `SmoothScrollProvider`, or
 * `null` before it has mounted (first client render) / during SSR.
 *
 * Prefer this over `useLenisScroll` when you only need to read scroll data
 * imperatively (inside a `useFrame`, a GSAP callback, an event handler) —
 * it does NOT cause re-renders, since the instance reference itself never
 * changes after mount.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export interface LenisScrollState {
  /** Raw scroll offset in pixels. */
  scroll: number;
  /** Maximum scrollable distance in pixels. */
  limit: number;
  /** Normalized scroll position, 0-1. */
  progress: number;
  /** Signed scroll speed. */
  velocity: number;
  /** 1 = scrolling down, -1 = scrolling up. */
  direction: 1 | -1 | 0;
}

const initialScrollState: LenisScrollState = {
  scroll: 0,
  limit: 0,
  progress: 0,
  velocity: 0,
  direction: 0,
};

/**
 * Reactive variant of `useLenis` for components that render UI *from*
 * scroll position (progress bars, condensing navbars, etc). Subscribes to
 * Lenis's `scroll` event and mirrors it into React state.
 *
 * Use sparingly — this re-renders the consuming component on every scroll
 * frame. High-frequency consumers (3D scenes, scrub-driven transforms)
 * should read `useLenis()` imperatively instead.
 */
export function useLenisScroll(): LenisScrollState {
  const lenis = useLenis();
  const [state, setState] = useState<LenisScrollState>(initialScrollState);

  useEffect(() => {
    if (!lenis) return;

    const onScroll = (instance: Lenis) => {
      setState({
        scroll: instance.scroll,
        limit: instance.limit,
        progress: instance.progress,
        velocity: instance.velocity,
        direction: instance.direction as 1 | -1 | 0,
      });
    };

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return state;
}
