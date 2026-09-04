"use client";

import { useEffect, useRef, useState } from "react";
import { Annotation, TornEdge, usePrefersReducedMotion } from "@artcollect/ui";
import dynamic from "next/dynamic";
import { showcaseKindLabel, type ShowcaseItemKind, type ShowcaseSeed } from "@/lib/showcase";
import { cn } from "@/lib/utils";

/**
 * The Main Wall (docs/11-style continuation): the homepage's single
 * showcase for the three main things — art collection, ticketed events,
 * donation causes — as one draggable 3D ring.
 *
 * WebGL discipline per docs/11: the canvas mounts only on tablet-and-up,
 * never under reduced motion, never without WebGL, only once the section
 * has intersected the viewport AND the main thread is idle, and it is
 * told to stop rendering entirely when scrolled off. In every fallback
 * case — no WebGL, reduced motion, below tablet, before the canvas
 * mounts — the same items render as an accessible scroll-snap poster
 * row, so nothing on the wall is ever WebGL-only.
 */
const Carousel3D = dynamic(() => import("@/components/carousel/Carousel3D"), { ssr: false });

const KIND_CHIP_CLASS: Record<ShowcaseItemKind, string> = {
  art: "bg-coral text-ink",
  event: "bg-cobalt text-paper",
  cause: "bg-lime text-ink",
};

function webglSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function whenIdle(callback: () => void): () => void {
  const scheduler = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof scheduler.requestIdleCallback === "function") {
    const id = scheduler.requestIdleCallback(callback, { timeout: 700 });
    return () => scheduler.cancelIdleCallback?.(id);
  }
  const timeout = window.setTimeout(callback, 200);
  return () => window.clearTimeout(timeout);
}

export function ShowcaseCarousel({ items }: { items: ShowcaseSeed[] }) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [webglOn, setWebglOn] = useState(false);
  const [active, setActive] = useState(true);

  // Mount decision (once per mount): tablet+, motion allowed, WebGL present.
  useEffect(() => {
    if (reduced) return;
    if (!webglSupported()) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    let cancelIdle: (() => void) | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          cancelIdle = whenIdle(() => setWebglOn(true));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [reduced]);

  // Render on/off: flip the canvas's frameloop to "never" when scrolled away.
  useEffect(() => {
    if (!webglOn) return;
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), {
      threshold: 0,
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [webglOn]);

  if (items.length === 0) return null;

  return (
    <section id="collection" ref={sectionRef} className="relative z-10 bg-ink">
      <TornEdge className="h-4 w-full text-lime" seed={61} intensity={9} />

      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">
              Art on the wall · nights on the calendar · causes behind the paint
            </p>
            <h2 className="mt-3 font-display text-4xl text-paper sm:text-5xl">THE MAIN WALL</h2>
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-hidden="true">
              {(Object.keys(KIND_CHIP_CLASS) as ShowcaseItemKind[]).map((kind) => (
                <span
                  key={kind}
                  className={cn("px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", KIND_CHIP_CLASS[kind])}
                >
                  {showcaseKindLabel(kind)}
                </span>
              ))}
            </div>
          </div>

          {webglOn && !reduced && (
            <div>
              <Annotation tone="neon" rotate={-1.5}>
                drag to spin the wall — tap a card to step inside →
              </Annotation>
            </div>
          )}
        </div>

        {/* Screen-reader mirror: the 3D ring is visual-only, so every item
            is also a real link in document order. */}
        {webglOn && !reduced ? (
          <ul className="sr-only">
            {items.map((item) => (
              <li key={item.key}>
                <a href={item.href}>{`${showcaseKindLabel(item.kind)} — ${item.title}`}</a>
              </li>
            ))}
          </ul>
        ) : null}

        {webglOn && !reduced ? (
          <div ref={stageRef} className="relative h-[420px] w-full">
            <Carousel3D items={items} active={active} />
          </div>
        ) : (
          /* Poster fallback: same items, native scroll, fully accessible. */
          <div
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 pt-2 [scrollbar-width:thin]"
            role="region"
            aria-label="Main wall — art, events, and causes"
            tabIndex={0}
          >
            {items.map((item, i) => (
              <a
                key={item.key}
                href={item.href}
                className="group w-64 shrink-0 snap-center border-2 border-paper bg-paper sm:w-72"
                style={{ rotate: `${i % 2 === 0 ? -1.4 : 1.2}deg` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-paper-deep">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                    <img src={item.image} alt={item.imageAlt} loading="lazy" className="h-full w-full object-cover" />
                  )}
                  <span
                    className={cn(
                      "absolute left-2 top-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      KIND_CHIP_CLASS[item.kind],
                    )}
                  >
                    {showcaseKindLabel(item.kind)}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink/60">{item.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <TornEdge className="h-4 w-full text-lime" seed={67} intensity={9} />
    </section>
  );
}
