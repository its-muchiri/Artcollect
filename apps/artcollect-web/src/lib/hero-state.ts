/**
 * External (non-React) hero state bus — the same pattern the old global
 * `scroll-state.ts` used for the retired background scene: high-frequency
 * scrub/pointer values flow into R3F's `useFrame` through a plain mutable
 * object instead of React state, so no component re-renders 60+ times a
 * second.
 *
 * `CollageHero` writes (GSAP ScrollTrigger `onUpdate`, window pointermove);
 * `CollageHeroCanvas` reads inside `useFrame`.
 */
export interface HeroState {
  /** 0–1 progress through the hero's scroll-scrubbed assembly. */
  assembleProgress: number;
  /** Pointer position normalized to -1..1 from the section's center. */
  pointerX: number;
  /** Pointer position normalized to -1..1 from the section's center. */
  pointerY: number;
}

export const heroState: HeroState = {
  assembleProgress: 0,
  pointerX: 0,
  pointerY: 0,
};
