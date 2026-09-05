import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Ticket } from "lucide-react";
import type { ImpactStats } from "@/lib/impact-stats";

/**
 * Homepage impact band (docs/11-style continuation): the three live numbers
 * that answer "what is ArtCollect doing?" plus the donate call-to-action
 * that hands off to TikoYetu's payment rail. Stats are server-fed; this
 * component just lays them out.
 */
export function ImpactStatsBand({ stats }: { stats: ImpactStats }) {
  const items: { icon: typeof Heart; value: number; label: string }[] = [
    { icon: Heart, value: stats.causes, label: "Open causes" },
    { icon: Ticket, value: stats.previousEvents, label: "Events held" },
    { icon: Sparkles, value: stats.supporters, label: "Community supporters" },
  ];

  return (
    <section
      id="impact"
      className="relative z-10 border-y-2 border-ink bg-coral"
      aria-label="ArtCollect impact"
    >
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {items.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="border-2 border-ink bg-paper p-4 text-center shadow-[4px_4px_0_var(--ac-shadow-ink)] sm:p-6"
              >
                <Icon size={20} className="mx-auto text-ink" aria-hidden />
                <p className="mt-2 font-display text-3xl leading-none text-ink sm:text-4xl">
                  {value.toLocaleString()}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/60 sm:text-xs">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              Fund the walls &amp; workshops
            </h2>
            <p className="mt-3 text-sm text-ink/70">
              Every cause publishes what a donation buys and where the money
              went. Checkout runs on the same verified M-Pesa/card flow as our
              tickets.
            </p>
            <Link
              href="/donate"
              className="group mt-6 inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:scale-105 active:scale-95"
            >
              <Heart size={16} aria-hidden />
              Donate to a cause
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
