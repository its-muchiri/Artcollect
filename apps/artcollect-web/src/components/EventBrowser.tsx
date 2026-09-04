"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { EventSummary } from "@/lib/ticketing-events";
import { EventCard } from "@/components/EventCard";

/** Client-side search over an already-fetched event list, by title/venue/city/organiser. */
export function EventBrowser({ events }: { events: EventSummary[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) =>
      [event.title, event.venue, event.city, event.organiser]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [events, query]);

  return (
    <div id="events" className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Happening soon
          </span>
          <h2 className="mt-1 font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Find your next event
          </h2>
        </div>

        <label className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event, venue, or city"
            className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition-colors focus:border-emerald-500"
          />
        </label>
      </div>

      {results.length === 0 ? (
        <p className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {events.length === 0
            ? "No events on sale right now — check back soon."
            : `No events match “${query}” yet.`}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
