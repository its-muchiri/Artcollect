import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@artcollect/database";
import { queryStkPushStatus } from "@/lib/mpesa";
import { finalizeOrderPayment } from "@/lib/order-fulfillment";

/**
 * Safaricom's STK callback. Per lib/mpesa.ts's module doc: this callback
 * carries no verifiable signature, so its own ResultCode is never trusted
 * directly — it's only used to know WHICH CheckoutRequestID to go
 * authoritatively re-check via `queryStkPushStatus`, the same "never trust
 * a single signal" rule docs/07 applies to Flutterwave's webhook.
 *
 * Always responds 200 to Safaricom regardless of outcome — Daraja retries
 * a non-200 response, and there is nothing a retry would fix here that
 * `queryStkPushStatus` itself couldn't already resolve.
 */
const StkCallbackPayload = z.object({
  Body: z.object({
    stkCallback: z.object({
      MerchantRequestID: z.string(),
      CheckoutRequestID: z.string(),
    }),
  }),
});

export async function POST(request: Request) {
  const rawBody: unknown = await request.json();
  const parsed = StkCallbackPayload.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const { CheckoutRequestID: checkoutRequestId } = parsed.data.Body.stkCallback;

  const payment = await prisma.payment.findUnique({ where: { providerRef: checkoutRequestId } });
  if (!payment) {
    // Nothing in our own DB references this push — can't be fulfilled
    // regardless of what the query says. Still 200: Safaricom isn't going
    // to give us anything more useful by retrying.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  let queryResult;
  try {
    queryResult = await queryStkPushStatus(checkoutRequestId);
  } catch (error) {
    console.error(`STK query failed for ${checkoutRequestId}:`, error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  if (queryResult.status === "pending") {
    // Callback arrived before the query endpoint has the final result yet
    // (rare, but the query API documents this as possible) — nothing to do.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  if (queryResult.status !== "successful") {
    await prisma.order.updateMany({
      where: { id: payment.orderId, status: "pending_payment" },
      data: { status: "payment_failed" },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // finalizeOrderPayment does its own upsert keyed by providerRef; passing
  // the same checkoutRequestId here means it updates *this* row in place
  // (a real M-Pesa transaction has no separate "receipt number" surfaced
  // by the query endpoint the way the callback's CallbackMetadata would —
  // querying rather than trusting the callback body means that number
  // isn't available here, so the CheckoutRequestID stays the permanent
  // reference).
  const result = await finalizeOrderPayment(payment.orderId, {
    txRef: payment.orderId,
    providerRef: checkoutRequestId,
    amountMinor: Number(payment.amountMinor),
    currency: payment.currency,
    status: "successful",
    paymentType: "mpesa",
  });

  if (result.status === "amount_mismatch") {
    console.error(`M-Pesa amount mismatch on order ${payment.orderId} (CheckoutRequestID ${checkoutRequestId})`);
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
