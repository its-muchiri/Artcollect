import Link from "next/link";
import { MapPin } from "lucide-react";
import type { EventSummary } from "@/lib/ticketing-events";
import { PixelAvailabilityMark } from "@/components/pixel/PixelAvailabilityMark";
import { formatEventDate, formatKes } from "@/lib/format";

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Tickets available",
  low: "Selling fast",
  sold_out: "Sold out",
  closed: "Sales closed",
};

const AVAILABILITY_CLASS: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700",
  low: "bg-amber-50 text-amber-700",
  sold_out: "bg-zinc-100 text-zinc-500 dark:text-zinc-400",
  closed: "bg-zinc-100 text-zinc-500 dark:text-zinc-400",
};

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-shadow hover:shadow-lg hover:shadow-zinc-200/60 dark:hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {event.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_CLASS[event.availability]}`}
        >
          {AVAILABILITY_LABEL[event.availability]}
        </span>
        {/* Decorative pixel reinforcement — the text chip above carries the
            status accessibly (docs/11 non-negotiables). */}
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 dark:bg-zinc-900/85 shadow-sm">
          <PixelAvailabilityMark availability={event.availability} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          {event.startsAt ? formatEventDate(event.startsAt) : "Date to be announced"}
        </span>
        <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">{event.title}</h3>
        <p className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <MapPin size={14} /> {event.venue}
          {event.city ? `, ${event.city}` : ""}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">From</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {formatKes(event.lowestPriceMinor, event.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
