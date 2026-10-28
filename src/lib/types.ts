export type PropertyType = "Residential Land" | "Commercial Land" | "House/Villa";
export type PropertyStatus = "Draft" | "Published" | "Reserved" | "Sold" | "Archived";
export type SizeUnit = "plots" | "sqm" | "hectares";
export type EnquiryStatus = "New" | "Contacted" | "Viewing Scheduled" | "Closed";

export interface Property {
  id: string;
  slug: string;
  ref: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  location: string;
  area: string;
  zoneId?: string;
  subZoneId?: string | undefined;
  price: number;
  size: number;
  sizeUnit: SizeUnit;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  features: string[];
  images: string[];
  featured: boolean;
  createdAt: string;
  /** Map boundary corners [lat, lng]. Estimate only — not a certified survey. */
  boundary?: [number, number][] | undefined;
  mapAreaSqm?: number | undefined;
  areaDisplayUnit?: "sqft" | "sqm" | "plots" | "hectares" | "acres";
  /** Verified area from a licensed surveyor, recorded separately. */
  surveyAreaSqm?: number | undefined;
  surveyRef?: string | undefined;
  surveySource?: string | undefined;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  propertyRef?: string;
  propertyTitle?: string;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  text: string;
  at: string;
}

export interface SubZone {
  id: string;
  name: string;
  areas: string[];
}

export interface Zone {
  id: string;
  name: string;
  town: string;
  subZones: SubZone[];
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string | undefined;
  zoneId?: string | undefined;
  active: boolean;
  joinedAt: string;
}

export type PaymentMethod = "Bank Transfer" | "Cash" | "Cheque" | "POS";

export interface Sale {
  id: string;
  receiptNo: string;
  agentId: string;
  propertyId: string;
  propertyRef: string;
  propertyTitle: string;
  buyerName: string;
  buyerPhone: string;
  price: number;
  amountPaid: number;
  commission: number;
  method: PaymentMethod;
  date: string;
  status: "Completed" | "Cancelled";
  createdAt: string;
}
