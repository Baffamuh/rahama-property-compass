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
