"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, usePrefersReducedMotion } from "@artcollect/ui";
import { Annotation, TapePiece } from "@artcollect/ui";
import { cn } from "@/lib/format";

export interface GalleryPiece {
  title: string;
  caption: string;
  image: string;
  alt: string;
}

export interface HorizontalGalleryProps {
  pieces: GalleryPiece[];
  eyebrow: string;
  title: string;
  /** One handwritten note over the track (the section's single secondary accent). */
  note?: string;
  className?: string;
}

/**
 * Pinned horizontal scroll track — the `containerAnimation` technique
 * (docs/11 foundation) relocated from the retired homepage demo to the
 * artist-portfolio "studio floor" photo dump (docs/11 Phase 7).
 *
 * The section pins for the width of the track's overflow; a single scrub
 * tween translates the track while each image gets a parallax drift via a
 * nested ScrollTrigger whose `containerAnimation` points at the main
 * tween — that's what lets nested triggers read "progress through the
 * track" instead of "progress through the page".
 *
 * Reduced motion: the track renders as a plain scrollable row (fully
 * usable, nothing pinned). Below the tablet breakpoint: same — this is
 * the page's ONE pinned centerpiece and it is disabled there per the
 * docs/11 non-negotiables.
 */
export function HorizontalGallery({ pieces, eyebrow, title, note, className }: HorizontalGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const scrollDistance = () => track.scrollWidth - section.clientWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -scrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${scrollDistance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      imageRefs.current.forEach((image) => {
        if (!image) return;
        gsap.to(image, {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: image,
            containerAnimation: horizontalTween,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        });
      });

      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, []);

  if (pieces.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={cn("relative z-10 overflow-hidden border-y-2 border-ink bg-ink", className)}
    >
      <div className="lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="px-[var(--ac-gutter)] pt-14 lg:absolute lg:left-0 lg:top-10 lg:z-10 lg:pt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl text-paper sm:text-5xl">{title}</h2>
          {note && (
            <div className="mt-5 hidden lg:block">
              <Annotation tone="neon">{note}</Annotation>
            </div>
          )}
        </div>

        {/* Scroll container: native overflow-x for reduced motion and
            below the tablet breakpoint; clipped at lg+ where the pin's
            scrub drives the track instead. */}
        <div
          className={cn("w-full", reduced ? "overflow-x-auto" : "overflow-x-auto lg:overflow-hidden")}
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-8 px-[var(--ac-gutter)] py-10 lg:pt-24"
          >
            {pieces.map((piece, i) => (
              <figure
                key={piece.title}
                className={cn(
                  "relative w-72 shrink-0 border-2 border-paper bg-paper p-2 shadow-[5px_5px_0_rgba(245,241,232,0.35)] sm:w-96",
                )}
                style={{ rotate: `${i % 2 === 0 ? -1.6 : 1.8}deg` }}
              >
                <div
                  ref={(el) => {
                    imageRefs.current[i] = el;
                  }}
                  className="relative aspect-[4/3] w-[112%] overflow-hidden"
                  style={{ marginLeft: "-6%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
                  <img src={piece.image} alt={piece.alt} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <figcaption className="flex items-baseline justify-between gap-2 px-1 pb-1 pt-3">
                  <span className="text-sm font-semibold text-ink">{piece.title}</span>
                  <span className="text-xs text-ink/60">{piece.caption}</span>
                </figcaption>
                <TapePiece className="-top-3 left-1/2 w-20 -translate-x-1/2" angle={i % 2 === 0 ? -5 : 3} tone={i % 3 === 0 ? "manila" : "clear"} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
