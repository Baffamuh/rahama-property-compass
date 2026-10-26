import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Eye, Target } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { COMPANY } from "@/lib/format";
import { IMAGES } from "@/lib/sample-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Rahama Land and Property Development Ltd. — RC 9871926" },
      { name: "description", content: "Learn about Rahama Land and Property Development Ltd., a registered real-estate company in Azare, Bauchi State." },
      { property: "og:title", content: "About Rahama Land & Property" },
      { property: "og:description", content: "Registered real-estate developer in Azare, Bauchi State. RC 9871926." },
    ],
  }),
  component: About,
});

const LEADERS = [
  { name: "Managing Director", role: "Founder & CEO", bio: "Leads company strategy, land acquisition and client relationships." },
  { name: "Head of Projects", role: "Property Development", bio: "Oversees design, construction and quality across all builds." },
  { name: "Documentation Officer", role: "Titles & Compliance", bio: "Manages survey plans, C of O processing and verification." },
];

function About() {
  return (
    <PublicLayout>
      <PageHero eyebrow="About us" title={COMPANY.name} subtitle="Building trust in land ownership across Azare and Bauchi State." />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Who we are</h2>
          <p className="mt-4 text-muted-foreground">Rahama Land and Property Development Ltd. is a real-estate company headquartered in Azare, Bauchi State. We sell verified residential and commercial land, develop quality homes, and help families secure proper title documents.</p>
          <p className="mt-3 text-muted-foreground">Our office is open for walk-in visits, and every client is welcome to inspect a property before making any payment.</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border bg-card p-4">
            <BadgeCheck className="h-8 w-8 text-primary" />
            <div><p className="text-xs text-muted-foreground">Registered with the Corporate Affairs Commission</p><p className="font-bold">RC NO. {COMPANY.rc}</p></div>
          </div>
        </div>
        <img src={IMAGES.house} alt="Bungalow by Rahama" loading="lazy" width={1200} height={800} className="rounded-2xl shadow-lg" />
      </section>
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-2">
          <div className="rounded-xl bg-card p-8"><Target className="h-8 w-8 text-primary" /><h3 className="mt-3 text-xl font-bold">Our mission</h3><p className="mt-2 text-muted-foreground">To make land and home ownership in Northern Nigeria simple, transparent and secure for every family.</p></div>
          <div className="rounded-xl bg-card p-8"><Eye className="h-8 w-8 text-primary" /><h3 className="mt-3 text-xl font-bold">Our vision</h3><p className="mt-2 text-muted-foreground">To be Bauchi State's most trusted name in land sales and property development.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold">Leadership</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {LEADERS.map((l) => (
            <div key={l.name} className="rounded-xl border bg-card p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-accent">{l.name.split(" ").map((w) => w[0]).join("")}</div>
              <h3 className="mt-4 font-semibold">{l.name}</h3>
              <p className="text-sm text-primary">{l.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{l.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
