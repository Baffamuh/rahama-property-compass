import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/format";
import type { EnquiryStatus } from "@/lib/types";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({ meta: [{ title: "Enquiries — Rahama Admin" }, { name: "description", content: "Lead pipeline." }, { property: "og:title", content: "Enquiries — Rahama Admin" }, { property: "og:description", content: "Lead pipeline." }] }),
  component: Enquiries,
});

const STATUSES: EnquiryStatus[] = ["New", "Contacted", "Viewing Scheduled", "Closed"];

function Enquiries() {
  const enquiries = useStore((s) => s.enquiries);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = useMemo(() => enquiries.filter((e) => (filter === "all" || e.status === filter) && `${e.name} ${e.phone} ${e.propertyRef ?? ""}`.toLowerCase().includes(q.toLowerCase())), [enquiries, filter, q]);
  const selected = enquiries.find((e) => e.id === (selectedId ?? list[0]?.id));
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold md:text-3xl">Enquiries</h1><p className="text-muted-foreground">Buyer leads from the website</p></div>
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s} <span className="ml-1 opacity-70">{s === "all" ? enquiries.length : enquiries.filter((e) => e.status === s).length}</span>
          </Button>
        ))}
      </div>
      <Input placeholder="Search name, phone or ref…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="divide-y overflow-hidden rounded-xl border bg-card lg:col-span-2">
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => setSelectedId(e.id)} className={`w-full p-4 text-left hover:bg-muted/40 ${selected?.id === e.id ? "bg-secondary" : ""}`}>
                <div className="flex items-center justify-between gap-2"><p className="font-semibold">{e.name}</p><StatusBadge status={e.status} /></div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{e.propertyRef ? `${e.propertyRef} · ${e.propertyTitle}` : "General enquiry"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString("en-NG")}</p>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="p-10 text-center text-muted-foreground">No enquiries here yet.</li>}
        </ul>
        {selected && (
          <div className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold">{selected.name}</h2><p className="text-sm text-muted-foreground">{new Date(selected.createdAt).toLocaleString("en-NG")}</p></div>
              <Select value={selected.status} onValueChange={(v) => { actions.updateEnquiry(selected.id, { status: v as EnquiryStatus }); toast.success(`Marked ${v}`); }}>
                <SelectTrigger className="w-48" aria-label="Enquiry status"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-lg border p-3"><Phone className="h-4 w-4 text-primary" />{selected.phone}</a>
              {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-2 rounded-lg border p-3"><Mail className="h-4 w-4 text-primary" />{selected.email}</a>}
              <a href={whatsappLink(`Hello ${selected.name}, thank you for contacting Rahama Land & Property${selected.propertyRef ? ` about ${selected.propertyRef}` : ""}.`, selected.phone.replace(/\D/g, ""))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border p-3"><MessageCircle className="h-4 w-4 text-primary" />Reply on WhatsApp</a>
            </div>
            <div><p className="text-xs uppercase text-muted-foreground">Property</p><p className="font-medium">{selected.propertyRef ? `${selected.propertyRef} — ${selected.propertyTitle}` : "General enquiry"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Message</p><p className="mt-1 rounded-lg bg-muted p-3">{selected.message}</p></div>
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Internal notes</p>
              <Textarea rows={4} value={notes[selected.id] ?? selected.notes} onChange={(e) => setNotes({ ...notes, [selected.id]: e.target.value })} placeholder="Only visible to staff…" />
              <Button size="sm" onClick={() => { actions.updateEnquiry(selected.id, { notes: notes[selected.id] ?? selected.notes }); toast.success("Notes saved"); }}>Save notes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
