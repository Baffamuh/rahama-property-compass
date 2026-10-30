import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useStore } from "@/lib/store";
import { isPublic } from "@/lib/format";
import { subZoneOfProperty, zoneOfProperty } from "@/lib/locations";

export const Route = createFileRoute("/zones/$zoneId")({
  head: () => ({
    meta: [
      { title: "Properties in this Zone — Rahama Land & Property" },
      { name: "description", content: "All land, houses, farms and shops listed in this zone by Rahama Land and Property Development Ltd." },
      { property: "og:title", content: "Zone Listings — Rahama Land & Property" },
      { property: "og:description", content: "See every property listed in this zone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ZonePage,
});

function ZonePage() {
  const { zoneId } = Route.useParams();
  const zones = useStore((s) => s.zones);
  const all = useStore((s) => s.properties);
  const [sub, setSub] = useState<string | null>(null);
  const zone = zones.find((z) => z.id === zoneId);

  if (!zone) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Zone not found</h1>
          <Link to="/zones" className="mt-4 inline-block text-primary underline">See all zones</Link>
        </div>
      </PublicLayout>
    );
  }

  const inZone = all.filter(isPublic).filter((p) => zoneOfProperty(zones, p) === zone.id);
  const list = sub ? inZone.filter((p) => subZoneOfProperty(zones, p) === sub) : inZone;
  const chip = (active: boolean) => `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`;

  return (
    <PublicLayout>
      <PageHero eyebrow={zone.town} title={zone.name} subtitle={`${inZone.length} ${inZone.length === 1 ? "property" : "properties"} listed in this zone.`} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/zones" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="h-4 w-4" />All zones</Link>
        {zone.subZones.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <button className={chip(sub === null)} onClick={() => setSub(null)}>All</button>
            {zone.subZones.map((s) => (
              <button key={s.id} className={chip(sub === s.id)} onClick={() => setSub(s.id)}>{s.name}</button>
            ))}
          </div>
        )}
        {list.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center text-muted-foreground">No properties listed here yet.</div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
