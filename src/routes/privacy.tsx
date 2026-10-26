import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PublicLayout } from "@/components/site/PublicLayout";
import { COMPANY } from "@/lib/format";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Disclaimer — Rahama Land & Property" },
      { name: "description", content: "How Rahama Land and Property Development Ltd. handles your information, plus our listing disclaimer." },
      { property: "og:title", content: "Privacy & Disclaimer — Rahama" },
      { property: "og:description", content: "Privacy policy and legal disclaimer." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PublicLayout>
      <PageHero eyebrow="Legal" title="Privacy policy & disclaimer" />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-muted-foreground">
        <section><h2 className="text-xl font-bold text-foreground">Information we collect</h2><p className="mt-2">When you send an enquiry we collect your name, phone number, optional email and message so our team can respond. We do not sell your information.</p></section>
        <section><h2 className="text-xl font-bold text-foreground">How we use it</h2><p className="mt-2">Your details are used only to respond to your enquiry, arrange site inspections and share relevant property updates you request.</p></section>
        <section><h2 className="text-xl font-bold text-foreground">Listing disclaimer</h2><p className="mt-2">Prices, sizes and availability are provided in good faith and may change without notice. Photos may be illustrative. Buyers should inspect each property and review all title documents before payment. No listing constitutes a binding offer until a written agreement is signed with {COMPANY.name}.</p></section>
        <section><h2 className="text-xl font-bold text-foreground">Contact</h2><p className="mt-2">For privacy questions, contact {COMPANY.email} or visit our office at {COMPANY.address}. RC NO. {COMPANY.rc}.</p></section>
      </article>
    </PublicLayout>
  );
}
