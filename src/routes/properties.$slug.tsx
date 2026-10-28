import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bath, BedDouble, Check, Hash, MapPin, Ruler, Tag } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { StatusBadge } from "@/components/site/StatusBadge";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { InspectionBooking, InstallmentCalculator, TitleBadges } from "@/components/site/PropertyExtras";
import { MeasurementSummary } from "@/components/site/LandMeasurement";
import { useStore } from "@/lib/store";
import { formatNaira, formatSize, isPublic, propertyWhatsappMessage } from "@/lib/format";
import { sampleProperties } from "@/lib/sample-data";

export const Route = createFileRoute("/properties/$slug")({
  head: ({ params }) => {
    const p = sampleProperties.find((x) => x.slug === params.slug);
    const title = p ? `${p.title} — ${formatNaira(p.price)} | Rahama Land & Property` : "Property — Rahama Land & Property";
    const desc = p ? `${p.type} in ${p.area}. Ref ${p.ref}. ${p.description.slice(0, 120)}` : "Property details from Rahama Land & Property.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }] };
  },
  component: Detail,
});

function Detail() {
  const { slug } = Route.useParams();
  const properties = useStore((s) => s.properties);
  const p = properties.find((x) => x.slug === slug && isPublic(x.status));
  const [active, setActive] = useState(0);

  if (!p)
    return (
      <PublicLayout>
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <h1 className="text-3xl font-bold">Property not found</h1>
          <p className="mt-2 text-muted-foreground">This listing may have been removed or is no longer available.</p>
          <Link to="/properties" className="mt-6 inline-block font-semibold text-primary">Browse all properties</Link>
        </div>
      </PublicLayout>
    );

  const facts = [
    { icon: Hash, l: "Reference", v: p.ref },
    { icon: Tag, l: "Type", v: p.type },
    { icon: Ruler, l: "Size", v: formatSize(p.size, p.sizeUnit) },
    { icon: MapPin, l: "Area", v: p.area },
    ...(p.bedrooms ? [{ icon: BedDouble, l: "Bedrooms", v: String(p.bedrooms) }] : []),
    ...(p.bathrooms ? [{ icon: Bath, l: "Bathrooms", v: String(p.bathrooms) }] : []),
  ];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/properties" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All properties</Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl">
              <img src={p.images[active]} alt={p.title} width={1200} height={800} className="aspect-[3/2] w-full object-cover" />
            </div>
            {p.images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {p.images.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`} className={`shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-primary" : "border-transparent opacity-70"}`}>
                    <img src={img} alt="" loading="lazy" className="h-20 w-28 object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <StatusBadge status={p.status} />
              <span className="font-mono text-sm text-muted-foreground">{p.ref}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{p.area}, {p.location === "Azare" ? "Bauchi State" : "Bauchi State"}</p>
            <p className="mt-4 text-3xl font-extrabold text-primary">{formatNaira(p.price)}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.l}>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><f.icon className="h-3.5 w-3.5" />{f.l}</p>
                  <p className="font-semibold">{f.v}</p>
                </div>
              ))}
            </div>

            {(p.mapAreaSqm || p.surveyAreaSqm) ? <><h2 className="mt-10 text-xl font-bold">Land measurement</h2><div className="mt-3"><MeasurementSummary p={p} /></div></> : null}

            <h2 className="mt-10 text-xl font-bold">Title & documentation</h2>
            <div className="mt-3"><TitleBadges p={p} /></div>

            <h2 className="mt-10 text-xl font-bold">About this property</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{p.description}</p>

            <h2 className="mt-10 text-xl font-bold">Features</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-5 w-5 text-primary" />{f}</li>)}
            </ul>

            <h2 className="mt-10 text-xl font-bold">Location</h2>
            <p className="mt-3 text-muted-foreground">Located at {p.area}. Exact coordinates and directions are shared during site inspection booking.</p>

            {p.status !== "Sold" && <div className="mt-10"><InstallmentCalculator price={p.price} /></div>}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold">Interested in this property?</h2>
              <p className="mb-4 text-sm text-muted-foreground">Fastest response is on WhatsApp.</p>
              <WhatsAppButton className="w-full" message={propertyWhatsappMessage(p)} />
              {p.status !== "Sold" && <div className="mt-3" id="book-inspection"><InspectionBooking p={p} /></div>}
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or send an enquiry<span className="h-px flex-1 bg-border" /></div>
              <EnquiryForm propertyRef={p.ref} propertyTitle={p.title} defaultMessage={`I'm interested in ${p.title} (${p.ref}).`} />
            </div>
          </aside>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-background/95 p-3 shadow-lg backdrop-blur lg:hidden">
        {p.status !== "Sold" && <a href="#book-inspection" className="inline-flex flex-1 items-center justify-center rounded-md border border-primary px-3 py-3 text-sm font-semibold text-primary">Book inspection</a>}
        <WhatsAppButton className="flex-1 px-3 text-sm" label="WhatsApp" message={propertyWhatsappMessage(p)} />
      </div>
      <div className="h-20 lg:hidden" />
    </PublicLayout>
  );
}
