import { notFound } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { recordShortLinkClick, resolveShortLink } from "@/lib/short-links";

/**
 * Short-link redirect: /s/{code} → the linked surface (artist profile,
 * event page, cause page). 302 (temporary) so targets can move without
 * breaking shared links, and every hit is counted for social analytics.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const link = await resolveShortLink(code);
  if (!link) notFound();

  await recordShortLinkClick(code).catch(() => undefined); // never block the redirect on analytics

  return NextResponse.redirect(new URL(link.targetPath, request.url), 302);
}
