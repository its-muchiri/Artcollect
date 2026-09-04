import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidWebhookSignature, verifyTransaction } from "@/lib/flutterwave";
import { finalizeOrderPayment } from "@/lib/order-fulfillment";
import { finalizeDonationPayment } from "@/lib/donation-fulfillment";

// Only enough of Flutterwave's webhook payload to know which transaction to
// go re-verify — every other field (amount, status, tx_ref) is trusted only
// from that re-verification call, never from this body directly. Per
// docs/07: payment status comes only from trusted server-to-server
// confirmation, and a webhook body is not inherently more trustworthy than
// a client redirect until its signature and its claims are both checked.
const WebhookPayload = z.object({
  data: z.object({
    id: z.number(),
    tx_ref: z.string(),
  }),
});

/** Donations are created with a `don_` tx_ref prefix (see donation-actions). */
export function isDonationTxRef(txRef: string): boolean {
  return txRef.startsWith("don_");
}

export async function POST(request: Request) {
  const signature = request.headers.get("verif-hash");
  if (!isValidWebhookSignature(signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const rawBody: unknown = await request.json();
  const parsed = WebhookPayload.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const verified = await verifyTransaction(parsed.data.data.id);
  if (verified.txRef !== parsed.data.data.tx_ref) {
    return NextResponse.json({ error: "tx_ref mismatch between webhook and verification" }, { status: 400 });
  }

  if (isDonationTxRef(verified.txRef)) {
    const donationId = verified.txRef.slice("don_".length);
    const result = await finalizeDonationPayment(donationId, verified);

    if (result.status === "not_found") {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }
    if (result.status === "amount_mismatch") {
      // Do not mark succeeded; flag for manual review rather than silently accepting.
      return NextResponse.json({ error: "Amount/currency mismatch" }, { status: 409 });
    }
    return NextResponse.json({ status: result.status });
  }

  const result = await finalizeOrderPayment(verified.txRef, verified);

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (result.status === "amount_mismatch") {
    // Do not mark paid; flag for manual review rather than silently accepting.
    return NextResponse.json({ error: "Amount/currency mismatch" }, { status: 409 });
  }

  return NextResponse.json({ status: result.status });
}
