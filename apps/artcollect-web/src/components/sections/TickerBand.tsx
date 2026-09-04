import { Ticket } from "lucide-react";
import type { ArtEventCard } from "@/lib/events";
import type { ArtworkCard } from "@/lib/artworks";

/**
 * Marquee ticker band (docs/11 Phase 7): a pure CSS animation loop —
 * deliberately NOT scroll-linked (no Lenis, no ScrollTrigger, no rAF of
 * our own; the keyframes run on the compositor). The track is duplicated
 * once and translated by exactly half its width so the loop is seamless;
 * the duplicate copy is aria-hidden so screen readers read the content
 * once. Paused entirely under `prefers-reduced-motion`.
 */
export function TickerBand({
  artworks,
  events,
}: {
  artworks: ArtworkCard[];
  events: ArtEventCard[];
}) {
  const items: { key: string; text: string }[] = [
    ...artworks.map((a) => ({
      key: `work-${a.id}`,
      text: `New on the wall — ${a.title} · ${a.artistName}`,
    })),
    ...events.map((e) => ({
      key: `event-${e.id}`,
      text: e.startsAt
        ? `Opening — ${e.title}`
        : `Announced — ${e.title}`,
    })),
    { key: "cta", text: "Opening tickets on TikoYetu — instant QR, clear prices" },
  ];

  if (items.length === 0) return null;

  return (
    <section aria-label="What's new on ArtCollect" className="relative z-10 border-y-2 border-ink bg-coral">
      <div className="flex items-stretch overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-r-2 border-ink bg-ink px-4 py-3">
          <Ticket size={16} className="text-lime" aria-hidden />
          <span className="font-display text-sm uppercase tracking-wide text-paper">
            Now showing
          </span>
        </div>
        <div className="group relative flex flex-1 items-center overflow-hidden py-3">
          <div className="flex min-w-max animate-[ticker-scroll_36s_linear_infinite] items-center gap-10 group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
            {[false, true].map((isDuplicate) => (
              <ul
                key={isDuplicate ? "ticker-dup" : "ticker"}
                aria-hidden={isDuplicate || undefined}
                className="flex min-w-max items-center gap-10"
              >
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-ink"
                  >
                    <span aria-hidden className="h-2 w-2 rotate-45 bg-ink" />
                    {item.text}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <style>{`@keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
      </div>
    </section>
  );
}
