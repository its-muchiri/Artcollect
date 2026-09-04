/**
 * Safaricom Daraja API client — STK Push (Lipa Na M-Pesa Online) + Query,
 * C2B register/validation/confirmation, B2C, B2B, and Dynamic QR.
 *
 * Same philosophy as `lib/flutterwave.ts`: a thin, typed `fetch` wrapper
 * rather than a third-party SDK, so a malformed response throws instead of
 * silently passing through. The STK Push + Query shapes here were verified
 * against current third-party documentation mirrors of Safaricom's own
 * docs in this session; the Dynamic QR shape (`generateDynamicQr`) is built
 * from well-established field names (`MerchantName`/`RefNo`/`TrxCode`/
 * `CPI`/`Size`) that could not be independently re-verified against a live
 * source this session — sanity-check one real sandbox call against it
 * before relying on it in production.
 *
 * Trust model, matching docs/07's "never trust a single signal" rule:
 * Safaricom's STK callback carries no signature you can verify (unlike
 * Flutterwave's `verif-hash`), so it is treated only as a prompt to go
 * re-check the transaction — `queryStkPushStatus` is the actual source of
 * truth the webhook handler acts on, the same role `verifyTransaction`
 * plays for Flutterwave.
 */
import "server-only";
import { publicEncrypt, constants as cryptoConstants } from "node:crypto";
import { z } from "zod";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

const BASE_URL =
  process.env.MPESA_ENV === "sandbox"
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";

// ---------------------------------------------------------------------------
// OAuth — every other call needs a fresh Bearer token. Daraja tokens last
// ~1hr; cached in-memory (per server instance) with a safety margin rather
// than fetched fresh on every request.
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const consumerKey = requireEnv("MPESA_CONSUMER_KEY");
  const consumerSecret = requireEnv("MPESA_CONSUMER_SECRET");
  const basic = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
  });

  const TokenResponse = z.object({
    access_token: z.string(),
    expires_in: z.string(),
  });
  const parsed = TokenResponse.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`Daraja OAuth token request returned an unexpected shape: ${parsed.error.message}`);
  }

  cachedToken = {
    value: parsed.data.access_token,
    // Refresh 60s early rather than racing the real expiry.
    expiresAt: Date.now() + (Number(parsed.data.expires_in) - 60) * 1000,
  };
  return cachedToken.value;
}

