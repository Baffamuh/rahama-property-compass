import hero from "@/assets/hero.jpg";
import land from "@/assets/land.jpg";
import house from "@/assets/house.jpg";
import villa from "@/assets/villa.jpg";
import type { Activity, Enquiry, Property } from "./types";

export const IMAGES = { hero, land, house, villa };

export const AREAS = [
  "GRA Azare",
  "Jama'are Road, Azare",
  "Potiskum Road, Azare",
  "Federal University Axis, Azare",
  "Yelwa, Bauchi",
  "Kofar Wambai, Bauchi",
  "Bauchi–Jos Road, Bauchi",
];

export const sampleProperties: Property[] = [
  {
    id: "p1", slug: "gra-azare-residential-plot", ref: "RHM-AZR-001",
    title: "Residential Plot, GRA Azare", type: "Residential Land", status: "Published",
    location: "Azare", area: "GRA Azare", price: 4500000, size: 1, sizeUnit: "plots",
    description: "A fully surveyed 50ft × 100ft residential plot in the quiet Government Reserved Area of Azare, minutes from the Federal Medical Centre. Ideal for a family home.",
    features: ["Survey plan available", "Certificate of Occupancy (C of O) in process", "Access road", "Electricity nearby", "Dry, flat terrain"],
    images: [land, hero], featured: true, createdAt: "2026-09-02",
  },
  {
    id: "p2", slug: "jamaare-road-4-bedroom-bungalow", ref: "RHM-AZR-002",
    title: "4-Bedroom Bungalow, Jama'are Road", type: "House/Villa", status: "Published",
    location: "Azare", area: "Jama'are Road, Azare", price: 38000000, size: 650, sizeUnit: "sqm",
    bedrooms: 4, bathrooms: 4,
    description: "Newly built detached bungalow with all rooms en-suite, interlocked compound, boys' quarters and a borehole. Gated and fenced, ready to move in.",
    features: ["All rooms en-suite", "Borehole & overhead tank", "Boys' quarters", "Interlocked compound", "Fenced and gated", "Title: C of O"],
    images: [house, hero], featured: true, createdAt: "2026-09-10",
  },
  {
    id: "p3", slug: "potiskum-road-commercial-land", ref: "RHM-AZR-003",
    title: "Commercial Land, Potiskum Road", type: "Commercial Land", status: "Published",
    location: "Azare", area: "Potiskum Road, Azare", price: 25000000, size: 1800, sizeUnit: "sqm",
    description: "Prime roadside land on the busy Azare–Potiskum highway. Perfect for a filling station, plaza, warehouse or showroom.",
    features: ["Highway frontage", "High traffic area", "Survey plan available", "Suitable for plaza or filling station"],
    images: [land], featured: true, createdAt: "2026-08-21",
  },
  {
    id: "p4", slug: "yelwa-bauchi-5-bedroom-duplex", ref: "RHM-BAU-004",
    title: "5-Bedroom Duplex, Yelwa Bauchi", type: "House/Villa", status: "Reserved",
    location: "Bauchi", area: "Yelwa, Bauchi", price: 85000000, size: 900, sizeUnit: "sqm",
    bedrooms: 5, bathrooms: 6,
    description: "Elegant two-storey duplex with a family lounge, balcony, fitted kitchen and ample parking, close to ATBU Yelwa campus.",
    features: ["Fitted kitchen", "Balcony", "Solar backup", "Parking for 4 cars", "Security post", "Title: C of O"],
    images: [villa, house], featured: true, createdAt: "2026-07-30",
  },
  {
    id: "p5", slug: "federal-university-axis-estate-plots", ref: "RHM-AZR-005",
    title: "Estate Plots, Federal University Axis", type: "Residential Land", status: "Published",
    location: "Azare", area: "Federal University Axis, Azare", price: 3200000, size: 1, sizeUnit: "plots",
    description: "Affordable plots in a planned layout near the Federal University of Health Sciences, Azare. Flexible instalment plan available.",
    features: ["Planned layout", "Instalment payment option", "Survey per plot", "Fast-growing area"],
    images: [land, hero], featured: false, createdAt: "2026-09-15",
  },
  {
    id: "p6", slug: "bauchi-jos-road-farmland", ref: "RHM-BAU-006",
    title: "Agro/Commercial Land, Bauchi–Jos Road", type: "Commercial Land", status: "Published",
    location: "Bauchi", area: "Bauchi–Jos Road, Bauchi", price: 18000000, size: 2, sizeUnit: "hectares",
    description: "Two hectares of fertile land along the Bauchi–Jos road, suitable for agro-processing, a farm estate or a logistics depot.",
    features: ["Road access", "Fertile soil", "Water table nearby", "Clear title"],
    images: [land], featured: false, createdAt: "2026-06-12",
  },
  {
    id: "p7", slug: "kofar-wambai-3-bedroom-bungalow", ref: "RHM-BAU-007",
    title: "3-Bedroom Bungalow, Kofar Wambai", type: "House/Villa", status: "Sold",
    location: "Bauchi", area: "Kofar Wambai, Bauchi", price: 22000000, size: 450, sizeUnit: "sqm",
    bedrooms: 3, bathrooms: 3,
    description: "Compact family bungalow in a well-established neighbourhood of Bauchi town.",
    features: ["Tiled throughout", "Prepaid meter", "Fenced"],
    images: [house], featured: false, createdAt: "2026-05-04",
  },
  {
    id: "p8", slug: "gra-azare-corner-piece", ref: "RHM-AZR-008",
    title: "Corner-Piece Plot, GRA Azare", type: "Residential Land", status: "Draft",
    location: "Azare", area: "GRA Azare", price: 6000000, size: 1, sizeUnit: "plots",
    description: "Corner-piece plot awaiting final survey documentation.",
    features: ["Corner piece", "Two road access"],
    images: [land], featured: false, createdAt: "2026-10-20",
  },
];

