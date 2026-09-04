import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@artcollect/database";
import { Annotation } from "@artcollect/ui";
import { verifyTransaction } from "@/lib/flutterwave";
import { finalizeDonationPayment } from "@/lib/donation-fulfillment";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatKes } from "@/lib/format";

/**
 * Where the donor lands after Flutterwave's hosted checkout — the
 * donation twin of the order pending page (docs/07): the redirect is
 * never trusted on its own; the transaction is re-verified server-to-
 * server and finalized idempotently (the webhook may have won the race).
 */
export const dynamic = "force-dynamic";

export default async function DonationPendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ donationId: string }>;
  searchParams: Promise<{ transaction_id?: string; status?: string }>;
}) {
  const { donationId } = await params;
  const { transaction_id: transactionId, status: flwStatus } = await searchParams;

  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { cause: { select: { slug: true, title: true } } },
  });
  if (!donation) notFound();

  let finalStatus: string = donation.status;

  if (donation.status === "pending" && transactionId && flwStatus !== "cancelled") {
    try {
      const verified = await verifyTransaction(transactionId);
      if (verified.txRef === `don_${donation.id}`) {
        const result = await finalizeDonationPayment(donation.id, verified);
        finalStatus = result.status === "already_succeeded" ? "succeeded" : result.status;
      }
    } catch {
      // Re-verification failed or Flutterwave was unreachable just now —
      // fall through to the "still confirming" state. The webhook remains
      // the authoritative path.
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        {finalStatus === "succeeded" ? (
          <>
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 />
              <h1 className="font-display text-2xl font-bold text-zinc-900">
                Thank you — gift received
              </h1>
            </div>

            {/* The ONE decorative touch this surface gets (docs/11): a
                single handwritten line on its tested-contrast backing. */}
            <div className="mt-4">
              <Annotation tone="lime" rotate={-1.5} className="text-lg">
                asante — your shillings go straight to the wall 🧡
              </Annotation>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
              <p className="text-sm text-zinc-500">Your gift</p>
              <p className="mt-1 font-display text-2xl font-bold text-zinc-900">
                {formatKes(Number(donation.amountMinor), donation.currency)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                to <Link href={`/donate/${donation.cause.slug}`} className="text-emerald-700 hover:underline">{donation.cause.title}</Link>
              </p>
              <p className="mt-3 text-xs text-zinc-400">
                A receipt is on its way to {donation.donorEmail}.
              </p>
            </div>

            <Link
              href="/donate"
              className="mt-8 inline-block text-sm text-emerald-700 hover:underline"
            >
              See what else needs funding
            </Link>
          </>
        ) : finalStatus === "failed" ? (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle />
            <h1 className="font-display text-2xl font-bold text-zinc-900">
              Payment didn&apos;t go through
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-600">
            <Clock />
            <h1 className="font-display text-2xl font-bold text-zinc-900">
              Confirming your donation…
            </h1>
          </div>
        )}

        <Link href="/" className="mt-8 inline-block text-sm text-emerald-700 hover:underline">
          Back to events
        </Link>
      </main>
      <Footer />
    </>
  );
}
