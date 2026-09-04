import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@artcollect/database";

/**
 * Short links for shareable surfaces (artist profiles, events, causes).
 *
 * Codes are derived deterministically from the target path (SHA-256 → 7
 * base64url chars), so the same page always maps to the same short link —
 * resharing never fragments the click count. Upserts keep it idempotent;
 * the rare 7-char collision retries with a salt.
 */
export async function ensureShortLink(targetPath: string): Promise<string> {
  const normalized = targetPath.startsWith("/") ? targetPath : `/${targetPath}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const hash = createHash("sha256")
      .update(`${normalized}#${attempt}`)
      .digest("base64url");
    const code = hash.slice(0, 7).replace(/[-_]/g, "a"); // keep URL-safe alphanumerics

    try {
      await prisma.shortLink.upsert({
        where: { code },
        update: {},
        create: { code, targetPath: normalized },
      });
      return code;
    } catch {
      if (attempt === 2) throw new Error(`Could not allocate a short link for ${normalized}`);
    }
  }

  throw new Error("unreachable");
}

export async function resolveShortLink(code: string): Promise<{ targetPath: string } | null> {
  const link = await prisma.shortLink.findUnique({ where: { code } });
  return link ? { targetPath: link.targetPath } : null;
}

export async function recordShortLinkClick(code: string): Promise<void> {
  await prisma.shortLink.update({
    where: { code },
    data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
  });
}
