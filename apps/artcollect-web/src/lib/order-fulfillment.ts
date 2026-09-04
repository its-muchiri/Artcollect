import "server-only";
import { prisma, type PaymentProvider } from "@artcollect/database";
import type { VerifiedTransaction } from "@/lib/flutterwave";
import { generateTicketToken } from "@/lib/qr";
import { sendTicketEmail } from "@/lib/ticket-email";

export interface IssuedTicket {
  id: string;
  tierName: string;
  /** The raw bearer token — present only in the response that actually
   *  issued this ticket (see module doc below), null otherwise. */
  token: string | null;
}

export type FulfillmentStatus = "paid" | "already_paid" | "payment_failed" | "amount_mismatch" | "not_found";

export interface FulfillmentResult {
  status: FulfillmentStatus;
  tickets: IssuedTicket[];
}

function mapPaymentProvider(paymentType: string | undefined): PaymentProvider {
  return paymentType?.toLowerCase().includes("mpesa") ? "mpesa" : "card";
}

/**
 * Finalizes a paid order: marks it `paid`, records the `Payment`, issues one
 * `Ticket` per unit ordered, and releases the order's inventory holds.
 *
 * Two independent callers can reach this for the same order — Flutterwave's
 * webhook (the trust anchor: this is what a client redirect alone must
 * never be allowed to do, per docs/07) and the buyer's own return-from-checkout
 * page (`/orders/[orderId]/pending`, which re-verifies the transaction
 * itself before calling this, rather than trusting the redirect). Both are
 * safe to call concurrently or repeatedly:
 *
 *   - `Payment.providerRef` is unique, so a second attempt to record the
 *     same provider transaction is a no-op (`upsert`).
 *   - The order's status is re-read *inside* the transaction immediately
 *     before mutating it, so only the caller that actually wins the race
 *     transitions it out of `pending_payment` and issues tickets.
 *
 * Raw ticket tokens exist only in the return value of whichever call
 * actually created them — they are never persisted (only their hash is,
 * on `Ticket.qrTokenHash`) and can't be recovered afterwards. Practically,
 * that means the buyer's return-page request is what shows them their QR
 * codes; if the webhook wins the race, tokens are only recoverable if this
 * app has ticket resend wired up. That's a real limitation, not a
 * corner-cut: the security requirement (opaque, hash-only storage) is what
 * makes token recovery impossible after the fact. See docs/09's "ticket
 * resend" v1.1 item and packages/database's lack of an email provider —
 * there's nowhere for a resend to actually send to yet.
 */
export async function finalizeOrderPayment(
  orderId: string,
  verified: VerifiedTransaction,
): Promise<FulfillmentResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      tickets: true,
      event: { select: { title: true, venue: true, startsAt: true } },
    },
  });
  if (!order) return { status: "not_found", tickets: [] };

  if (order.status === "paid") {
    return {
      status: "already_paid",
      tickets: order.tickets.map((ticket) => ({ id: ticket.id, tierName: "", token: null })),
    };
  }
  if (order.status !== "pending_payment") {
    return { status: "already_paid", tickets: [] };
  }
  if (verified.status !== "successful") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "payment_failed" } });
    return { status: "payment_failed", tickets: [] };
  }
  if (verified.amountMinor !== Number(order.totalMinor) || verified.currency !== order.currency) {
    return { status: "amount_mismatch", tickets: [] };
  }

  const issued: IssuedTicket[] = [];

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUniqueOrThrow({ where: { id: order.id } });
    if (fresh.status !== "pending_payment") return; // the other caller already won this race

    await tx.payment.upsert({
      where: { providerRef: verified.providerRef },
      update: {},
      create: {
        orderId: order.id,
        provider: mapPaymentProvider(verified.paymentType),
        providerRef: verified.providerRef,
        status: "succeeded",
        amountMinor: order.totalMinor,
        currency: order.currency,
        webhookEventId: verified.providerRef,
      },
    });

    await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i += 1) {
        const { token, tokenHash } = generateTicketToken();
        const ticket = await tx.ticket.create({
          data: { orderId: order.id, eventId: order.eventId, tierId: item.tierId, qrTokenHash: tokenHash },
        });
        issued.push({ id: ticket.id, tierName: item.tierNameSnapshot, token });
      }
    }

    await tx.inventoryHold.deleteMany({ where: { orderId: order.id } });
  });

  if (issued.length > 0) {
    // Whoever wins this race is the only caller that ever sees the raw
    // tokens (docs/07) — so this is the one place a confirmation email can
    // be sent from. Never lets a delivery failure undo a successful,
    // already-committed payment: caught and logged, not thrown.
    try {
      await sendTicketEmail({
        to: order.buyerEmail,
        buyerName: order.buyerName,
        eventTitle: order.event?.title ?? "Your event",
        eventVenue: order.event?.venue ?? null,
        eventStartsAt: order.event?.startsAt ?? null,
        tickets: issued
          .filter((t): t is IssuedTicket & { token: string } => t.token !== null)
          .map((t) => ({ id: t.id, tierName: t.tierName, token: t.token })),
      });
    } catch (error) {
      console.error(`Failed to send ticket email for order ${order.id}:`, error);
    }
    return { status: "paid", tickets: issued };
  }

  // Lost the race: the other caller issued the tickets. Report the order
  // as paid with a count, but no tokens to show.
  const finalOrder = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { tickets: true },
  });
  return {
    status: "paid",
    tickets: finalOrder.tickets.map((ticket) => ({ id: ticket.id, tierName: "", token: null })),
  };
}
