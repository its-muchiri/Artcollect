/**
 * IndexNow — a real, working "push" indexing protocol (unlike Google,
 * which has no public instant-index API for ordinary websites: their
 * Indexing API is restricted to job-posting/livestream content types).
 * One submission fans out to every participating engine (Bing, Yandex,
 * Seznam.cz, Naver) via the shared aggregator endpoint.
 *
 * Key file lives at public/{INDEXNOW_KEY}.txt per the protocol's
 * "recommended" verification method — https://www.indexnow.org.
 */
import "server-only";

const INDEXNOW_KEY = "4903d33b9b620d639a86cd13a5f3d995";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export interface IndexNowResult {
  status: number;
  ok: boolean;
}

/** Submits up to 10,000 URLs (per the protocol's own limit) in one call. */
export async function submitToIndexNow(urls: string[], host: string): Promise<IndexNowResult> {
  if (urls.length === 0) return { status: 200, ok: true };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10_000),
    }),
  });

  // 200 and 202 both mean "accepted" per the spec — 202 is "pending validation".
  return { status: response.status, ok: response.status === 200 || response.status === 202 };
}
