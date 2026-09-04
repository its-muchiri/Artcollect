"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Annotation, TapePiece, StapleMark, TornEdge, HighlighterMark } from "@artcollect/ui";
import { gsap } from "@/lib/gsap";
import { heroState } from "@/lib/hero-state";
import { cn } from "@/lib/utils";

/**
 * Hero-scoped WebGL diorama, loaded only when it can actually be used:
 * never on the server (poster renders first), never under reduced motion,
 * never below the tablet breakpoint (docs/11 non-negotiables), and only
 * after the hero intersects the viewport AND the main thread is idle.
 */
const CollageHeroCanvas = dynamic(() => import("@/components/canvas/CollageHeroCanvas"), {
  ssr: false,
});

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
    const id = scheduler.requestIdleCallback(callback, { timeout: 600 });
    return () => scheduler.cancelIdleCallback?.(id);
  }
  const timeout = window.setTimeout(callback, 180);
  return () => window.clearTimeout(timeout);
}

/**
 * The DOM collage — also the SSR poster. Cutouts are positioned at their
 * ASSEMBLED spots in CSS (so no-JS, reduced-motion, and mobile all show
 * the finished wall); the GSAP scrub below offsets them off-screen via
 * `transform` and assembles them on scroll, which means every state is a
 * transform away from the same painted poster.
 */
interface HeroCutout {
  src: string;
  className: string;
  rotate: number;
  clipPath: string;
  tape?: boolean;
  staple?: boolean;
  from: { xPercent: number; yPercent: number; rotate: number };
}

const CUTOUTS: HeroCutout[] = [
  {
    src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=640&q=70",
    className: "right-[4%] top-[7%] w-[24%] max-w-64",
    rotate: 3.5,
    clipPath: "polygon(0 2%, 96% 0, 100% 97%, 3% 100%)",
    tape: true,
    from: { xPercent: 130, yPercent: -150, rotate: 26 },
  },
  {
    src: "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=640&q=70",
    className: "left-[3%] bottom-[13%] w-[26%] max-w-72",
    rotate: -4,
    clipPath: "polygon(1% 0, 100% 3%, 98% 100%, 0 96%)",
    tape: false,
    from: { xPercent: -145, yPercent: 130, rotate: -30 },
  },
  {
    src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=640&q=70",
    className: "right-[9%] bottom-[9%] w-[17%] max-w-48",
    rotate: -7,
    clipPath: "polygon(0 0, 100% 2%, 97% 98%, 2% 100%)",
    staple: true,
    from: { xPercent: 160, yPercent: 150, rotate: 34 },
  },
  {
    src: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=640&q=70",
    className: "left-[9%] top-[9%] w-[20%] max-w-56",
    rotate: 5.5,
    clipPath: "polygon(2% 1%, 98% 0, 100% 100%, 0 97%)",
    tape: true,
    from: { xPercent: -135, yPercent: -155, rotate: -24 },
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export function CollageHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [canvasOn, setCanvasOn] = useState(false);

  // Decide ONCE per mount whether WebGL can ever mount here, then gate on
  // viewport intersection + idle so the very first paint is pure DOM.
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
          cancelIdle = whenIdle(() => setCanvasOn(true));
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

  // Pointer parallax source: window-level, normalized to the section's
  // center, read by the canvas's useFrame through `heroState`.
  useEffect(() => {
    if (reduced) return;
    const onMove = (event: PointerEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const bounds = section.getBoundingClientRect();
      heroState.pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      heroState.pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      heroState.pointerX = 0;
      heroState.pointerY = 0;
    };
  }, [reduced]);

  // THE pinned/scrubbed centerpiece of this page (docs/11 Phase 2): a
  // scrubbed timeline flying the cutouts in from off-screen edges into
  // the assembled poster. Tablet breakpoint and reduced-motion only; one
  // centerpiece per page, transform/opacity only.
  useEffect(() => {
    if (reduced) {
      heroState.assembleProgress = 1; // canvas (if any) reads assembled
      return;
    }

    const matchMedia = gsap.matchMedia();
    matchMedia.add("(min-width: 1024px)", () => {
      const section = sectionRef.current;
      if (!section) return;

      const ctx = gsap.context(() => {
        const cutouts = gsap.utils.toArray<HTMLElement>(".hero-cutout");
        if (cutouts.length === 0) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=120%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              heroState.assembleProgress = self.progress;
            },
          },
        });

        cutouts.forEach((el, i) => {
          const from = CUTOUTS[i]?.from ?? { xPercent: 120, yPercent: -120, rotate: 20 };
          timeline.fromTo(
            el,
            { xPercent: from.xPercent, yPercent: from.yPercent, rotate: from.rotate, autoAlpha: 0 },
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power2.out",
            },
            i * 0.14,
          );
        });

        // The headline settles last, like the final press of the print.
        timeline.fromTo(
          ".hero-copy",
          { scale: 0.985 },
          { scale: 1, duration: 0.6, ease: "power1.out" },
          0.55,
        );
      }, section);

      return () => {
        ctx.revert();
        heroState.assembleProgress = 1;
      };
    });

    return () => matchMedia.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-paper"
    >
      {/* WebGL diorama — mounts above the DOM poster, only when allowed. */}
      {canvasOn && (
        <div aria-hidden className="absolute inset-0 z-0">
          <CollageHeroCanvas />
        </div>
      )}

      {/* DOM collage poster (SSR/fallback/assembled state). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden sm:block">
        {CUTOUTS.map((cutout, i) => (
          <div key={cutout.src} className={cn("hero-cutout absolute", cutout.className)}>
            <div
              className="relative h-auto w-full shadow-[0_10px_30px_rgba(22,19,17,0.18)]"
              style={{ rotate: `${cutout.rotate}deg` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
              <img
                src={cutout.src}
                alt=""
                className="block w-full bg-paper-deep object-cover"
                style={{ clipPath: cutout.clipPath, aspectRatio: i % 2 === 0 ? "3 / 4" : "4 / 3" }}
              />
              {cutout.tape && <TapePiece className="-top-3 left-1/2 w-20 -translate-x-1/2" angle={i % 2 === 0 ? -6 : 5} />}
              {cutout.staple && <StapleMark className="absolute -top-2 left-3" />}
            </div>
          </div>
        ))}
      </div>

      {/* Copy block */}
      <motion.div
        variants={containerVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
        className="hero-copy relative z-20 mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-32"
      >
        <motion.p
          variants={itemVariants}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt"
        >
          Nairobi · East African contemporary art
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] text-ink sm:text-7xl lg:text-8xl"
        >
          Collect the work you{" "}
          <HighlighterMark>
            <span className="font-display">can&apos;t stop</span>
          </HighlighterMark>{" "}
          thinking about
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-[var(--ac-measure)] text-lg text-ink/70"
        >
          ArtCollect is the home of East African collage, print, and photography —
          originals and small editions from artists you can actually meet, with
          opening-night tickets handed off to TikoYetu.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#collection"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-coral hover:text-ink"
          >
            Browse the works
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="#artists"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-7 py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
          >
            Meet the artists
          </a>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12">
          <Annotation tone="marker" withTape>
            new drops every first Friday →
          </Annotation>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-16 left-1/2 z-20 hidden -translate-x-1/2 lg:block">
        <Annotation tone="ink" rotate={-1.5}>
          keep scrolling — the wall assembles itself
        </Annotation>
      </div>

      <TornEdge className="absolute bottom-0 left-0 z-20 h-6 w-full text-coral" seed={11} />
    </section>
  );
}
