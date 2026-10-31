import { describe, expect, it } from "vitest";
import { convertSqm, PLOT_SQM, polygonAreaSqm, validateBoundary, type LatLng } from "./measurements";

describe("land measurement", () => {
  it("one standard plot (50ft x 100ft) is about 464.5 m²", () => {
    expect(PLOT_SQM).toBeCloseTo(464.5, 1);
    expect(convertSqm(PLOT_SQM, "sqft")).toBeCloseTo(5000, 0);
    expect(convertSqm(PLOT_SQM, "plots")).toBeCloseTo(1, 5);
  });
  it("converts m² to hectares and acres", () => {
    expect(convertSqm(10000, "hectares")).toBe(1);
    expect(convertSqm(4046.8564224, "acres")).toBeCloseTo(1, 6);
  });
  it("measures a ~100m x 100m square near Azare as ~1 hectare", () => {
    const dLat = 100 / 111320;
    const dLng = 100 / (111320 * Math.cos((11.6738 * Math.PI) / 180));
    const sq: LatLng[] = [[11.6738, 10.1878], [11.6738 + dLat, 10.1878], [11.6738 + dLat, 10.1878 + dLng], [11.6738, 10.1878 + dLng]];
    expect(polygonAreaSqm(sq)).toBeGreaterThan(9900);
    expect(polygonAreaSqm(sq)).toBeLessThan(10100);
  });
  it("rejects boundaries with fewer than 3 points or duplicates", () => {
    expect(validateBoundary([[11, 10], [11.001, 10]])).not.toBeNull();
    expect(validateBoundary([[11, 10], [11, 10], [11.001, 10.001]])).not.toBeNull();
  });
});

import { perimeterFt, sideLengthsFt, simplifyBoundary, sizeFromArea } from "./measurements";

describe("walk-the-field measurements", () => {
  // One standard plot: 50 ft wide x 100 ft long near Azare Central.
  const ftToLat = (ft: number) => ft / 3.28084 / 111320;
  const ftToLng = (ft: number) => ft / 3.28084 / (111320 * Math.cos((11.6738 * Math.PI) / 180));
  const plot: LatLng[] = [[11.6738, 10.1878], [11.6738, 10.1878 + ftToLng(50)], [11.6738 + ftToLat(100), 10.1878 + ftToLng(50)], [11.6738 + ftToLat(100), 10.1878]];

  it("reports each side of a 50x100 ft plot in feet", () => {
    const sides = sideLengthsFt(plot);
    expect(sides[0]).toBeCloseTo(50, 0);
    expect(sides[1]).toBeCloseTo(100, 0);
    expect(perimeterFt(plot)).toBeCloseTo(300, 0);
  });
  it("auto-fills 1 plot for a 50x100 ft boundary", () => {
    expect(sizeFromArea(polygonAreaSqm(plot), "plots")).toBeCloseTo(1, 1);
  });
  it("reduces a walked track back to its 4 corners", () => {
    const track: LatLng[] = [];
    for (let i = 0; i < 4; i++) {
      const a = plot[i]!, b = plot[(i + 1) % 4]!;
      for (let t = 0; t < 10; t++) track.push([a[0] + ((b[0] - a[0]) * t) / 10, a[1] + ((b[1] - a[1]) * t) / 10]);
    }
    track.push(plot[0]!);
    expect(simplifyBoundary(track)).toHaveLength(4);
  });
});
