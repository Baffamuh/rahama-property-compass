import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Award, Pencil, Plus, Printer, Receipt, Trophy, UserPlus, XCircle } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { leaderboard } from "@/lib/leaderboard";
import type { Agent, PaymentMethod } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/agents")({
  head: () => ({ meta: [{ title: "Agents & Sales — Rahama Admin" }, { name: "description", content: "Agent directory, sales records and annual best-seller leaderboard." }, { property: "og:title", content: "Agents & Sales — Rahama Admin" }, { property: "og:description", content: "Agent directory and leaderboard." }] }),
  component: AgentsPage,
});

const METHODS: PaymentMethod[] = ["Bank Transfer", "Cash", "Cheque", "POS"];
const today = () => new Date().toISOString().slice(0, 10);

function AgentsPage() {
  const agents = useStore((s) => s.agents);
  const sales = useStore((s) => s.sales);
  const zones = useStore((s) => s.zones);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [selling, setSelling] = useState(false);
  const years = useMemo(() => [...new Set([String(new Date().getFullYear()), ...sales.map((s) => s.date.slice(0, 4))])].sort().reverse(), [sales]);
  const [year, setYear] = useState(years[0]!);
  const rows = leaderboard(agents, sales, year);
  const top = rows[0] && rows[0].count > 0 ? rows.filter((r) => r.rank === 1) : [];
  const yearSales = sales.filter((s) => year === "all" || s.date.startsWith(year));
  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? "—";

  const newAgent = (): Agent => ({ id: actions.newId(), code: `RHM-AGT-${String(agents.length + 1).padStart(3, "0")}`, name: "", phone: "", active: true, joinedAt: today() });

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold md:text-3xl">Agents & Sales</h1><p className="text-muted-foreground">{agents.length} agents · {sales.filter((s) => s.status === "Completed").length} completed sales</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing(newAgent())}><UserPlus className="h-4 w-4" />Add agent</Button>
          <Button onClick={() => (agents.some((a) => a.active) ? setSelling(true) : toast.error("Add an active agent first"))}><Plus className="h-4 w-4" />Record sale</Button>
        </div>
      </div>

      {/* Leaderboard */}
      <section className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-primary" />Best-seller leaderboard {year === "all" ? "(all time)" : year}</h2>
            <p className="text-xs text-muted-foreground">Ranked by number of completed sales, then total sales value. Cancelled sales are not counted. Agents equal on both are shown as a tie.</p>
          </div>
          <div className="no-print flex gap-2">
            <Select value={year} onValueChange={setYear}><SelectTrigger className="w-32" aria-label="Year"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}<SelectItem value="all">All time</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
          </div>
        </div>

        {top.length > 0 && (
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-primary p-5 text-primary-foreground">
            <Award className="h-12 w-12 shrink-0 text-accent" />
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">{top.length > 1 ? "Tie for top seller — admin decision needed" : `Top seller of ${year === "all" ? "all time" : year}`}</p>
              <p className="font-display text-2xl font-bold">{top.map((t) => t.agent.name).join(" & ")}</p>
              <p className="text-sm opacity-90">{top[0]!.count} sale{top[0]!.count === 1 ? "" : "s"} · {formatNaira(top[0]!.value)}</p>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">Rank</th><th className="p-2">Agent</th><th className="p-2">Sales</th><th className="p-2">Total value</th><th className="p-2">Commission</th><th className="no-print p-2 text-right">Profile</th></tr></thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.agent.id} className={r.agent.active ? "" : "opacity-60"}>
                  <td className="p-2 font-bold">#{r.rank}{r.tied && r.count > 0 && <span className="ml-1 text-xs font-normal text-muted-foreground">(tie)</span>}</td>
                  <td className="p-2"><p className="font-medium">{r.agent.name}</p><p className="font-mono text-xs text-muted-foreground">{r.agent.code}{!r.agent.active && " · inactive"}</p></td>
                  <td className="p-2 font-semibold">{r.count}</td>
                  <td className="p-2">{formatNaira(r.value)}</td>
                  <td className="p-2">{formatNaira(r.commission)}</td>
                  <td className="no-print p-2 text-right"><Button variant="ghost" size="icon" aria-label={`Edit ${r.agent.name}`} onClick={() => setEditing(r.agent)}><Pencil className="h-4 w-4" /></Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No agents yet. Click “Add agent” to register your first agent.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sales */}
      <section className="no-print rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Receipt className="h-5 w-5 text-primary" />Sales {year === "all" ? "" : `in ${year}`}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs uppercase text-muted-foreground"><tr><th className="p-2">Receipt</th><th className="p-2">Date</th><th className="p-2">Property</th><th className="p-2">Buyer</th><th className="p-2">Agent</th><th className="p-2">Price</th><th className="p-2">Paid</th><th className="p-2">Status</th><th className="p-2 text-right">Actions</th></tr></thead>
            <tbody className="divide-y">
              {yearSales.map((s) => (
                <tr key={s.id} className={s.status === "Cancelled" ? "opacity-60" : ""}>
                  <td className="p-2 font-mono text-xs">{s.receiptNo}</td>
                  <td className="p-2">{s.date}</td>
                  <td className="p-2"><p className="font-medium">{s.propertyTitle}</p><p className="font-mono text-xs text-muted-foreground">{s.propertyRef}</p></td>
                  <td className="p-2">{s.buyerName}</td>
                  <td className="p-2">{agentName(s.agentId)}</td>
                  <td className="p-2">{formatNaira(s.price)}</td>
                  <td className="p-2">{formatNaira(s.amountPaid)}</td>
                  <td className="p-2"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.status === "Completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{s.status}</span></td>
                  <td className="whitespace-nowrap p-2 text-right">
                    <Button asChild variant="ghost" size="sm"><Link to="/admin/receipt/$id" params={{ id: s.id }}><Printer className="h-4 w-4" />Receipt</Link></Button>
                    {s.status === "Completed" && <Button variant="ghost" size="icon" aria-label="Cancel sale" onClick={() => { if (confirm(`Cancel sale ${s.receiptNo}? It will no longer count on the leaderboard. The record is kept.`)) { actions.cancelSale(s.id); toast.success("Sale cancelled"); } }}><XCircle className="h-4 w-4 text-destructive" /></Button>}
                  </td>
                </tr>
              ))}
              {yearSales.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No sales recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>{editing && <AgentForm initial={editing} zones={zones} isNew={!agents.some((a) => a.id === editing.id)} codes={agents.filter((a) => a.id !== editing.id).map((a) => a.code)} onDone={() => setEditing(null)} />}</DialogContent>
      </Dialog>
      <Dialog open={selling} onOpenChange={setSelling}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">{selling && <SaleForm onDone={() => setSelling(false)} />}</DialogContent>
      </Dialog>
    </div>
  );
}

