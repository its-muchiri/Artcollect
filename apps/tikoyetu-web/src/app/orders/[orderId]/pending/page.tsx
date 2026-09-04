import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@artcollect/database";
import { Annotation } from "@artcollect/ui";
import { verifyTransaction } from "@/lib/flutterwave";
import { finalizeOrderPayment, type IssuedTicket } from "@/lib/order-fulfillment";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TicketShowcase } from "@/components/wallet/TicketShowcase";

/**
 * Where the buyer lands after Flutterwave's hosted checkout.
 *
 * This is deliberately NOT treated as proof of payment on its own — per
 * docs/07, a client redirect never marks an order paid. Instead, if
 * Flutterwave's redirect included a `transaction_id`, this page uses it to
 * make its own server-to-server verification call and runs the same
 * idempotent `finalizeOrderPayment` the webhook uses. Whichever of the two
 * (this page or the webhook) gets there first is the one that actually
 * gets the raw QR tokens back — see order-fulfillment.ts.
 */
export const dynamic = "force-dynamic";

export default async function OrderPendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ transaction_id?: string; status?: string }>;
}) {
  const { orderId } = await params;
  const { transaction_id: transactionId, status: flwStatus } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: { select: { title: true } } },
  });
  if (!order) notFound();

  let tickets: IssuedTicket[] = [];
  let finalStatus: string = order.status;

  if (order.status === "pending_payment" && transactionId && flwStatus !== "cancelled") {
    try {
      const verified = await verifyTransaction(transactionId);
      if (verified.txRef === order.id) {
        const result = await finalizeOrderPayment(order.id, verified);
        tickets = result.tickets;
        finalStatus = result.status === "already_paid" ? "paid" : result.status;
      }
    } catch {
      // Re-verification failed or Flutterwave was unreachable just now —
      // fall through to the "still confirming" state below. The webhook
      // remains the authoritative path regardless of what happens here.
    }
  } else if (order.status === "paid") {
    finalStatus = "paid";
  }

  const withTokens = tickets.filter(
    (ticket): ticket is IssuedTicket & { token: string } => ticket.token !== null,
  );
  const qrTickets = await Promise.all(
    withTokens.map(async (ticket) => ({
      ...ticket,
      qr: await QRCode.toDataURL(ticket.token, { margin: 1, width: 240 }),
    })),
  );

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        {finalStatus === "paid" ? (
          <>
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 />
              <h1 className="font-display text-2xl font-bold text-zinc-900">Payment confirmed</h1>
            </div>
            <p className="mt-2 text-zinc-500">Order {order.id}</p>

            {/* The ONE decorative touch the calm checkout gets (docs/11
                Phase 5): a single handwritten confirmation line, on its
                tested-contrast sticky backing. */}
            <div className="mt-4">
              <Annotation tone="lime" rotate={-1.5} className="text-lg">
                you&apos;re going 🎟
              </Annotation>
            </div>

            {/* The tactile ticket object (docs/11 Phase 6) — a flourish on
                top of the functional wallet; dynamically imported,
                intersection-gated, poster-first, and skipped entirely
                under reduced motion. Special editions (VIP tiers) get the
                holographic foil skin. */}
            {qrTickets.length > 0 && order.event && (
              <div className="mt-8">
                <TicketShowcase
                  title={order.event.title}
                  tierName={qrTickets[0]?.tierName ?? "Ticket"}
                  foil={(qrTickets[0]?.tierName ?? "").toUpperCase().includes("VIP")}
                />
              </div>
            )}

            {qrTickets.length > 0 ? (
              <div className="mt-8 space-y-6">
                {qrTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-zinc-200 p-6 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element -- client-generated data: URI, not an optimizable remote image */}
                    <img src={ticket.qr} alt="Ticket QR code" className="mx-auto h-48 w-48" />
                    <p className="mt-3 text-sm font-medium text-zinc-900">{ticket.tierName}</p>
                    <p className="text-xs text-zinc-400">Ticket {ticket.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Your tickets are confirmed, but this page can&apos;t display their QR codes
                right now — email delivery isn&apos;t wired up yet in this build. Contact
                support with order <span className="font-mono">{order.id}</span>.
              </p>
            )}
          </>
        ) : finalStatus === "payment_failed" ? (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle />
            <h1 className="font-display text-2xl font-bold text-zinc-900">Payment failed</h1>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-amber-600">
            <Clock />
            <h1 className="font-display text-2xl font-bold text-zinc-900">Confirming your payment…</h1>
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
