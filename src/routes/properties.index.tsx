import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SlidersHorizontal } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { isPublic } from "@/lib/format";
import { areasOf, townsOf, zoneOfProperty } from "@/lib/locations";

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  listing: z.enum(["Sale", "Rent"]).optional(),
  location: z.string().optional(),
  area: z.string().optional(),
  zone: z.string().optional(),
  unit: z.string().optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Land, Houses, Shops & Farms for Sale or Rent — Rahama Land & Property" },
      { name: "description", content: "Buy or rent residential and commercial land, houses, shops and farms in Azare and Bauchi State. Filter by zone, type, price and size." },
      { property: "og:title", content: "Properties for Sale & Rent — Rahama Land & Property" },
      { property: "og:description", content: "Land, houses, shops and farms in Azare and Bauchi State." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalogue,
});

function Catalogue() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });
  const properties = useStore((st) => st.properties);
  const zones = useStore((st) => st.zones);
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = [s.type, s.listing, s.location, s.zone, s.area, s.unit, s.min, s.max].filter((v) => v != null).length;
  const setS = (patch: Partial<typeof s>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const list = useMemo(
    () =>
      properties.filter((p) => {
        if (!isPublic(p.status)) return false;
        if (s.q && !`${p.title} ${p.ref} ${p.area}`.toLowerCase().includes(s.q.toLowerCase())) return false;
        if (s.type && p.type !== s.type) return false;
        if (s.listing && (p.listing ?? "Sale") !== s.listing) return false;
        if (s.location && p.location !== s.location) return false;
        if (s.area && p.area !== s.area) return false;
        if (s.zone && zoneOfProperty(zones, p) !== s.zone) return false;
        if (s.unit && p.sizeUnit !== s.unit) return false;
        if (s.min != null && p.price < s.min) return false;
        if (s.max != null && p.price > s.max) return false;
        return true;
      }),
    [properties, s, zones],
  );

  const sel = (value: string | undefined, onChange: (v: string | undefined) => void, placeholder: string, items: [string, string][]) => (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger aria-label={placeholder}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {items.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <PublicLayout>
      <PageHero eyebrow="Property catalogue" title="Land, homes, shops & farms" subtitle="Buy or rent — verified listings across Azare and Bauchi State." />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex gap-2">
          <Input className="h-12 flex-1" placeholder="Search title, area or ref…" value={s.q ?? ""} onChange={(e) => setS({ q: e.target.value || undefined })} />
          <Button variant="outline" className="h-12 md:hidden" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}>
            <SlidersHorizontal className="h-4 w-4" />Filters{activeCount ? ` (${activeCount})` : ""}
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1 sm:max-w-md">
          {([[undefined, "All"], ["Sale", "For Sale"], ["Rent", "For Rent"]] as const).map(([v, l]) => (
            <button key={l} onClick={() => setS({ listing: v })} className={`rounded-lg px-3 py-2 text-sm font-semibold ${s.listing === v ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {([[undefined, "All types"], ["Residential Land", "Residential land"], ["Commercial Land", "Commercial land"], ["House/Villa", "Houses"], ["Shop", "Shops"], ["Farm", "Farms"]] as const).map(([v, l]) => (
            <button key={l} onClick={() => setS({ type: v })} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${s.type === v ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>
          ))}
        </div>
        <div className={`mt-3 gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 md:grid md:grid-cols-3 lg:grid-cols-6 ${showFilters ? "grid" : "hidden"}`}>
          {sel(s.location, (v) => setS({ location: v, zone: undefined, area: undefined }), "All towns", townsOf(zones).map((t) => [t, t]))}
          {sel(s.zone, (v) => setS({ zone: v, area: undefined }), "All zones", zones.filter((z) => !s.location || z.town === s.location).map((z) => [z.id, z.name]))}
          {sel(s.area, (v) => setS({ area: v }), "All areas", areasOf(zones, { town: s.location, zoneId: s.zone }).map((a) => [a, a]))}
          {sel(s.unit, (v) => setS({ unit: v }), "Any size unit", [["plots", "Plots"], ["sqm", "Square metres"], ["hectares", "Hectares"]])}
          <div className="flex gap-2 lg:col-span-2">
            <Input type="number" inputMode="numeric" placeholder="Min ₦" value={s.min ?? ""} onChange={(e) => setS({ min: e.target.value ? Number(e.target.value) : undefined })} />
            <Input type="number" inputMode="numeric" placeholder="Max ₦" value={s.max ?? ""} onChange={(e) => setS({ max: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />{list.length} {list.length === 1 ? "property" : "properties"} found</span>
          <Button variant="ghost" size="sm" disabled={!activeCount && !s.q} onClick={() => navigate({ search: {}, replace: true })}>Clear filters</Button>
        </div>
        {list.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed p-16 text-center">
            <p className="text-lg font-semibold">No properties match these filters.</p>
            <p className="text-muted-foreground">Try widening your budget or location.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
