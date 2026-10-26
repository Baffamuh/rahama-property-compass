import type { Property } from "./types";

export const COMPANY = {
  name: "Rahama Land and Property Development Ltd.",
  short: "Rahama Land & Property",
  rc: "9871926",
  address: "No. 12, Old Kano Road, Azare, Katagum LGA, Bauchi State, Nigeria",
  phones: ["+234 806 378 4070", "+234 703 780 7271"],
  whatsapp: "2348063784070",
  email: "rahmalapd@gmail.com",
  hours: "Mon – Sat, 8:00am – 5:00pm",
};

export function formatNaira(amount: number): string {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

export function formatSize(size: number, unit: Property["sizeUnit"]): string {
  const label = unit === "plots" ? (size === 1 ? "plot" : "plots") : unit === "sqm" ? "sqm" : size === 1 ? "hectare" : "hectares";
  return `${size.toLocaleString("en-NG")} ${label}`;
}

export function whatsappLink(message: string, number: string = COMPANY.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsappMessage(p: Pick<Property, "title" | "ref">): string {
  return `Hello Rahama Land & Property, I am interested in "${p.title}" (Ref: ${p.ref}). Please share more details and availability for a site inspection.`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function isPublic(status: Property["status"]): boolean {
  return status === "Published" || status === "Reserved" || status === "Sold";
}
