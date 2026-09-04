import type { Metadata } from "next";
import Link from "next/link";
import { Gavel, Ticket } from "lucide-react";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { getTimeline, type TimelineEntry, type TimelineStatus } from "@/lib/timeline";
import { cn } from "@/lib/format";

export const metadata: Metadata = {
  title: "Timeline — ArtCollect",
  description: "Every ticketed opening and every art auction, in one chronological feed.",
};

// Auction status and event recency are both computed off the clock;
// render per-request rather than caching a snapshot.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<TimelineStatus, string> = {
  upcoming: "Upcoming",
  past: "Past",
  scheduled: "Auction opens",
  active: "Live now",
  sold: "Sold",
};

const STATUS_CLASS: Record<TimelineStatus, string> = {
  upcoming: "bg-cobalt text-paper",
  past: "bg-ink/50 text-paper",
  scheduled: "border-2 border-ink bg-paper text-ink",
  active: "bg-coral text-ink",
  sold: "bg-ink text-paper",
};

function monthLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", { month: "long", year: "numeric" }).format(new Date(iso));
}

function dayLabel(iso: string): string {
  return new Intl.DateTimeFormat("en-KE", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(iso),
  );
}

function groupByMonth(entries: TimelineEntry[]): [string, TimelineEntry[]][] {
  const groups = new Map<string, TimelineEntry[]>();
  for (const entry of entries) {
    const key = monthLabel(entry.date);
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }
  return [...groups.entries()];
}

/**
 * Timeline (docs/11-style continuation): one chronological rail of
 * ticketed events and art auctions, grouped by month. Dominant style
 * stays the calm Inter index (same register as /artists, /causes) — the
 * feed itself is the content, not a new visual system.
 */
export default async function TimelinePage() {
  const entries = await getTimeline();
  const months = groupByMonth(entries);

  return (
    <main className="min-h-screen bg-paper">
      <FloatingNavbar />
      <header className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-10 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            Openings, tickets, and originals going once
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">TIMELINE</h1>
          <p className="mt-4 max-w-[var(--ac-measure)] text-base text-ink/70">
            Every ticketed opening and every art auction, in the order
            they happen. New auctions launch on the 1st and 15th of each
            month and run at least a week — there are always at least two
            originals live at once.
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl px-[var(--ac-gutter)] py-14">
        {months.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">Nothing on the calendar yet</p>
            <p className="mt-2 text-sm text-ink/60">Events and auctions appear here the moment they&rsquo;re announced.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {months.map(([month, monthEntries]) => (
              <div key={month}>
                <h2 className="font-display text-2xl text-ink">{month.toUpperCase()}</h2>
                <div className="mt-6 space-y-4 border-l-2 border-ink/20 pl-6">
                  {monthEntries.map((entry, i) => (
                    <RevealOnScroll key={`${entry.kind}-${entry.id}`} index={i % 6}>
                      <Link
                        href={entry.href}
                        className="group relative flex gap-4 border-2 border-ink bg-paper p-4 shadow-[0_0_0_rgba(22,19,17,1)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(22,19,17,1)]"
                      >
                        <span
                          className="absolute -left-[29px] top-6 h-3 w-3 rounded-full border-2 border-ink bg-paper"
                          aria-hidden
                        />
                        {entry.image && (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden border-2 border-ink bg-paper-deep sm:h-20 sm:w-20">
                            {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
                            <img
                              src={entry.image}
                              alt={entry.title}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.kind === "event" ? (
                              <Ticket size={14} className="shrink-0 text-cobalt" aria-hidden />
                            ) : (
                              <Gavel size={14} className="shrink-0 text-coral" aria-hidden />
                            )}
                            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                              {dayLabel(entry.date)}
                              {entry.endDate ? ` – ${dayLabel(entry.endDate)}` : ""}
                            </span>
                            <span
                              className={cn(
                                "ml-auto px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                                STATUS_CLASS[entry.status],
                              )}
                            >
                              {STATUS_LABEL[entry.status]}
                            </span>
                          </div>
                          <h3 className="mt-1 truncate text-base font-semibold text-ink">{entry.title}</h3>
                          <p className="mt-0.5 truncate text-sm text-ink/60">{entry.subtitle}</p>
                        </div>
                      </Link>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
