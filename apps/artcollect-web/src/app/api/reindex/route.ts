import { NextResponse } from "next/server";
import { getAllPublicUrls } from "@/app/sitemap";
import { submitToIndexNow } from "@/lib/indexnow";

/**
 * Submits every public URL to IndexNow (Bing/Yandex/Seznam/Naver — see
 * lib/indexnow.ts). Triggered on a schedule by Vercel Cron (vercel.json),
 * so re-indexing happens automatically with no manual step — this route
 * existing at all is just what makes that schedulable; it's also safe to
 * call by hand after a content change if you don't want to wait.
 *
 * Protected by CRON_SECRET, Vercel's own documented convention: when Vercel
 * Cron invokes a route, it automatically sends `Authorization: Bearer
 * ${CRON_SECRET}` — set that env var and this route trusts only calls
 * carrying it (the same value works for a manual curl call, so this isn't
 * only reachable on schedule).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://artcollect-web.vercel.app";
  const host = new URL(appUrl).host;
  const urls = await getAllPublicUrls();

  try {
    const result = await submitToIndexNow(urls, host);
    return NextResponse.json({ submitted: urls.length, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "IndexNow submission failed" },
      { status: 502 },
    );
  }
}
