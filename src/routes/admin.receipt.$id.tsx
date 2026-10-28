import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import logo from "@/assets/rahama-logo.png.asset.json";
import { useStore } from "@/lib/store";
import { COMPANY, formatNaira } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/receipt/$id")({
  head: () => ({ meta: [{ title: "Official Receipt — Rahama Admin" }, { name: "description", content: "Printable official sales receipt." }, { property: "og:title", content: "Official Receipt — Rahama Admin" }, { property: "og:description", content: "Printable official sales receipt." }] }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { id } = Route.useParams();
  const sale = useStore((s) => s.sales.find((x) => x.id === id));
  const agent = useStore((s) => s.agents.find((a) => a.id === sale?.agentId));
  const property = useStore((s) => s.properties.find((p) => p.id === sale?.propertyId));
  const zone = useStore((s) => s.zones.find((z) => z.id === property?.zoneId));

  if (!sale) return <div className="p-10 text-center"><p className="font-semibold">Receipt not found.</p><Link to="/admin/agents" className="text-primary">Back to sales</Link></div>;
  const balance = Math.max(0, sale.price - sale.amountPaid);
  const rows: [string, string][] = [
    ["Received from", sale.buyerName], ["Buyer phone", sale.buyerPhone || "—"],
    ["Property", sale.propertyTitle], ["Property reference", sale.propertyRef],
    ...(zone ? [["Zone", zone.name] as [string, string]] : []),
    ["Sales agent", agent ? `${agent.name} (${agent.code})` : "—"],
    ["Payment method", sale.method], ["Date of payment", new Date(sale.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to="/admin/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to sales</Link>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" />Print / Save PDF</Button>
      </div>
      <article className="relative overflow-hidden rounded-xl border bg-background p-6 text-foreground shadow-sm md:p-10 print:rounded-none print:border-0 print:shadow-none">
        {sale.status === "Cancelled" && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="-rotate-12 rounded-lg border-4 border-destructive px-6 py-2 text-5xl font-black text-destructive/70">CANCELLED</span></div>}
        <header className="flex flex-col gap-4 border-b-4 border-primary pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={logo.url} alt="Rahama logo" className="h-16 w-auto" />
            <div>
              <p className="font-display text-lg font-bold text-primary">{COMPANY.name}</p>
              <p className="text-xs">RC NO. {COMPANY.rc}</p>
              <p className="text-xs text-muted-foreground">{COMPANY.address}</p>
              <p className="text-xs text-muted-foreground">{COMPANY.phones.join(" · ")} · {COMPANY.email}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-xl font-extrabold uppercase tracking-wide">Official Receipt</p>
            <p className="font-mono text-sm">{sale.receiptNo}</p>
          </div>
        </header>

        <p className="mt-5 text-xs text-muted-foreground">This receipt confirms money received by the company. It is not an invoice or payment request.</p>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => <div key={k} className="border-b border-dashed pb-2"><dt className="text-xs uppercase text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>

        <table className="mt-6 w-full text-sm">
          <tbody className="divide-y">
            <tr><td className="py-2">Total agreed price</td><td className="py-2 text-right font-semibold">{formatNaira(sale.price)}</td></tr>
            <tr><td className="py-2">Amount received (this payment)</td><td className="py-2 text-right font-semibold">{formatNaira(sale.amountPaid)}</td></tr>
            <tr className="bg-primary/5"><td className="p-2 font-bold">Outstanding balance</td><td className="p-2 text-right text-lg font-extrabold text-primary">{formatNaira(balance)}</td></tr>
          </tbody>
        </table>

        <div className="mt-16 grid grid-cols-2 gap-10 text-center text-sm">
          {["Managing Director", "Company Secretary / Legal Adviser"].map((t) => (
            <div key={t}><div className="h-12 border-b border-foreground" /><p className="mt-2 font-semibold">{t}</p><p className="text-xs text-muted-foreground">Signature, date & stamp</p></div>
          ))}
        </div>
        <p className="mt-10 text-center text-[11px] text-muted-foreground">Generated {new Date(sale.createdAt).toLocaleString("en-NG")} · Thank you for choosing {COMPANY.short}.</p>
      </article>
    </div>
  );
}
