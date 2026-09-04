/**
 * External (non-React) scroll state bus.
 *
 * `PinnedShowcase` mutates this object directly from GSAP ScrollTrigger's
 * `onUpdate`/`onToggle` callbacks (which fire on every scrub tick), and
 * `SceneCanvas` reads it inside R3F's `useFrame` (which also runs every
 * render frame). Routing this value through React state/props would force a
 * full component re-render 60+ times a second for something that only ever
 * needs to reach a `useFrame` closure — so instead both sides read/write a
 * plain mutable object, which is the standard pattern for bridging
 * high-frequency external state into an R3F render loop.
 */
export interface ScrollState {
  /** 0-1 progress through the PinnedShowcase's scrubbed timeline. */
  showcaseProgress: number;
  /** Whether the PinnedShowcase section is currently pinned/active. */
  showcaseActive: boolean;
}

export const scrollState: ScrollState = {
  showcaseProgress: 0,
  showcaseActive: false,
};