async function darajaFetch(path: string, body: unknown): Promise<unknown> {
  const token = await getAccessToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

/** `Timestamp` format Daraja expects everywhere: YYYYMMDDHHmmss, local (Africa/Nairobi) time. */
function darajaTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

/** `Password` for STK Push/Query: base64(Shortcode + Passkey + Timestamp). */
function stkPassword(shortcode: string, timestamp: string): string {
  const passkey = requireEnv("MPESA_PASSKEY");
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

// ---------------------------------------------------------------------------
// STK Push (Lipa Na M-Pesa Online / M-Pesa Express)
// ---------------------------------------------------------------------------

export interface StkPushParams {
  /** E.164 (+2547… / +2541…) — normalized before this is called. */
  phone: string;
  amountMinor: number;
  /** Shown to the buyer on their phone / in their statement. Daraja caps this at 12 chars. */
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
}

const StkPushResponse = z.object({
  MerchantRequestID: z.string(),
  CheckoutRequestID: z.string(),
  ResponseCode: z.string(),
  ResponseDescription: z.string(),
});

/**
 * Sends the STK prompt to the buyer's phone. `TransactionType` is fixed to
 * `CustomerBuyGoodsOnline` — this account's shortcode is a Till (Buy Goods),
 * not a Paybill (`CustomerPayBillOnline`); PartyA/PartyB are both the
 * shortcode for a Till (the phone number is passed separately, and is the
 * actual payer).
 */
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const timestamp = darajaTimestamp();

  const json = await darajaFetch("/mpesa/stkpush/v1/processrequest", {
    BusinessShortCode: shortcode,
    Password: stkPassword(shortcode, timestamp),
    Timestamp: timestamp,
    TransactionType: "CustomerBuyGoodsOnline",
    Amount: Math.round(params.amountMinor / 100),
    PartyA: params.phone,
    PartyB: shortcode,
    PhoneNumber: params.phone,
    CallBackURL: params.callbackUrl,
    AccountReference: params.accountReference.slice(0, 12),
    TransactionDesc: params.transactionDesc.slice(0, 13),
  });

  const parsed = StkPushResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`STK Push returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
  if (parsed.data.ResponseCode !== "0") {
    throw new Error(`STK Push was not accepted: ${parsed.data.ResponseDescription}`);
  }

  return { merchantRequestId: parsed.data.MerchantRequestID, checkoutRequestId: parsed.data.CheckoutRequestID };
}

export type StkQueryStatus = "pending" | "successful" | "failed" | "cancelled";

export interface StkQueryResult {
  status: StkQueryStatus;
  resultDesc: string;
}

const StkQueryResponse = z.object({
  ResponseCode: z.string(),
  ResultCode: z.string().optional(),
  ResultDesc: z.string().optional(),
  ResponseDescription: z.string().optional(),
  errorCode: z.string().optional(),
});

/**
 * The authoritative status check — call this from the callback handler
 * rather than trusting the callback body directly (see module doc).
 * ResultCode "0" = paid; "1032" = cancelled by the buyer; a still-pending
 * push comes back as an error response (`errorCode` "500.001.1001") since
 * Daraja has nothing to report yet — mapped to "pending" here rather than
 * thrown, since that's an expected, retryable state, not a failure.
 */
export async function queryStkPushStatus(checkoutRequestId: string): Promise<StkQueryResult> {
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const timestamp = darajaTimestamp();

  const json = await darajaFetch("/mpesa/stkpushquery/v1/query", {
    BusinessShortCode: shortcode,
    Password: stkPassword(shortcode, timestamp),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  });

  const parsed = StkQueryResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`STK Push query returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
  if (parsed.data.errorCode === "500.001.1001") {
    return { status: "pending", resultDesc: "The transaction is still being processed." };
  }
  if (parsed.data.ResultCode === "0") {
    return { status: "successful", resultDesc: parsed.data.ResultDesc ?? "" };
  }
  if (parsed.data.ResultCode === "1032") {
    return { status: "cancelled", resultDesc: parsed.data.ResultDesc ?? "" };
  }
  return { status: "failed", resultDesc: parsed.data.ResultDesc ?? parsed.data.ResponseDescription ?? "Unknown failure." };
}

// ---------------------------------------------------------------------------
// C2B — for buyers who pay by going into their own M-Pesa menu and typing
// this Till directly, instead of an STK prompt this app triggered. Unlike
// STK Push, there is no order id to correlate up front; the Confirmation
// webhook is the only signal, matched best-effort against `BillRefNumber`
// (see the c2b webhook route) and otherwise logged for manual reconciliation.
// ---------------------------------------------------------------------------

const C2BRegisterResponse = z.object({
  ConversationID: z.string().optional(),
  OriginatorCoversationID: z.string().optional(),
  ResponseDescription: z.string(),
});

/** One-time (per shortcode) call to tell Daraja where to send C2B Validation/Confirmation. Re-running is harmless. */
export async function registerC2BUrls(validationUrl: string, confirmationUrl: string): Promise<void> {
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const json = await darajaFetch("/mpesa/c2b/v2/registerurl", {
    ShortCode: shortcode,
    ResponseType: "Completed",
    ConfirmationURL: confirmationUrl,
    ValidationURL: validationUrl,
  });
  const parsed = C2BRegisterResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`C2B URL registration returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
}

/** What Safaricom POSTs to the Validation and Confirmation URLs for a direct C2B payment. */
export const C2BPayload = z.object({
  TransactionType: z.string(),
  TransID: z.string(),
  TransTime: z.string(),
  TransAmount: z.string(),
  BusinessShortCode: z.string(),
  BillRefNumber: z.string().optional(),
  MSISDN: z.string(),
  FirstName: z.string().optional(),
});
export type C2BPayload = z.infer<typeof C2BPayload>;

// ---------------------------------------------------------------------------
// B2C / B2B — sending money out (refunds, and eventually organiser payouts).
// Both need a `SecurityCredential`: your Initiator password RSA-encrypted
// with Safaricom's public certificate for this environment (NOT the same
// as the Consumer Key/Secret) — see `buildSecurityCredential`. Neither is
// wired into any UI flow yet; these are the building blocks for a future
// admin-triggered refund/payout action.
// ---------------------------------------------------------------------------

/**
 * RSA-encrypts `MPESA_INITIATOR_PASSWORD` with Safaricom's public cert
 * (`MPESA_B2C_CERT_PEM` — sandbox's is published in Safaricom's own Daraja
 * GitHub samples; production's must be requested from Safaricom for this
 * account) to produce the `SecurityCredential` B2C/B2B require. Not needed
 * for STK Push, C2B, or Dynamic QR.
 */
function buildSecurityCredential(): string {
  const password = requireEnv("MPESA_INITIATOR_PASSWORD");
  const certPem = requireEnv("MPESA_B2C_CERT_PEM");
  const encrypted = publicEncrypt(
    { key: certPem, padding: cryptoConstants.RSA_PKCS1_PADDING },
    Buffer.from(password),
  );
  return encrypted.toString("base64");
}

export interface B2CPaymentParams {
  /** E.164 phone to send money to (a refund recipient, typically). */
  phone: string;
  amountMinor: number;
  remarks: string;
  occasion?: string;
  resultUrl: string;
  timeoutUrl: string;
  /** Daraja distinguishes these for reporting/limits; refunds are BusinessPayment. */
  commandId?: "BusinessPayment" | "SalaryPayment" | "PromotionPayment";
}

const B2CResponse = z.object({
  ConversationID: z.string(),
  OriginatorConversationID: z.string(),
  ResponseCode: z.string(),
  ResponseDescription: z.string(),
});

/** Initiates a business-to-customer payout (e.g. a ticket refund). Async — the real result arrives at `resultUrl`. */
export async function initiateB2CPayment(params: B2CPaymentParams): Promise<{ conversationId: string }> {
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const initiatorName = requireEnv("MPESA_INITIATOR_NAME");

  const json = await darajaFetch("/mpesa/b2c/v3/paymentrequest", {
    InitiatorName: initiatorName,
    SecurityCredential: buildSecurityCredential(),
    CommandID: params.commandId ?? "BusinessPayment",
    Amount: Math.round(params.amountMinor / 100),
    PartyA: shortcode,
    PartyB: params.phone,
    Remarks: params.remarks.slice(0, 100),
    QueueTimeOutURL: params.timeoutUrl,
    ResultURL: params.resultUrl,
    Occasion: (params.occasion ?? "").slice(0, 100),
  });
  const parsed = B2CResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`B2C payment request returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
  if (parsed.data.ResponseCode !== "0") {
    throw new Error(`B2C payment was not accepted: ${parsed.data.ResponseDescription}`);
  }
  return { conversationId: parsed.data.ConversationID };
}

export interface B2BPaymentParams {
  /** The receiving shortcode (another Till/Paybill) — a future organiser payout target. */
  receiverShortcode: string;
  amountMinor: number;
  accountReference: string;
  remarks: string;
  resultUrl: string;
  timeoutUrl: string;
}

/** Business-to-business payment — e.g. a future direct payout to an event organiser's own Till/Paybill. Not called from any flow yet. */
export async function initiateB2BPayment(params: B2BPaymentParams): Promise<{ conversationId: string }> {
  const shortcode = requireEnv("MPESA_SHORTCODE");
  const initiatorName = requireEnv("MPESA_INITIATOR_NAME");

  const json = await darajaFetch("/mpesa/b2b/v1/paymentrequest", {
    Initiator: initiatorName,
    SecurityCredential: buildSecurityCredential(),
    CommandID: "BusinessPayBill",
    SenderIdentifierType: "4",
    RecieverIdentifierType: "4",
    Amount: Math.round(params.amountMinor / 100),
    PartyA: shortcode,
    PartyB: params.receiverShortcode,
    AccountReference: params.accountReference.slice(0, 12),
    Remarks: params.remarks.slice(0, 100),
    QueueTimeOutURL: params.timeoutUrl,
    ResultURL: params.resultUrl,
  });
  const parsed = B2CResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`B2B payment request returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
  if (parsed.data.ResponseCode !== "0") {
    throw new Error(`B2B payment was not accepted: ${parsed.data.ResponseDescription}`);
  }
  return { conversationId: parsed.data.ConversationID };
}

// ---------------------------------------------------------------------------
// Dynamic QR — a scannable alternative to STK Push: the buyer's M-Pesa app
// scans it and pre-fills the Till + amount rather than waiting for a push.
// ---------------------------------------------------------------------------

export interface DynamicQrParams {
  merchantName: string;
  /** Shown to the payer; Daraja caps this at a short reference, not a full order id. */
  refNo: string;
  amountMinor: number;
  size?: number;
}

const DynamicQrResponse = z.object({
  ResponseCode: z.string(),
  RequestID: z.string().optional(),
  ResponseDescription: z.string().optional(),
  QRCode: z.string().optional(),
});

/** Returns a base64-encoded QR image (embed as `data:image/png;base64,${qrCode}`). */
export async function generateDynamicQr(params: DynamicQrParams): Promise<string> {
  const shortcode = requireEnv("MPESA_SHORTCODE");

  const json = await darajaFetch("/mpesa/qrcode/v1/generate", {
    MerchantName: params.merchantName,
    RefNo: params.refNo.slice(0, 12),
    Amount: Math.round(params.amountMinor / 100),
    TrxCode: "BG", // Buy Goods — this account's shortcode is a Till.
    CPI: shortcode,
    Size: String(params.size ?? 300),
  });
  const parsed = DynamicQrResponse.safeParse(json);
  if (!parsed.success || !parsed.data.QRCode) {
    throw new Error(`Dynamic QR generation returned an unexpected response shape: ${JSON.stringify(json)}`);
  }
  return parsed.data.QRCode;
}
