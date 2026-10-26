import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CheckCircle2, Inbox, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Rahama Admin" }, { name: "description", content: "Admin overview." }, { property: "og:title", content: "Dashboard — Rahama Admin" }, { property: "og:description", content: "Admin overview." }] }),
  component: Overview,
});

function Overview() {
  const properties = useStore((s) => s.properties);
  const enquiries = useStore((s) => s.enquiries);
  const activity = useStore((s) => s.activity);
  const active = properties.filter((p) => p.status !== "Archived");
  const available = properties.filter((p) => p.status === "Published");
  const openEnq = enquiries.filter((e) => e.status !== "Closed");
  const valuation = active.filter((p) => p.status !== "Sold").reduce((a, p) => a + p.price, 0);

  const stats = [
    { l: "Total inventory", v: String(active.length), icon: Building2 },
    { l: "Available listings", v: String(available.length), icon: CheckCircle2 },
    { l: "Active enquiries", v: String(openEnq.length), icon: Inbox },
    { l: "Unsold valuation", v: formatNaira(valuation), icon: Wallet },
  ];

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold md:text-3xl">Overview</h1><p className="text-muted-foreground">Sannu! Here's how the portfolio looks today.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{s.l}</p><s.icon className="h-5 w-5 text-primary" /></div>
            <p className="mt-2 font-display text-2xl font-bold">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Latest enquiries</h2><Link to="/admin/enquiries" className="text-sm text-primary">View all</Link></div>
          <ul className="mt-4 divide-y">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate font-medium">{e.name}</p><p className="truncate text-xs text-muted-foreground">{e.propertyRef ?? "General enquiry"}</p></div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" /><div><p>{a.text}</p><p className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("en-NG")}</p></div></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
