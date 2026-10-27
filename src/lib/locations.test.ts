import { describe, expect, it } from "vitest";
import { areasOf, findArea, sampleZones } from "./locations";

describe("location tree", () => {
  it("lists areas for a town only", () => {
    expect(areasOf(sampleZones, { town: "Bauchi" })).not.toContain("GRA Azare");
  });
  it("finds the zone and sub-zone of an area", () => {
    const hit = findArea(sampleZones, "GRA Azare");
    expect(hit?.zone.name).toBe("Azare Central");
    expect(hit?.subZone.name).toBe("GRA");
  });
});
