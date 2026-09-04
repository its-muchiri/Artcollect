"use server";

import { redirect } from "next/navigation";
import { prisma } from "@artcollect/database";
import { initiateStkPush } from "@/lib/mpesa";
import { normalizeKenyanPhone } from "@/lib/phone";

export interface CheckoutSelection {
  tierId: string;
  quantity: number;
}

export interface CheckoutInput {
  eventId: string;
  buyerEmail: string;
  buyerName?: string;
  /** Required — this is the number the M-Pesa STK prompt actually goes to. */
  buyerPhone: string;
  selections: CheckoutSelection[];
}

export interface CheckoutResult {
  error?: string;
}

const HOLD_DURATION_MS = 10 * 60 * 1000;

class CheckoutValidationError extends Error {}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

/**
 * Creates a pending order + short-lived inventory holds, sends an M-Pesa
 * STK Push to the buyer's phone, then redirects to the order's pending
 * page — which polls for the async callback result rather than a redirect
 * carrying a transaction id (Safaricom never redirects the buyer back;
 * confirmation only ever arrives at the callback URL).
 *
 * Every quantity is re-validated here against the tier's own min/max *and*
 * live availability (capacity - issued tickets - active holds), computed
 * fresh inside the transaction — the UI's own clamping is a UX convenience,
 * not something this trusts. Per docs/06_tikoyetu_ticketing_engine.md,
 * checkout creates the hold and order together so nothing is sellable
 * twice while payment is in flight.
 */
export async function initiateCheckoutAction(input: CheckoutInput): Promise<CheckoutResult | undefined> {
  const selections = input.selections.filter((s) => s.quantity > 0);
  if (selections.length === 0) return { error: "Select at least one ticket." };

  const normalizedPhone = normalizeKenyanPhone(input.buyerPhone);
  if (!normalizedPhone) {
    return { error: "Enter a valid Safaricom number (e.g. 0712 345 678) — this is where the M-Pesa prompt goes." };
  }

  const event = await prisma.ticketingEvent.findUnique({
    where: { id: input.eventId },
    include: { tiers: true },
  });
  if (!event || event.status !== "on_sale") {
    return { error: "This event is not currently on sale." };
  }

  const tiersById = new Map(event.tiers.map((tier) => [tier.id, tier]));

  for (const selection of selections) {
    const tier = tiersById.get(selection.tierId);
    if (!tier) return { error: "One of the selected tickets no longer exists." };
    if (selection.quantity < tier.minPerOrder || selection.quantity > tier.maxPerOrder) {
      return {
        error: `${tier.name}: quantity must be between ${tier.minPerOrder} and ${tier.maxPerOrder}.`,
      };
    }
  }

  let orderId: string;

  try {
    orderId = await prisma.$transaction(async (tx) => {
      let totalMinor = 0n;
      const orderItemsData: {
        tierId: string;
        tierNameSnapshot: string;
        priceMinorSnapshot: bigint;
        quantity: number;
      }[] = [];

      for (const selection of selections) {
        const tier = tiersById.get(selection.tierId);
        if (!tier) throw new CheckoutValidationError("One of the selected tickets no longer exists.");

        const [issuedCount, heldAgg] = await Promise.all([
          tx.ticket.count({
            where: { tierId: tier.id, status: { in: ["active", "checked_in", "transferred"] } },
          }),
          tx.inventoryHold.aggregate({
            where: { tierId: tier.id, expiresAt: { gt: new Date() } },
            _sum: { quantity: true },
          }),
        ]);
        const held = heldAgg._sum.quantity ?? 0;
        const remaining = tier.capacity - issuedCount - held;

        if (selection.quantity > remaining) {
          throw new CheckoutValidationError(`Only ${Math.max(0, remaining)} left for ${tier.name}.`);
        }

        totalMinor += tier.priceMinor * BigInt(selection.quantity);
        orderItemsData.push({
          tierId: tier.id,
          tierNameSnapshot: tier.name,
          priceMinorSnapshot: tier.priceMinor,
          quantity: selection.quantity,
        });
      }

      const order = await tx.order.create({
        data: {
          eventId: event.id,
          buyerEmail: input.buyerEmail,
          buyerName: input.buyerName,
          buyerPhone: normalizedPhone,
          status: "pending_payment",
          totalMinor,
          currency: event.currency,
          items: { create: orderItemsData },
        },
      });

      await tx.inventoryHold.createMany({
        data: selections.map((selection) => ({
          tierId: selection.tierId,
          orderId: order.id,
          quantity: selection.quantity,
          expiresAt: new Date(Date.now() + HOLD_DURATION_MS),
        })),
      });

      return order.id;
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) return { error: error.message };
    throw error;
  }

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const appUrl = requireEnv("NEXT_PUBLIC_APP_URL");

  try {
    const stk = await initiateStkPush({
      phone: normalizedPhone,
      amountMinor: Number(order.totalMinor),
      accountReference: event.title,
      transactionDesc: "Tickets",
      callbackUrl: `${appUrl}/api/webhooks/mpesa/stk`,
    });

    // Correlates the async callback back to this order — Safaricom's
    // callback carries CheckoutRequestID, not any reference of ours (see
    // lib/mpesa.ts's module doc). No tokens/amount are trusted from the
    // callback itself either way; the webhook re-queries this transaction
    // before finalizing anything.
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "mpesa",
        providerRef: stk.checkoutRequestId,
        status: "pending",
        amountMinor: order.totalMinor,
        currency: order.currency,
      },
    });
  } catch {
    return { error: "Couldn't send the M-Pesa prompt — check the number and try again." };
  }

  redirect(`/orders/${order.id}/pending`);
}
