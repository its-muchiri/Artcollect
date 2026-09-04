/**
 * Thin Resend REST client — same philosophy as `lib/flutterwave.ts` and
 * `lib/mpesa.ts`: a typed `fetch` wrapper, not the SDK, so an unexpected
 * response shape throws instead of failing silently.
 *
 * `MAIL_FROM` must be an address on a domain verified in Resend to send in
 * production; until `artcollect.co.ke` is verified there, set it to
 * Resend's shared test sender (`onboarding@resend.dev`) — deliverable only
 * to the Resend account's own owner email while on that sender, which is
 * fine for verifying this integration end-to-end before real buyers use it.
 */
import "server-only";
import { z } from "zod";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

export interface EmailAttachment {
  filename: string;
  /** Raw bytes — base64-encoded before sending. */
  content: Buffer;
  contentType: string;
  /** Set to embed inline via `<img src="cid:...">` in the HTML body instead of appearing as a download. */
  contentId?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

const SendEmailResponse = z.object({ id: z.string() });

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const from = process.env.MAIL_FROM ?? "ArtCollect <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString("base64"),
        content_type: a.contentType,
        ...(a.contentId ? { content_id: a.contentId } : {}),
      })),
    }),
  });

  const json: unknown = await response.json();
  const parsed = SendEmailResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Resend returned an unexpected response: ${JSON.stringify(json)}`);
  }
}
