"use server";

import { redirect } from "next/navigation";
import { prisma } from "@artcollect/database";
import { initiateStandardPayment } from "@/lib/flutterwave";
import { validateDonationInput } from "@/lib/donation-validation";

/**
 * Donation checkout (docs/07 rules, identical to ticket checkout): a
 * pending `Donation` row is created and the donor is redirected to
 * Flutterwave's hosted checkout with a `don_`-prefixed tx_ref — the
 * prefix is what lets the webhook (and the return page) tell donations
 * and ticket orders apart after the fact. Everything here is re-validated
 * server-side; the form's own clamping is a UX convenience only.
 *
 * This file's ONLY exports are async server actions (a "use server"
 * requirement); the pure validation rules live in
 * `@/lib/donation-validation`.
 */

export async function initiateDonationAction(input: {
  causeId: string;
  /** Minor units (cents). */
  amountMinor: number;
  donorEmail: string;
  donorName?: string;
  message?: string;
  anonymous?: boolean;
}): Promise<{ error?: string } | undefined> {
  const cause = await prisma.donationCause.findUnique({ where: { id: input.causeId } });
  if (!cause || cause.status !== "published") {
    return { error: "This cause is not currently accepting donations." };
  }

  const validationError = validateDonationInput({ ...input, currency: cause.currency });
  if (validationError) return { error: validationError };

  const donation = await prisma.donation.create({
    data: {
      causeId: cause.id,
      donorEmail: input.donorEmail,
      donorName: input.donorName?.trim() || null,
      message: input.message?.trim() || null,
      anonymous: input.anonymous ?? false,
      amountMinor: input.amountMinor,
      currency: cause.currency,
      status: "pending",
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set.");

  const checkoutUrl = await initiateStandardPayment({
    txRef: `don_${donation.id}`,
    amountMinor: Number(donation.amountMinor),
    currency: donation.currency,
    redirectUrl: `${appUrl}/donations/${donation.id}/pending`,
    customerEmail: donation.donorEmail,
    customerName: donation.donorName ?? undefined,
    title: `Donate — ${cause.title}`,
  });

  redirect(checkoutUrl);
}
