import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PropertyCard } from "@/components/site/PropertyCard";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IMAGES } from "@/lib/sample-data";
import { SERVICES } from "@/lib/services";
import { useStore } from "@/lib/store";
import { COMPANY } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rahama Land & Property — Land & Houses for Sale in Azare, Bauchi" },
      { name: "description", content: "Buy verified land plots and quality homes in Azare and Bauchi State. Rahama Land and Property Development Ltd., RC 9871926." },
      { property: "og:title", content: "Rahama Land & Property — Azare, Bauchi" },
      { property: "og:description", content: "Verified land plots and quality homes in Azare and Bauchi State." },
    ],
  }),
  component: Home,
});

const BUDGETS = [
  { v: "0-5000000", l: "Under ₦5M" },
  { v: "5000000-20000000", l: "₦5M – ₦20M" },
  { v: "20000000-50000000", l: "₦20M – ₦50M" },
  { v: "50000000-1000000000", l: "Above ₦50M" },
];

function Home() {
  const properties = useStore((s) => s.properties);
  const featured = properties.filter((p) => p.featured && (p.status === "Published" || p.status === "Reserved")).slice(0, 6);
  const navigate = useNavigate();
  const [type, setType] = useState("all");
  const [loc, setLoc] = useState("all");
  const [budget, setBudget] = useState("all");

  const search = () => {
    const [min, max] = budget === "all" ? [undefined, undefined] : budget.split("-").map(Number);
    navigate({ to: "/properties", search: { type: type === "all" ? undefined : type, location: loc === "all" ? undefined : loc, min, max } });
  };

  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden">
        <img src={IMAGES.hero} alt="Estate in Azare at sunset" width={1600} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 text-primary-foreground md:pb-28 md:pt-36">
          <p className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-bold uppercase tracking-widest backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-accent" /> RC NO. {COMPANY.rc}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Own land and property in <span className="text-accent">Azare & Bauchi</span> with confidence.
          </h1>
          <p className="mt-5 max-w-xl text-lg opacity-90">Verified plots, quality homes and honest title guidance from a registered local developer.</p>

          <div className="mt-10 grid gap-3 rounded-2xl bg-card p-4 text-card-foreground shadow-2xl md:grid-cols-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Property type"><SelectValue placeholder="Property type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="Residential Land">Residential Land</SelectItem>
                <SelectItem value="Commercial Land">Commercial Land</SelectItem>
                <SelectItem value="House/Villa">House / Villa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={loc} onValueChange={setLoc}>
              <SelectTrigger aria-label="Location"><SelectValue placeholder="Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any location</SelectItem>
                <SelectItem value="Azare">Azare</SelectItem>
                <SelectItem value="Bauchi">Bauchi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger aria-label="Budget"><SelectValue placeholder="Budget" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any budget</SelectItem>
                {BUDGETS.map((b) => <SelectItem key={b.v} value={b.v}>{b.l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="lg" onClick={search}>Search properties</Button>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
          {[["250+", "Plots allocated"], ["40+", "Homes delivered"], ["500+", "Happy clients"], ["100%", "Verified titles"]].map(([n, l]) => (
            <div key={l}><p className="font-display text-3xl font-extrabold text-primary md:text-4xl">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Featured listings</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Hand-picked land & homes</h2>
          </div>
          <Link to="/properties" className="flex items-center gap-1 font-semibold text-primary">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <h2 className="text-3xl font-bold md:text-4xl">What we do</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl bg-card p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-accent"><s.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <img src={IMAGES.villa} alt="Duplex built by Rahama" loading="lazy" width={1200} height={800} className="rounded-2xl shadow-lg" />
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">About Rahama</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">A registered, local developer you can visit.</h2>
          <p className="mt-4 text-muted-foreground">{COMPANY.name} is headquartered in Azare and serves buyers across Bauchi State and the diaspora. Every plot we sell is surveyed and every document is checked before it reaches you.</p>
          <Button asChild variant="outline" className="mt-6"><Link to="/about">Learn more about us</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-10 text-primary-foreground md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Ready to inspect a property?</h2>
            <p className="mt-2 opacity-85">Book a free site visit or ask us anything on WhatsApp.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButton message="Hello Rahama Land & Property, I would like to book a site inspection." />
            <Button asChild variant="secondary" size="lg"><Link to="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
