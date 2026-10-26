import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { COMPANY } from "@/lib/format";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Rahama Land & Property — Azare Office" },
      { name: "description", content: "Call, WhatsApp or visit Rahama Land and Property Development Ltd. in Azare, Bauchi State." },
      { property: "og:title", content: "Contact Rahama Land & Property" },
      { property: "og:description", content: "Phone, WhatsApp and office address in Azare, Bauchi State." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const items = [
    { icon: MapPin, l: "Office", v: COMPANY.address },
    { icon: Phone, l: "Phone", v: COMPANY.phones.join(" · ") },
    { icon: Mail, l: "Email", v: COMPANY.email },
    { icon: Clock, l: "Hours", v: COMPANY.hours },
  ];
  return (
    <PublicLayout>
      <PageHero eyebrow="Contact" title="Let's talk about your next property" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div className="space-y-5">
          {items.map((i) => (
            <div key={i.l} className="flex gap-4 rounded-xl border bg-card p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-accent"><i.icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-muted-foreground">{i.l}</p><p className="font-semibold">{i.v}</p></div>
            </div>
          ))}
          <WhatsAppButton className="w-full" message="Hello Rahama Land & Property, I have an enquiry." />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <h2 className="mb-5 text-2xl font-bold">Send us a message</h2>
          <EnquiryForm />
        </div>
      </div>
    </PublicLayout>
  );
}
