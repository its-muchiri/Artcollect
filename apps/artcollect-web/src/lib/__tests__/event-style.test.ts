import { describe, expect, it } from "vitest";
import { TicketingEventCategory as PrismaTicketingEventCategory } from "@artcollect/database";
import {
  getEventStyle,
  isGraffitiStyle,
  TICKETING_EVENT_CATEGORIES,
  type EventVisualStyle,
} from "../event-style";

/**
 * Verification-table row (docs/11): style routing. Every
 * `TicketingEventCategory` value maps to exactly one style, with an
 * explicit default/fallback case — never an unstyled or crashing state.
 */
describe("getEventStyle — every category maps to exactly one style", () => {
  it.each(TICKETING_EVENT_CATEGORIES)("%s resolves to a valid style", (category) => {
    const style: EventVisualStyle = getEventStyle(category);
    expect(["graffiti", "default"]).toContain(style);
  });

  it("routes street-art, music and nightlife to graffiti (docs/11 Phase 6)", () => {
    expect(getEventStyle("streetart")).toBe("graffiti");
    expect(getEventStyle("music")).toBe("graffiti");
    expect(getEventStyle("nightlife")).toBe("graffiti");
  });

  it("routes art, editorial and other to the calm default surface", () => {
    expect(getEventStyle("art")).toBe("default");
    expect(getEventStyle("editorial")).toBe("default");
    expect(getEventStyle("other")).toBe("default");
  });
});

describe("getEventStyle — explicit fallbacks", () => {
  it("falls back to default for null, undefined and empty", () => {
    expect(getEventStyle(null)).toBe("default");
    expect(getEventStyle(undefined)).toBe("default");
    expect(getEventStyle("")).toBe("default");
  });

  it("falls back to default for values outside the enum — no crash, no unstyled state", () => {
    expect(getEventStyle("no-such-category")).toBe("default");
    expect(getEventStyle("MUSIC")).toBe("default"); // case-sensitive enum
    expect(getEventStyle("1")).toBe("default");
  });
});

describe("isGraffitiStyle", () => {
  it("discriminates the graffiti style", () => {
    expect(isGraffitiStyle("graffiti")).toBe(true);
    expect(isGraffitiStyle("default")).toBe(false);
  });
});

describe("schema pin", () => {
  it("TICKETING_EVENT_CATEGORIES mirrors the Prisma TicketingEventCategory enum exactly", () => {
    const prismaValues = Object.values(PrismaTicketingEventCategory).sort();
    const localValues = [...TICKETING_EVENT_CATEGORIES].sort();

    expect(localValues).toEqual(prismaValues);
  });
});
