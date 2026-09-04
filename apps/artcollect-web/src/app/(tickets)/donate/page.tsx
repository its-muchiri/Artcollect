import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { listPublishedCauses } from "@/lib/donations";
import { formatKes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Donate to art causes — TikoYetu",
  description: "Fund community murals, print workshops, and materials for African art programs. Clear goals, published receipts.",
};

// Progress changes with every donation; render per-request.
export const dynamic = "force-dynamic";

/**
 * The causes index — a calm surface like the rest of TikoYetu (docs/11):
 * plain cards, Inter-set numbers, one progress bar per cause. Discovery
 * also happens on ArtCollect's editorial causes page, which links here.
 */
export default async function DonatePage() {
  const causes = await listPublishedCauses();

  return (
    <>
      <Header />

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center">
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            Small amounts, public receipts
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Fund the walls and workshops
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
            Every cause publishes what a donation buys and where the money
            went. Checkout is the same secure M-Pesa/card flow as our
            tickets — verified before anything is marked received.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          {causes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-16 text-center">
              <p className="font-display text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                No open causes right now
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                New causes are announced here first — check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {causes.map((cause) => (
                <Link
                  key={cause.id}
                  href={`/donate/${cause.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-shadow hover:shadow-lg hover:shadow-zinc-200/60 dark:hover:shadow-black/40"
                >
                  <div className="relative aspect-[16/9] bg-zinc-100">
                    {cause.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                      <img
                        src={cause.coverImage}
                        alt={cause.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {cause.title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{cause.summary}</p>
                    <p className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                      <MapPin size={13} aria-hidden />
                      {cause.country ?? "East Africa"} · by {cause.organiserName}
                    </p>

                    <div className="mt-auto pt-2">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatKes(cause.raisedMinor, cause.currency)}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          of {formatKes(cause.goalMinor, cause.currency)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${cause.progressPercent}%` }}
                          role="progressbar"
                          aria-valuenow={cause.progressPercent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${cause.title} funding progress`}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{cause.progressPercent}% funded</span>
                        <span>
                          {cause.donorCount} {cause.donorCount === 1 ? "supporter" : "supporters"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
