"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@artcollect/ui";
import type { AdmitOneTicketProps } from "@/components/ui/admit-one-ticket";

export interface TicketShowcaseProps {
  title: string;
  tierName: string;
  venue?: string | null;
  dates?: string | null;
  /** Shown as the ticket's own "name" line — falls back to the tier when the buyer didn't give one. */
  attendeeName?: string | null;
  /** Special editions (VIP tiers) get a swapped accent palette. */
  foil: boolean;
}

/**
 * Code-split + reduced-motion-aware boundary for the tactile ticket card
 * (docs/11 Phase 6). The static poster renders FIRST (same design as the
 * shader face); the WebGL object mounts only after the showcase
 * intersects the viewport and the main thread is idle, and never at all
 * under reduced motion. All information (event, tier, QR codes below)
 * lives in plain DOM — the object is a tactile flourish, nothing
 * functional is conveyed by it alone.
 */
const AdmitOneTicket = dynamic(
  () => import("@/components/ui/admit-one-ticket").then((m) => m.AdmitOneTicket),
  { ssr: false },
);

function whenIdle(callback: () => void): () => void {
  const scheduler = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof scheduler.requestIdleCallback === "function") {
    const id = scheduler.requestIdleCallback(callback, { timeout: 800 });
    return () => scheduler.cancelIdleCallback?.(id);
  }
  const timeout = window.setTimeout(callback, 250);
  return () => window.clearTimeout(timeout);
}

export function TicketShowcase(props: TicketShowcaseProps) {
  const reduced = usePrefersReducedMotion();
  const regionRef = useRef<HTMLDivElement>(null);
  const [objectOn, setObjectOn] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const region = regionRef.current;
    if (!region) return;

    let cancelIdle: (() => void) | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          cancelIdle = whenIdle(() => setObjectOn(true));
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(region);
    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [reduced]);

  const ticketProps: AdmitOneTicketProps = {
    name: props.attendeeName?.trim() || props.tierName,
    presenter: "TIKOYETU PRESENTS",
    event: props.title,
    venue: props.venue ?? "Venue to be announced",
    dates: props.dates ?? "Date TBA",
    stubText: props.tierName,
    watermark: String(new Date().getFullYear()),
    ...(props.foil
      ? {
          texture: {
            engine: "generative",
            colorBack: "#1f4fd8", // --ac-cobalt — special-edition accent swap
            colorFront: "#f5f1e8",
            colorHighlight: "#a4c639",
            shape: "sphere",
            type: "8x8",
            size: 1.2,
            colorSteps: 5,
            originalColors: true,
            scale: 1.6,
            rotation: 0,
            offsetX: 0,
            offsetY: 0,
            speed: 0.3,
          },
        }
      : {}),
  };

  return (
    <div
      ref={regionRef}
      className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900"
    >
      {/* Static poster fallback — a plain reading of the same info. */}
      <div
        aria-hidden={objectOn && !reduced ? true : undefined}
        className="relative aspect-[1024/448] w-full bg-paper"
      >
        {/* Perforation between body and stub. */}
        <div aria-hidden className="absolute bottom-[4%] left-[76%] top-[4%] w-0 border-l-2 border-dashed border-ink/60" />
        <div className="absolute inset-0 p-[4%]">
          <p className="text-sm font-bold tracking-[0.25em] text-ink">TIKOYETU</p>
          <p className="mt-[2%] font-poster text-[clamp(1.1rem,4.2vw,3rem)] uppercase leading-none text-ink">
            {props.title}
          </p>
          <span className="mt-[3%] inline-block bg-lime px-3 py-1 font-poster text-sm uppercase text-ink">
            {props.tierName}
          </span>
          {props.foil && (
            <span className="absolute right-[24%] top-[10%] rotate-6 bg-gradient-to-r from-lime via-hot-pink to-cobalt bg-clip-text px-1 font-poster text-lg uppercase text-transparent">
              special edition
            </span>
          )}
        </div>
      </div>

      {/* The tactile object, once mounted, takes over the same region. */}
      {objectOn && !reduced && (
        <div className="absolute inset-0 grid place-items-center">
          <AdmitOneTicket {...ticketProps} width={480} tilt={{ maxTilt: 7, glare: 0.14 }} />
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/85 dark:bg-zinc-900/85 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Drag the ticket to tilt it
          </p>
        </div>
      )}
    </div>
  );
}
