// Map-based land measurement helpers. Pure maths, runs in the browser, no API.
// Map figures are ESTIMATES — never a certified survey.

export type LatLng = [number, number];
export type AreaUnit = "sqft" | "sqm" | "plots" | "hectares" | "acres";

export const AZARE_CENTRAL: LatLng = [11.6738, 10.1878];
export const SQFT_PER_SQM = 10.7639104;
export const PLOT_SQFT = 50 * 100; // standard Azare plot: 50ft x 100ft
export const PLOT_SQM = PLOT_SQFT / SQFT_PER_SQM; // ≈ 464.5 m²
export const SQM_PER_HECTARE = 10_000;
export const SQM_PER_ACRE = 4046.8564224;

const R = 6378137; // WGS84 radius (m)
const rad = (d: number) => (d * Math.PI) / 180;

/** Geodesic polygon area in m² (spherical excess method, same as Leaflet.draw). */
export function polygonAreaSqm(points: LatLng[]): number {
  if (points.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lng1] = points[i]!;
    const [lat2, lng2] = points[(i + 1) % points.length]!;
    total += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((total * R * R) / 2);
}

export function validateBoundary(points: LatLng[]): string | null {
  if (points.length < 3) return "Mark at least 3 corner points to form a boundary.";
  if (points.some(([a, b]) => !Number.isFinite(a) || !Number.isFinite(b) || Math.abs(a) > 90 || Math.abs(b) > 180)) return "One or more points are invalid.";
  const keys = new Set(points.map(([a, b]) => `${a.toFixed(7)},${b.toFixed(7)}`));
  if (keys.size !== points.length) return "Two points are in the same spot. Remove the duplicate.";
  if (polygonAreaSqm(points) < 1) return "The boundary is too small to measure.";
  return null;
}

export function convertSqm(sqm: number, unit: AreaUnit): number {
  switch (unit) {
    case "sqft": return sqm * SQFT_PER_SQM;
    case "plots": return sqm / PLOT_SQM;
    case "hectares": return sqm / SQM_PER_HECTARE;
    case "acres": return sqm / SQM_PER_ACRE;
    default: return sqm;
  }
}

export const UNIT_LABEL: Record<AreaUnit, string> = { sqft: "sq ft", sqm: "m²", plots: "plots (50×100 ft)", hectares: "hectares", acres: "acres" };

export function formatArea(sqm: number, unit: AreaUnit): string {
  const v = convertSqm(sqm, unit);
  const digits = unit === "sqft" || unit === "sqm" ? 0 : 2;
  return `${v.toLocaleString("en-NG", { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${UNIT_LABEL[unit]}`;
}

export const FT_PER_M = 3.28084;

/** Straight-line ground distance between two points in metres (haversine). */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Length of each side of the closed boundary, in feet (side i runs from point i to point i+1). */
export function sideLengthsFt(points: LatLng[]): number[] {
  if (points.length < 2) return [];
  return points.map((p, i) => distanceM(p, points[(i + 1) % points.length]!) * FT_PER_M).slice(0, points.length < 3 ? 1 : points.length);
}

export function perimeterFt(points: LatLng[]): number {
  return points.length < 3 ? 0 : sideLengthsFt(points).reduce((a, b) => a + b, 0);
}

/** Size to auto-fill on the listing from a measured area. */
export function sizeFromArea(sqm: number, unit: "plots" | "sqm" | "hectares"): number {
  const v = unit === "plots" ? sqm / PLOT_SQM : unit === "hectares" ? sqm / SQM_PER_HECTARE : sqm;
  return Math.round(v * 100) / 100;
}
