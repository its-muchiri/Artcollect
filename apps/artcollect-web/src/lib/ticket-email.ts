/**
 * Builds and sends the "here's your ticket" email — the actual QR
 * delivery mechanism now that fulfillment usually happens inside the
 * M-Pesa webhook (see order-fulfillment.ts's module doc: the buyer's own
 * browser almost never wins the race to see the raw token anymore, so this
 * email is the primary way they ever get it, not a nice-to-have).
 *
 * QR codes are attached as inline (`cid:`) PNGs rather than a data URI in
 * the HTML — more reliable across email clients, several of which strip
 * or block `data:` image sources.
 */
import "server-only";
import QRCode from "qrcode";
import { sendEmail } from "@/lib/email";

export interface TicketEmailTicket {
  id: string;
  tierName: string;
  /** Raw bearer token — this email is the one place it's ever handed to the buyer. */
  token: string;
}

export interface TicketEmailParams {
  to: string;
  buyerName: string | null;
  eventTitle: string;
  eventVenue: string | null;
  eventStartsAt: Date | null;
  tickets: TicketEmailTicket[];
}

function formatEventDate(date: Date | null): string {
  if (!date) return "Date to be announced";
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function sendTicketEmail(params: TicketEmailParams): Promise<void> {
  const attachments = await Promise.all(
    params.tickets.map(async (ticket, i) => ({
      contentId: `qr-${i}`,
      filename: `ticket-${i + 1}.png`,
      contentType: "image/png",
      content: await QRCode.toBuffer(ticket.token, { width: 400, margin: 1 }),
    })),
  );

  const ticketsHtml = params.tickets
    .map(
      (ticket, i) => `
      <div style="margin:24px 0;padding:20px;border:1px solid #e4e4e7;border-radius:12px;text-align:center;">
        <img src="cid:qr-${i}" alt="Ticket QR code" width="220" height="220" style="display:block;margin:0 auto;" />
        <p style="margin:12px 0 0;font-size:14px;color:#18181b;font-weight:600;">${escapeHtml(ticket.tierName)}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#a1a1aa;">Ticket ${escapeHtml(ticket.id)}</p>
      </div>`,
    )
    .join("");

  const greeting = params.buyerName ? `Hi ${escapeHtml(params.buyerName)},` : "Hi,";

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#18181b;">
      <p style="font-size:16px;">${greeting}</p>
      <p style="font-size:16px;">Your payment for <strong>${escapeHtml(params.eventTitle)}</strong> is confirmed. Here${
        params.tickets.length > 1 ? " are your tickets" : "'s your ticket"
      } — show the QR code at the door, each one scans once.</p>
      <p style="font-size:14px;color:#52525b;">
        ${escapeHtml(formatEventDate(params.eventStartsAt))}${params.eventVenue ? ` · ${escapeHtml(params.eventVenue)}` : ""}
      </p>
      ${ticketsHtml}
      <p style="font-size:12px;color:#a1a1aa;margin-top:32px;">Sent by TikoYetu, part of the ArtCollect ecosystem.</p>
    </div>`;

  await sendEmail({
    to: params.to,
    subject: `Your ticket${params.tickets.length > 1 ? "s" : ""} — ${params.eventTitle}`,
    html,
    attachments,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
