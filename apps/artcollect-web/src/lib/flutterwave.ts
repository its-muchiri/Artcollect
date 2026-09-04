/**
 * Minimal typed Flutterwave v3 REST client.
 *
 * Deliberately not built on the `flutterwave-node-v3` SDK: its published
 * types can't be verified against this codebase without a live sandbox key
 * (nothing here has been exercised against Flutterwave's real API — see
 * the project status notes), so a thin `fetch` wrapper with Zod-validated
 * responses is more honest than trusting an SDK's shape blindly. If a
 * response doesn't match what's expected, this throws instead of silently
 * passing through malformed data.
 *
 * Per docs/07_payments_and_security.md: payment status only ever comes
 * from a trusted server-to-server call — never a client redirect. This
 * module is that trusted channel; nothing here should ever be called from
 * client code.
 */
import "server-only";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

const InitiatePaymentResponse = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  data: z.object({ link: z.string().url() }).optional(),
});

export interface InitiatePaymentParams {
  txRef: string;
  amountMinor: number;
  currency: string;
  redirectUrl: string;
  customerEmail: string;
  customerName?: string;
  /** E.164 (+254…) buyer phone — passed to Flutterwave so M-Pesa/checkout can prefill. */
  customerPhone?: string;
  /** Shown on Flutterwave's hosted checkout page. */
  title: string;
}

/** Creates a hosted Flutterwave checkout session and returns its URL. */
export async function initiateStandardPayment(params: InitiatePaymentParams): Promise<string> {
  const secretKey = requireEnv("FLW_SECRET_KEY");

  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      // Flutterwave's API takes a decimal major-unit amount, not minor units.
      amount: (params.amountMinor / 100).toFixed(2),
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
        // Optional but recommended for M-Pesa flows: Flutterwave can
        // prefill the payer's number on its hosted checkout.
        ...(params.customerPhone ? { phone_number: params.customerPhone } : {}),
      },
      customizations: {
        title: params.title,
      },
    }),
  });

  const json: unknown = await response.json();
  const parsed = InitiatePaymentResponse.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Flutterwave returned an unexpected response shape: ${parsed.error.message}`);
  }
  if (parsed.data.status !== "success" || !parsed.data.data) {
    throw new Error(`Flutterwave payment initiation failed: ${parsed.data.message}`);
  }

  return parsed.data.data.link;
}

const VerifyTransactionResponse = z.object({
  status: z.enum(["success", "error"]),
  data: z
    .object({
      id: z.number(),
      tx_ref: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.enum(["successful", "failed", "pending"]),
      payment_type: z.string().optional(),
    })
    .optional(),
});

export interface VerifiedTransaction {
  txRef: string;
  providerRef: string;
  amountMinor: number;
  currency: string;
  status: "successful" | "failed" | "pending";
  /** e.g. "mpesa", "card", "mobilemoneyuganda" — whatever the buyer actually paid with. */
  paymentType?: string;
}

/**
 * Re-verifies a transaction server-to-server. Called from the webhook
 * handler before trusting its payload, per Flutterwave's own guidance and
 * docs/07's "never trust a single signal" rule for payment confirmation.
 */
export async function verifyTransaction(transactionId: string | number): Promise<VerifiedTransaction> {
  const secretKey = requireEnv("FLW_SECRET_KEY");

  const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const json: unknown = await response.json();
  const parsed = VerifyTransactionResponse.safeParse(json);

  if (!parsed.success || !parsed.data.data) {
    throw new Error("Flutterwave transaction verification failed or returned an unexpected shape.");
  }

  const data = parsed.data.data;
  return {
    txRef: data.tx_ref,
    providerRef: String(data.id),
    amountMinor: Math.round(data.amount * 100),
    currency: data.currency,
    status: data.status,
    paymentType: data.payment_type,
  };
}

/**
 * Verifies the `verif-hash` header Flutterwave sends on every webhook
 * request against `FLW_SECRET_HASH` (the value configured in the
 * Flutterwave dashboard). Timing-safe: a webhook endpoint is exactly the
 * kind of comparison an attacker gets unlimited attempts against.
 */
export function isValidWebhookSignature(headerHash: string | null): boolean {
  const expected = process.env.FLW_SECRET_HASH;
  if (!expected || !headerHash) return false;

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(headerHash);
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}
