import Link from "next/link";
import { ArrowRight, CalendarBlank, MapPin } from "@/components/icons";
import { formatEventDate } from "@/lib/format";
import type { ArtEventCard } from "@/lib/events";

/**
 * Upcoming openings band (docs/11 Phase 3 / doc 04 homepage item 4). The
 * ticket CTA hands off to the `(tickets)` route group's event page — an
 * internal `<Link>`, not a cross-domain anchor, now that ArtCollect and
 * TikoYetu are one app. ArtCollect still never computes ticket availability
 * itself (docs/08) — ownership stays split, only the deployment merged —
 * so the button either links to the canonical event page or reads as
 * "tickets announced soon".
 */
export function EventsBand({ events }: { events: ArtEventCard[] }) {
  return (
    <section id="events" className="relative z-10 bg-paper">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            Mark the calendar
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            UPCOMING OPENINGS
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">Nothing on the calendar yet</p>
            <p className="mt-2 text-sm text-ink/60">
              New openings are announced here first — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex flex-col overflow-hidden border-2 border-ink bg-paper shadow-[0_0_0_rgba(22,19,17,1)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(22,19,17,1)] sm:flex-row"
              >
                <div className="relative aspect-[16/10] shrink-0 border-b-2 border-ink bg-paper-deep sm:aspect-auto sm:w-2/5 sm:border-b-0 sm:border-r-2">
                  {event.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                    <img
                      src={event.coverImage}
                      alt={`Cover artwork for ${event.title}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-semibold leading-snug text-ink">{event.title}</h3>
                  <div className="space-y-1.5 text-sm text-ink/60">
                    {event.startsAt && (
                      <p className="flex items-center gap-2">
                        <CalendarBlank size={15} aria-hidden className="text-cobalt" />
                        {formatEventDate(event.startsAt)}
                      </p>
                    )}
                    {event.venue && (
                      <p className="flex items-center gap-2">
                        <MapPin size={15} aria-hidden className="text-cobalt" />
                        {event.venue}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-2">
                    {event.ticketingPath ? (
                      <Link
                        href={event.ticketingPath}
                        className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink"
                      >
                        Get tickets on TikoYetu
                        <ArrowRight size={15} weight="bold" aria-hidden />
                      </Link>
                    ) : (
                      <span className="inline-block border-2 border-ink/30 px-4 py-2 text-sm font-semibold text-ink/50">
                        Tickets announced soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
