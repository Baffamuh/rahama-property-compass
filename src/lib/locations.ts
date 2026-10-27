import type { Zone } from "./types";

// Starting location tree; admins can add unlimited zones, sub-zones and areas.
export const sampleZones: Zone[] = [
  {
    id: "z-azare", name: "Azare Central", town: "Azare",
    subZones: [
      { id: "sz-gra", name: "GRA", areas: ["GRA Azare"] },
      { id: "sz-roads", name: "Highway Corridors", areas: ["Jama'are Road, Azare", "Potiskum Road, Azare"] },
      { id: "sz-fu", name: "University Axis", areas: ["Federal University Axis, Azare"] },
    ],
  },
  {
    id: "z-bauchi", name: "Bauchi Metro", town: "Bauchi",
    subZones: [
      { id: "sz-yelwa", name: "Yelwa", areas: ["Yelwa, Bauchi"] },
      { id: "sz-city", name: "Old City", areas: ["Kofar Wambai, Bauchi"] },
      { id: "sz-jos", name: "Jos Road", areas: ["Bauchi–Jos Road, Bauchi"] },
    ],
  },
];

export function townsOf(zones: Zone[]): string[] {
  return [...new Set(zones.map((z) => z.town))];
}

export function areasOf(zones: Zone[], filter: { town?: string; zoneId?: string; subZoneId?: string } = {}): string[] {
  const out: string[] = [];
  for (const z of zones) {
    if (filter.town && z.town !== filter.town) continue;
    if (filter.zoneId && z.id !== filter.zoneId) continue;
    for (const s of z.subZones) {
      if (filter.subZoneId && s.id !== filter.subZoneId) continue;
      out.push(...s.areas);
    }
  }
  return [...new Set(out)];
}

export function findArea(zones: Zone[], area: string) {
  for (const z of zones) for (const s of z.subZones) if (s.areas.includes(area)) return { zone: z, subZone: s };
  return null;
}
