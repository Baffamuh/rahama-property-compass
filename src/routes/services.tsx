import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Our Services — Land Sales, Development & Title Documentation | Rahama" },
      { name: "description", content: "Land sales, property development, title documentation and free site inspections in Azare and Bauchi State." },
      { property: "og:title", content: "Services — Rahama Land & Property" },
      { property: "og:description", content: "Land sales, development, C of O documentation and site inspections." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <PublicLayout>
      <PageHero eyebrow="Services" title="Everything you need to own property safely" subtitle="One trusted team from first inspection to final title document." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <div key={s.title} className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-accent"><s.icon className="h-7 w-7" /></div>
              <span className="font-display text-5xl font-extrabold text-secondary">0{i + 1}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">{s.title}</h2>
            <p className="mt-2 text-muted-foreground">{s.text}</p>
            <ul className="mt-5 space-y-2">
              {s.points.map((p) => <li key={p} className="flex gap-2"><Check className="h-5 w-5 text-primary" />{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 text-center">
        <Button asChild size="lg"><Link to="/contact">Talk to our team</Link></Button>
      </div>
    </PublicLayout>
  );
}
