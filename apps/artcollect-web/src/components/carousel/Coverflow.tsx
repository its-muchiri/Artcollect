"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@artcollect/ui";
import { cn } from "@/lib/utils";

export interface CoverflowItem {
  key: string;
  title: string;
  meta: string;
  image: string | null;
  imageAlt: string;
  href: string;
}

/**
 * The journal's own carousel — a CSS-3D coverflow (perspective + rotateY
 * driven from a rAF-throttled scroll handler; transform/opacity only, no
 * WebGL, so it can appear in as many places as the journal shows up
 * without a performance bill). Native scroll-snap underneath: touch,
 * trackpad, and keyboard (focusable region + arrow keys) all work.
 * Reduced motion keeps the same row, just flat — no transforms.
 */
export function Coverflow({
  items,
  label,
  className,
}: {
  items: CoverflowItem[];
  label: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    function update(): void {
      ticking.current = false;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const half = rect.width / 2;

      for (const card of Array.from(el.querySelectorAll<HTMLElement>("[data-coverflow-card]"))) {
        const cardRect = card.getBoundingClientRect();
        const distance = cardRect.left + cardRect.width / 2 - center;
        // -1 (left edge) … 0 (centered) … 1 (right edge), clamped.
        const norm = Math.max(-1, Math.min(1, distance / half));
        const cardEl = card.firstElementChild as HTMLElement | null;
        if (!cardEl) continue;
        cardEl.style.transform = `rotateY(${(norm * -32).toFixed(2)}deg) translateZ(${((1 - Math.abs(norm)) * 46).toFixed(1)}px)`;
        cardEl.style.opacity = (1 - Math.abs(norm) * 0.4).toFixed(2);
      }
    }

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, items]);

  function scrollByCard(direction: 1 | -1) {
    const container = containerRef.current;
    if (!container) return;
    const first = container.querySelector<HTMLElement>("[data-coverflow-card]");
    const step = first ? first.getBoundingClientRect().width + 24 : 320;
    container.scrollBy({ left: direction * step, behavior: reduced ? "auto" : "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label={`Scroll ${label} left`}
          onClick={() => scrollByCard(-1)}
          className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-paper font-display text-base text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          ←
        </button>
        <button
          type="button"
          aria-label={`Scroll ${label} right`}
          onClick={() => scrollByCard(1)}
          className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-paper font-display text-base text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          →
        </button>
      </div>

      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-2 [scrollbar-width:thin]",
          !reduced && "[perspective:1200px]",
        )}
      >
        {items.map((item, i) => (
          <div
            key={item.key}
            data-coverflow-card
            className="w-64 shrink-0 snap-center sm:w-80"
            style={{ rotate: `${i % 2 === 0 ? -0.8 : 0.8}deg` }}
          >
            <a
              href={item.href}
              className="group block border-2 border-ink bg-paper shadow-[4px_4px_0_var(--ac-shadow-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ac-shadow-ink)] will-change-transform"
            >
              <div className="aspect-[16/10] overflow-hidden border-b-2 border-ink bg-paper-deep">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold leading-snug text-ink">{item.title}</h3>
                <p className="mt-1 text-xs text-ink/55">{item.meta}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
