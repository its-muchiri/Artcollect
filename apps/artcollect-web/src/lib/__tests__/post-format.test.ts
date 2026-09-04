import { describe, expect, it } from "vitest";
import { parsePostBody, readingMinutes } from "../post-format";

/**
 * Journal body formatting: the renderer and the tests share one pure
 * function so a stray convention can never silently render as literal
 * text in a story.
 */
describe("parsePostBody", () => {
  it("splits blank-line paragraphs", () => {
    const blocks = parsePostBody("First paragraph.\n\nSecond paragraph.");
    expect(blocks).toEqual([
      { kind: "paragraph", text: "First paragraph." },
      { kind: "paragraph", text: "Second paragraph." },
    ]);
  });

  it("maps '## ' headings and '> ' blockquotes", () => {
    const blocks = parsePostBody("Intro.\n\n## The maths of many\n\n> A quoted line.");
    expect(blocks).toEqual([
      { kind: "paragraph", text: "Intro." },
      { kind: "heading", text: "The maths of many" },
      { kind: "quote", text: "A quoted line." },
    ]);
  });

  it("keeps single newlines inside a paragraph together", () => {
    const blocks = parsePostBody("- item one\n- item two");
    expect(blocks).toEqual([{ kind: "paragraph", text: "- item one\n- item two" }]);
  });

  it("drops empty blocks from sloppy blank lines", () => {
    const blocks = parsePostBody("One.\n\n\n\n   \n\nTwo.");
    expect(blocks).toHaveLength(2);
  });

  it("returns nothing for an empty body", () => {
    expect(parsePostBody("")).toEqual([]);
  });
});

describe("readingMinutes", () => {
  it("estimates ~200 wpm with a minimum of 1", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("one two three")).toBe(1);
    expect(readingMinutes(Array(400).fill("word").join(" "))).toBe(2);
  });
});
