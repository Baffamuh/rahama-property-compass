import { describe, expect, it } from "vitest";
import { formatNaira, isPublic, propertyWhatsappMessage, whatsappLink } from "./format";

describe("format rules", () => {
  it("formats prices in naira", () => {
    expect(formatNaira(4500000)).toBe("₦4,500,000");
  });
  it("whatsapp message includes title and reference, url-encoded", () => {
    const msg = propertyWhatsappMessage({ title: "Plot A", ref: "RHM-AZR-001" });
    expect(msg).toContain("RHM-AZR-001");
    expect(whatsappLink(msg, "234800")).toBe(`https://wa.me/234800?text=${encodeURIComponent(msg)}`);
  });
  it("draft and archived listings are hidden from the public", () => {
    expect(isPublic("Draft")).toBe(false);
    expect(isPublic("Archived")).toBe(false);
    expect(isPublic("Sold")).toBe(true);
  });
});
