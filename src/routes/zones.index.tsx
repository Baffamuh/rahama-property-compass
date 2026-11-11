import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { useStore } from "@/lib/store";
import { isPublic } from "@/lib/format";
import { areasOf, zoneOfProperty } from "@/lib/locations";

export const Route = createFileRoute("/zones/")({
  head: () => ({
    meta: [
      { title: "Browse Properties by Zone — Rahama Land & Property" },
      { name: "description", content: "Choose a zone in Azare or Bauchi to see every land plot, house, farm and shop listed there." },
      { property: "og:title", content: "Browse by Zone — Rahama Land & Property" },
      { property: "og:description", content: "All listings grouped by zone in Azare and Bauchi State." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ZonesPage,
});

function ZonesPage() {
  const zones = useStore((s) => s.zones);
  const properties = useStore((s) => s.properties).filter((p) => isPublic(p.status));
  return (
    <PublicLayout>
      <PageHero eyebrow="Azare zones" title="Browse Zone 1 to Zone 6" subtitle="Land, houses, shops and farms in Azare." />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((z) => {
          const count = properties.filter((p) => zoneOfProperty(zones, p) === z.id).length;
          return (
            <Link key={z.id} to="/zones/$zoneId" params={{ zoneId: z.id }} className="group min-w-0 rounded-lg border bg-card p-6 shadow-sm transition hover:border-primary hover:shadow-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{z.town}</div>
              <h2 className="mt-2 text-xl font-bold">{z.name}</h2>
              <p className="mt-1 break-words text-sm text-muted-foreground">{areasOf(zones, { zoneId: z.id }).join(" · ") || "No areas added yet"}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">{count} {count === 1 ? "property" : "properties"}</span>
                <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </PublicLayout>
  );
}
