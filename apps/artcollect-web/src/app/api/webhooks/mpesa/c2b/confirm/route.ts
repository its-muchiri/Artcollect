import { NextResponse } from "next/server";
import { C2BPayload } from "@/lib/mpesa";

/**
 * Safaricom calls this after a direct (non-STK) C2B payment — someone who
 * went into their own M-Pesa menu and paid this Till directly, outside any
 * checkout flow this app controls. Unlike STK Push, there's no order id to
 * correlate: a Buy Goods till doesn't collect an account/reference from
 * the payer the way a Paybill does, so `BillRefNumber` is rarely
 * meaningful here. This just records what arrived — logged for manual
 * reconciliation (the model docs/07 already assumes for organiser
 * payouts) — rather than pretending it can be auto-matched to an order.
 * A dedicated ledger table is the natural next step if this volume grows
 * enough to need one; not built speculatively here.
 */
export async function POST(request: Request) {
  const rawBody: unknown = await request.json();
  const parsed = C2BPayload.safeParse(rawBody);

  if (parsed.success) {
    console.log("M-Pesa C2B payment received (manual reconciliation required):", {
      transId: parsed.data.TransID,
      amount: parsed.data.TransAmount,
      phone: parsed.data.MSISDN,
      billRefNumber: parsed.data.BillRefNumber,
      transTime: parsed.data.TransTime,
    });
  } else {
    console.error("M-Pesa C2B confirmation had an unexpected shape:", rawBody);
  }

  // Always 0/"Accepted" — Safaricom retries on anything else, and there's
  // no failure mode here this app could meaningfully report back.
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
