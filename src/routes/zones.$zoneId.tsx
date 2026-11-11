import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { useStore } from "@/lib/store";
import { isPublic } from "@/lib/format";
import { areasOf, zoneOfProperty } from "@/lib/locations";
import { Button } from "@/components/ui/button";

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
  const [area, setArea] = useState<string | null>(null);
  const ready = useStore((s) => s.ready);
  const zone = zones.find((z) => z.id === zoneId);

  if (!zone) {
    if (!ready) return <PublicLayout><div className="mx-auto max-w-7xl px-4 py-24 text-muted-foreground">Loading zone…</div></PublicLayout>;
    return (
      <PublicLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Zone not found</h1>
          <Link to="/zones" className="mt-4 inline-block text-primary underline">See all zones</Link>
        </div>
      </PublicLayout>
    );
  }

  const inZone = all.filter((p) => isPublic(p.status)).filter((p) => zoneOfProperty(zones, p) === zone.id);
  const list = area ? inZone.filter((p) => p.area === area) : inZone;
  const areas = [...new Set([...areasOf(zones, { zoneId: zone.id }), ...inZone.map((p) => p.area).filter(Boolean)])];
  const chip = (active: boolean) => `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`;

  return (
    <PublicLayout>
      <PageHero eyebrow={zone.town} title={zone.name} subtitle={`${inZone.length} ${inZone.length === 1 ? "property" : "properties"} listed in this zone.`} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/zones" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="h-4 w-4" />All zones</Link>
        {areas.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 pb-2" aria-label="Filter by area">
            <Button variant="outline" className={chip(area === null)} aria-pressed={area === null} onClick={() => setArea(null)}>All areas</Button>
            {areas.map((a) => (
              <Button variant="outline" key={a} className={`${chip(area === a)} max-w-full whitespace-normal h-auto`} aria-pressed={area === a} onClick={() => setArea(a)}>{a}</Button>
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