export const sampleEnquiries: Enquiry[] = [
  { id: "e1", name: "Aminu Sani", phone: "+234 802 111 2233", email: "aminu.s@example.com", message: "I'd like to inspect the GRA plot this Saturday.", propertyRef: "RHM-AZR-001", propertyTitle: "Residential Plot, GRA Azare", status: "New", notes: "", createdAt: "2026-10-25T10:12:00Z" },
  { id: "e2", name: "Hauwa Musa", phone: "+234 813 444 5566", message: "Is the Jama'are Road bungalow price negotiable?", propertyRef: "RHM-AZR-002", propertyTitle: "4-Bedroom Bungalow, Jama'are Road", status: "Contacted", notes: "Called 24 Oct. Wants to bring husband for viewing.", createdAt: "2026-10-23T14:30:00Z" },
  { id: "e3", name: "Ibrahim Garba", phone: "+234 806 777 8899", email: "igarba@example.com", message: "Interested in roadside land for a filling station.", propertyRef: "RHM-AZR-003", propertyTitle: "Commercial Land, Potiskum Road", status: "Viewing Scheduled", notes: "Site visit fixed for Tue 28 Oct, 10am.", createdAt: "2026-10-20T09:05:00Z" },
  { id: "e4", name: "Fatima Abubakar", phone: "+234 703 222 1100", message: "Do you help with C of O processing for land I already own?", status: "New", notes: "", createdAt: "2026-10-24T16:45:00Z" },
  { id: "e5", name: "Usman Bello", phone: "+234 909 333 4455", message: "Paid deposit for the Yelwa duplex.", propertyRef: "RHM-BAU-004", propertyTitle: "5-Bedroom Duplex, Yelwa Bauchi", status: "Closed", notes: "Reserved. Balance due end of November.", createdAt: "2026-10-02T11:00:00Z" },
];

export const sampleActivity: Activity[] = [
  { id: "a1", text: "New enquiry from Aminu Sani on RHM-AZR-001", at: "2026-10-25T10:12:00Z" },
  { id: "a2", text: "Draft created: Corner-Piece Plot, GRA Azare", at: "2026-10-20T08:00:00Z" },
  { id: "a3", text: "RHM-BAU-004 marked Reserved", at: "2026-10-02T11:20:00Z" },
];
