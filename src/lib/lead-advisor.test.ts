import { describe, expect, it } from "vitest";
import { analyzeLead, draftReply } from "./lead-advisor";
import { sampleProperties } from "./sample-data";

describe("lead advisor", () => {
  it("rates inspection + cash-ready buyers High", () => {
    expect(analyzeLead({ name: "A", message: "I have cash ready and want to inspect the plot this week" }).priority).toBe("High");
  });
  it("rates casual browsers Low", () => {
    expect(analyzeLead({ name: "A", message: "Just checking, maybe next year" }).priority).toBe("Low");
  });
  it("reply includes property ref and office address", () => {
    const p = sampleProperties[0];
    const r = draftReply({ name: "Musa Ali", message: "", property: p }, analyzeLead({ name: "Musa", message: "", property: p }), "formal");
    expect(r).toContain(p.ref);
    expect(r).toContain("No. 12, Old Kano Road");
  });
});
