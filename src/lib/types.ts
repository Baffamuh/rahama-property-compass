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
