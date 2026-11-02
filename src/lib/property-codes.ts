import type { HouseCondition, ListingKind, Property, PropertyType } from "./types";

export const SALE_HOUSE_CONDITIONS: HouseCondition[] = ["Completed", "Semi-completed", "Incomplete"];
export const RENT_HOUSE_CONDITIONS: HouseCondition[] = ["Completed", "Semi-completed"];

export function houseConditions(listing: ListingKind | undefined): HouseCondition[] {
  return listing === "Rent" ? RENT_HOUSE_CONDITIONS : SALE_HOUSE_CONDITIONS;
}

const CAT: Record<Exclude<PropertyType, "House/Villa">, string> = {
  "Residential Land": "RL",
  "Commercial Land": "CL",
  Shop: "SH",
  Farm: "FM",
};
const HOUSE: Record<HouseCondition, string> = { Completed: "HC", "Semi-completed": "HS", Incomplete: "HI" };

/** Category prefix, e.g. RHM-S-HC- (sale, completed house) or RHM-R-SH- (rent, shop). */
export function codePrefix(p: Pick<Property, "type" | "listing" | "condition">): string {
  const side = p.listing === "Rent" ? "R" : "S";
  const cat = p.type === "House/Villa" ? HOUSE[p.condition ?? "Completed"] : CAT[p.type];
  return `RHM-${side}-${cat}-`;
}

/** Next free code in this category, e.g. RHM-S-HC-004. */
export function nextCode(p: Pick<Property, "type" | "listing" | "condition">, existing: Pick<Property, "ref">[]): string {
  const prefix = codePrefix(p);
  const used = existing.filter((x) => x.ref.startsWith(prefix)).map((x) => Number(x.ref.slice(prefix.length)) || 0);
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(3, "0")}`;
}

export function isCodeTaken(code: string, existing: Pick<Property, "ref" | "id">[], selfId: string): boolean {
  const c = code.trim().toUpperCase();
  return existing.some((x) => x.ref.toUpperCase() === c && x.id !== selfId);
}
