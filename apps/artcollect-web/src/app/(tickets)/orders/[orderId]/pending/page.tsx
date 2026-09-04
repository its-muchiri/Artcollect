import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Smartphone, XCircle } from "lucide-react";
import { prisma } from "@artcollect/database";
import { Annotation } from "@artcollect/ui";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TicketShowcase } from "@/components/wallet/TicketShowcase";

/**
 * Where the buyer lands right after an M-Pesa STK prompt is sent.
 *
 * There is no redirect-with-transaction-id to verify here the way
 * Flutterwave's flow had — Safaricom never sends the buyer back anywhere;
 * confirmation only ever arrives at `/api/webhooks/mpesa/stk`, which is
 * the sole place tickets actually get issued (see order-fulfillment.ts).
 * This page just reads the order's current status and, while still
 * pending, refreshes itself every few seconds until the webhook (or the
 * buyer cancelling/timing out on their phone) resolves it. Raw ticket QR
 * tokens are never persisted (docs/07) and the webhook — not this page —
 * is what wins the fulfillment race, so they're never available to render
 * here; the confirmation email (lib/email.ts) is what actually delivers
 * the QR codes.
 */
export const dynamic = "force-dynamic";

export default async function OrderPendingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: { select: { title: true } }, items: true },
  });
  if (!order) notFound();

  const firstTierName = order.items[0]?.tierNameSnapshot ?? "Ticket";

  return (
    <>
      {order.status === "pending_payment" && <meta httpEquiv="refresh" content="4" />}
      <Header />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        {order.status === "paid" ? (
          <>
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 />
              <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">Payment confirmed</h1>
            </div>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">Order {order.id}</p>

            {/* The ONE decorative touch the calm checkout gets (docs/11
                Phase 5): a single handwritten confirmation line, on its
                tested-contrast sticky backing. */}
            <div className="mt-4">
              <Annotation tone="lime" rotate={-1.5} className="text-lg">
                you&apos;re going 🎟
              </Annotation>
            </div>

            {order.event && (
              <div className="mt-8">
                <TicketShowcase
                  title={order.event.title}
                  tierName={firstTierName}
                  foil={firstTierName.toUpperCase().includes("VIP")}
                />
              </div>
            )}

            <p className="mt-8 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Your QR ticket{order.items.reduce((n, i) => n + i.quantity, 0) > 1 ? "s were" : " was"} sent
              to <span className="font-medium">{order.buyerEmail}</span>. Show it at the door — each code
              scans once.
            </p>
          </>
        ) : order.status === "payment_failed" ? (
          <>
            <div className="flex items-center gap-3 text-red-600">
              <XCircle />
              <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">Payment failed</h1>
            </div>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              The M-Pesa prompt wasn&apos;t completed — cancelled, timed out, or declined. No charge was
              made.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 text-amber-600">
              <Clock />
              <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">Check your phone</h1>
            </div>
            <p className="mt-3 flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
              <Smartphone size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              An M-Pesa prompt was sent to {order.buyerPhone ?? "your phone"}. Enter your PIN to
              complete payment — this page updates on its own once it&apos;s confirmed.
            </p>
          </>
        )}

        <Link href="/" className="mt-8 inline-block text-sm text-emerald-700 hover:underline">
          Back to events
        </Link>
      </main>
      <Footer />
    </>
  );
}
