"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";

interface ShowcaseStage {
  eyebrow: string;
  title: string;
  body: string;
}

const STAGES: ShowcaseStage[] = [
  {
    eyebrow: "01 · Discover",
    title: "One scroll engine for the whole page",
    body: "Lenis smooths native scroll; GSAP's ticker drives it; ScrollTrigger reads it back — every DOM and WebGL animation shares one clock.",
  },
  {
    eyebrow: "02 · Sync",
    title: "DOM and WebGL move together",
    body: "This section is pinned and scrubbed by ScrollTrigger. Its progress is mirrored into the Three.js scene behind it, frame for frame.",
  },
  {
    eyebrow: "03 · Ship",
    title: "Production-ready, not a demo hack",
    body: "Clean teardown, typed hooks, and a context boundary between React and the R3F canvas — built to survive real app growth.",
  },
];

/**
 * Multi-stage pinned scroll sequence.
 *
 * The section is pinned for `end: '+=300%'` of scroll distance while a
 * single scrubbed GSAP timeline cross-fades through `STAGES`. The same
 * timeline's `ScrollTrigger.onUpdate`/`onToggle` write into `scrollState`
 * (see `src/lib/scroll-state.ts`), which `SceneCanvas` reads inside its own
 * `useFrame` — that's the "synchronized changes in the background Three.js
 * scene" this section drives.
 */
export function PinnedShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // `gsap.context` scopes every tween/ScrollTrigger created inside the
    // callback to `section`, so a single `ctx.revert()` on unmount tears
    // all of them down (including selector-based lookups) — the standard
    // GSAP + React cleanup pattern.
    const ctx = gsap.context(() => {
      const stages = stageRefs.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );
      if (stages.length === 0) return;

      // Start with only the first stage visible.
      const [firstStage, ...restStages] = stages;
      if (!firstStage) return;
      gsap.set(restStages, { autoAlpha: 0, y: 40 });
      gsap.set(firstStage, { autoAlpha: 1, y: 0 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            scrollState.showcaseProgress = self.progress;
          },
          onToggle: (self) => {
            scrollState.showcaseActive = self.isActive;
          },
        },
      });

      for (let i = 0; i < stages.length - 1; i += 1) {
        const current = stages[i];
        const next = stages[i + 1];
        if (!current || !next) continue;

        timeline
          .to(current, { autoAlpha: 0, y: -40, duration: 1 })
          .fromTo(
            next,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 1 },
            "<",
          );
      }
    }, section);

    return () => {
      ctx.revert();
      scrollState.showcaseProgress = 0;
      scrollState.showcaseActive = false;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 flex h-screen items-center justify-center overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-3xl px-6">
        {STAGES.map((stage, i) => (
          <div
            key={stage.title}
            ref={(el) => {
              stageRefs.current[i] = el;
            }}
            className="absolute inset-0 flex flex-col items-start justify-center gap-4"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-violet-300/80">
              {stage.eyebrow}
            </span>
            <h3 className="font-serif text-4xl font-semibold text-zinc-50 sm:text-5xl">
              {stage.title}
            </h3>
            <p className="max-w-xl text-lg text-zinc-400">{stage.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
