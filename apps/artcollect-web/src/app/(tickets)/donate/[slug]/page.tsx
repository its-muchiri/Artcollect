import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationForm } from "@/components/DonationForm";
import { initiateDonationAction } from "@/lib/actions/donation-actions";
import { getCauseBySlug } from "@/lib/donations";
import { formatEventDate, formatKes } from "@/lib/format";

// Progress and the supporters list change with real activity.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cause = await getCauseBySlug(slug);
  if (!cause) return { title: "Cause not found — TikoYetu" };
  return { title: `${cause.title} — donate — TikoYetu`, description: cause.summary };
}

/**
 * Cause detail + donation checkout. Calm TikoYetu surface (docs/11): the
 * story reads in plain Inter; the form re-validated server-side; the one
 * handwritten touch stays on the thank-you page, not here.
 */
export default async function CausePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cause = await getCauseBySlug(slug);
  if (!cause) notFound();

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Link href="/donate" className="text-sm text-emerald-700 hover:underline">
          ← All causes
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              {cause.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                <img
                  src={cause.coverImage}
                  alt={cause.title}
                  className="h-72 w-full object-cover sm:h-96"
                />
              )}
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={15} aria-hidden className="text-emerald-600" />
                {cause.country ?? "East Africa"}
              </span>
              <span>·</span>
              <span>Run by {cause.organiserName}</span>
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold text-zinc-900 sm:text-4xl">
              {cause.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-zinc-600">{cause.summary}</p>

            <div className="mt-8 space-y-4">
              {cause.story.split("\n\n").map((block, i) => {
                if (block.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="pt-2 font-display text-xl font-bold text-zinc-900"
                    >
                      {block.slice(3)}
                    </h2>
                  );
                }
                if (block.startsWith("- ")) {
                  return (
                    <ul key={i} className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
                      {block.split("\n").map((item, j) => (
                        <li key={j}>{item.slice(2)}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="max-w-2xl leading-relaxed text-zinc-600">
                    {block}
                  </p>
                );
              })}
            </div>

            {cause.supporters.length > 0 && (
              <section className="mt-12 border-t border-zinc-200 pt-8">
                <h2 className="font-display text-xl font-bold text-zinc-900">
                  Recent supporters
                </h2>
                <ul className="mt-4 space-y-3">
                  {cause.supporters.map((supporter, i) => (
                    <li
                      key={`${supporter.displayName}-${i}`}
                      className="rounded-2xl border border-zinc-200 bg-white p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold text-zinc-900">
                          {supporter.displayName}
                        </span>
                        <span className="text-sm font-semibold text-emerald-700">
                          {formatKes(supporter.amountMinor, cause.currency)}
                        </span>
                      </div>
                      {supporter.message && (
                        <p className="mt-1 text-sm text-zinc-500">“{supporter.message}”</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatEventDate(supporter.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-display text-2xl font-bold text-zinc-900">
                  {formatKes(cause.raisedMinor, cause.currency)}
                </span>
                <span className="text-zinc-500">
                  of {formatKes(cause.goalMinor, cause.currency)}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
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
              <p className="mt-2 text-xs text-zinc-500">
                {cause.progressPercent}% funded · {cause.donorCount}{" "}
                {cause.donorCount === 1 ? "supporter" : "supporters"}
              </p>
            </div>

            <div className="mt-4">
              <DonationForm
                causeId={cause.id}
                causeTitle={cause.title}
                currency={cause.currency}
                action={initiateDonationAction}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
