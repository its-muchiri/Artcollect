/**
 * Lightweight post-body formatting (docs/11-style continuation): the
 * journal body is plain text with three conventions — blank-line
 * paragraphs, "## " headings, "> " blockquotes. This pure function turns
 * a body into renderable blocks; it's unit-tested so a stray markdown
 * convention can't silently render as literal text.
 */

export type PostBlock =
  | { kind: "heading"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "paragraph"; text: string };

export function parsePostBody(body: string): PostBlock[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block): PostBlock => {
      if (block.startsWith("## ")) {
        return { kind: "heading", text: block.slice(3).trim() };
      }
      if (block.startsWith("> ")) {
        return { kind: "quote", text: block.slice(2).trim() };
      }
      return { kind: "paragraph", text: block };
    });
}

/** Safe reading-time estimate: ~200 wpm, minimum 1. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
