"use client";

import type { LucideIcon } from "lucide-react";
import { Layers, MousePointerClick, Sparkles as SparklesIcon, Waves, Zap } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface BentoItem {
  title: string;
  description: string;
  icon: LucideIcon;
  className: string;
}

const ITEMS: BentoItem[] = [
  {
    title: "Lenis-driven scroll",
    description: "Every wheel event resolves through one cubic-bezier eased instance.",
    icon: Waves,
    className: "sm:col-span-2 sm:row-span-2",
  },
  {
    title: "ScrollTrigger pins",
    description: "Pinned, scrubbed sections stay locked to the same clock.",
    icon: Layers,
    className: "sm:col-span-1",
  },
  {
    title: "R3F background",
    description: "A live WebGL layer reads scroll depth every frame.",
    icon: SparklesIcon,
    className: "sm:col-span-1",
  },
  {
    title: "Framer micro-interactions",
    description: "Hover, tap, and mount transitions — decoupled from scroll.",
    icon: MousePointerClick,
    className: "sm:col-span-1",
  },
  {
    title: "Zero-jank teardown",
    description: "Every ticker, listener, and instance is cleanly disposed.",
    icon: Zap,
    className: "sm:col-span-1",
  },
];

/**
 * 21st.dev-style bento grid: uneven card sizes, glass surfaces, and a
 * cursor-follow spotlight per card (handled inside the shared
 * `SpotlightCard` primitive). Purely a Framer Motion + CSS grid
 * composition — no GSAP.
 */
export function BentoGrid() {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24">
      <div className="mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          The Stack
        </span>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-50 sm:text-4xl">
          Built from four moving parts
        </h2>
        <p className="mt-2 max-w-xl text-zinc-400">
          Each piece owns exactly one concern, so nothing fights over the
          same frame.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:[grid-auto-rows:12rem]">
        {ITEMS.map(({ title, description, icon: Icon, className }) => (
          <SpotlightCard key={title} className={className}>
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="inline-flex w-fit items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2.5 text-violet-300">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-zinc-50">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