function AgentForm({ initial, isNew, codes, zones, onDone }: { initial: Agent; isNew: boolean; codes: string[]; zones: { id: string; name: string }[]; onDone: () => void }) {
  const [a, setA] = useState(initial);
  const save = (): void => {
    if (a.name.trim().length < 2) { toast.error("Enter the agent's full name"); return; }
    if (a.phone.replace(/\D/g, "").length < 10) { toast.error("Enter a valid phone number"); return; }
    if (codes.includes(a.code.trim())) { toast.error("Agent ID already in use"); return; }
    actions.saveAgent({ ...a, name: a.name.trim(), code: a.code.trim() });
    toast.success(isNew ? "Agent added" : "Agent updated");
    onDone();
  };
  return (
    <>
      <DialogHeader><DialogTitle>{isNew ? "Add agent" : `Edit ${initial.name}`}</DialogTitle></DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2"><Label>Full name</Label><Input value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Agent ID</Label><Input value={a.code} onChange={(e) => setA({ ...a, code: e.target.value.toUpperCase() })} /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Email (optional)</Label><Input type="email" value={a.email ?? ""} onChange={(e) => setA({ ...a, email: e.target.value || undefined })} /></div>
        <div className="space-y-1.5"><Label>Assigned zone</Label>
          <Select value={a.zoneId ?? "none"} onValueChange={(v) => setA({ ...a, zoneId: v === "none" ? undefined : v })}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="none">Any zone</SelectItem>{zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Date joined</Label><Input type="date" value={a.joinedAt} onChange={(e) => setA({ ...a, joinedAt: e.target.value })} /></div>
        <label className="flex items-center gap-3 self-end pb-2"><Switch checked={a.active} onCheckedChange={(v) => setA({ ...a, active: v })} />Active</label>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><Button onClick={save}>Save agent</Button></div>
    </>
  );
}

function SaleForm({ onDone }: { onDone: () => void }) {
  const agents = useStore((s) => s.agents).filter((a) => a.active);
  const properties = useStore((s) => s.properties).filter((p) => p.status !== "Sold" && p.status !== "Archived");
  const [f, setF] = useState({ agentId: agents[0]?.id ?? "", propertyId: "", buyerName: "", buyerPhone: "", price: 0, amountPaid: 0, commission: 0, method: "Bank Transfer" as PaymentMethod, date: today() });
  const prop = properties.find((p) => p.id === f.propertyId);
  const save = (): void => {
    if (!f.agentId || !prop) { toast.error("Choose the agent and the property"); return; }
    if (f.buyerName.trim().length < 2) { toast.error("Enter the buyer's name"); return; }
    if (f.price <= 0) { toast.error("Enter the agreed price"); return; }
    if (f.amountPaid < 0 || f.amountPaid > f.price) { toast.error("Amount paid must be between ₦0 and the agreed price"); return; }
    if (!confirm(`Record sale of ${prop.ref} for ${formatNaira(f.price)}? The property will be marked Sold.`)) { return; }
    const sale = actions.recordSale({ ...f, buyerName: f.buyerName.trim(), propertyRef: prop.ref, propertyTitle: prop.title });
    toast.success(`Sale recorded — receipt ${sale.receiptNo}`);
    onDone();
  };
  const num = (k: "price" | "amountPaid" | "commission") => <Input type="number" min={0} value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })} />;
  return (
    <>
      <DialogHeader><DialogTitle>Record a sale</DialogTitle></DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Agent</Label><Select value={f.agentId} onValueChange={(v) => setF({ ...f, agentId: v })}><SelectTrigger><SelectValue placeholder="Choose agent" /></SelectTrigger><SelectContent>{agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Property</Label><Select value={f.propertyId} onValueChange={(v) => { const p = properties.find((x) => x.id === v); setF({ ...f, propertyId: v, price: p?.price ?? f.price }); }}><SelectTrigger><SelectValue placeholder="Choose property" /></SelectTrigger><SelectContent>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.ref} — {p.title}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Buyer name</Label><Input value={f.buyerName} onChange={(e) => setF({ ...f, buyerName: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Buyer phone</Label><Input value={f.buyerPhone} onChange={(e) => setF({ ...f, buyerPhone: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Agreed price (₦)</Label>{num("price")}</div>
        <div className="space-y-1.5"><Label>Amount paid now (₦)</Label>{num("amountPaid")}</div>
        <div className="space-y-1.5"><Label>Agent commission (₦)</Label>{num("commission")}</div>
        <div className="space-y-1.5"><Label>Payment method</Label><Select value={f.method} onValueChange={(v) => setF({ ...f, method: v as PaymentMethod })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Date of sale</Label><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        {f.price > 0 && <p className="self-end pb-2 text-sm">Balance: <strong>{formatNaira(Math.max(0, f.price - f.amountPaid))}</strong></p>}
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><Button onClick={save}>Record sale</Button></div>
    </>
  );
}
