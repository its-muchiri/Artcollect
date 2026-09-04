import { NextResponse } from "next/server";

/**
 * Safaricom calls this before a direct (non-STK) C2B payment settles —
 * only relevant if `ResponseType` is ever changed away from "Completed"
 * in `registerC2BUrls`. Nothing here has a reason to reject a payment (no
 * order to check inventory/price against — a direct C2B payer typed the
 * Till themselves, outside any checkout flow this app controls), so this
 * always accepts; reconciliation happens at the Confirmation URL instead.
 */
export async function POST() {
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
