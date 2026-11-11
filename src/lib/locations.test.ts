import { describe, expect, it } from "vitest";
import { areasOf, findArea, sampleZones, zoneOfProperty } from "./locations";

describe("location tree", () => {
  it("lists areas for a town only", () => {
    expect(areasOf([{ id: "z1", name: "Zone 1", town: "Azare", areas: ["GRA Azare"], subZones: [] }], { town: "Bauchi" })).not.toContain("GRA Azare");
  });
  it("finds the zone and sub-zone of an area", () => {
    const hit = findArea([{ id: "legacy", name: "Azare Central", town: "Azare", subZones: [{ id: "gra", name: "GRA", areas: ["GRA Azare"] }] }], "GRA Azare");
    expect(hit?.zone.name).toBe("Azare Central");
    expect(hit?.subZone?.name).toBe("GRA");
  });
  it("provides exactly six Azare zones Z1 through Z6", () => {
    expect(sampleZones.map((z) => [z.id, z.name, z.town])).toEqual([
      ["z1", "Zone 1 (Z1)", "Azare"], ["z2", "Zone 2 (Z2)", "Azare"],
      ["z3", "Zone 3 (Z3)", "Azare"], ["z4", "Zone 4 (Z4)", "Azare"],
      ["z5", "Zone 5 (Z5)", "Azare"], ["z6", "Zone 6 (Z6)", "Azare"],
    ]);
  });
  it("lists direct areas only from the selected zone", () => {
    const zones = sampleZones.map((z) => ({ ...z, areas: [z.id === "z1" ? "Old Kano Road" : "Other area"] }));
    expect(areasOf(zones, { zoneId: "z1" })).toEqual(["Old Kano Road"]);
    expect(zoneOfProperty(zones, { area: "Old Kano Road" })).toBe("z1");
    expect(zoneOfProperty(zones, { area: "Old Kano Road", zoneId: "z2" })).toBe("z2");
  });
});
