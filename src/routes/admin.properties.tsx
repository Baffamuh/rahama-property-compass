import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { formatNaira, formatSize, slugify } from "@/lib/format";
import { AREAS, IMAGES } from "@/lib/sample-data";
import type { Property, PropertyStatus } from "@/lib/types";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties — Rahama Admin" }, { name: "description", content: "Manage listings." }, { property: "og:title", content: "Properties — Rahama Admin" }, { property: "og:description", content: "Manage listings." }] }),
  component: AdminProperties,
});

const STATUSES: PropertyStatus[] = ["Draft", "Published", "Reserved", "Sold", "Archived"];
const LIBRARY = [IMAGES.land, IMAGES.house, IMAGES.villa, IMAGES.hero];

function blank(): Property {
  return { id: actions.newId(), slug: "", ref: "", title: "", type: "Residential Land", status: "Draft", location: "Azare", area: AREAS[0]!, price: 0, size: 1, sizeUnit: "plots", description: "", features: [], images: [IMAGES.land], featured: false, createdAt: new Date().toISOString().slice(0, 10) };
}

function AdminProperties() {
  const properties = useStore((s) => s.properties);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Property | null>(null);

  const list = useMemo(() => properties.filter((p) => (status === "all" || p.status === status) && `${p.title} ${p.ref} ${p.area}`.toLowerCase().includes(q.toLowerCase())), [properties, q, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold md:text-3xl">Properties</h1><p className="text-muted-foreground">{properties.length} listings in total</p></div>
        <Button onClick={() => setEditing(blank())}><Plus className="h-4 w-4" />New property</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search title, ref or area…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-sm" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48" aria-label="Filter status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Property</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3">Size</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3"><div className="flex items-center gap-3"><img src={p.images[0]} alt="" className="h-10 w-14 rounded object-cover" /><div><p className="font-medium">{p.title}</p><p className="font-mono text-xs text-muted-foreground">{p.ref}</p></div></div></td>
                <td className="p-3">{p.type}</td>
                <td className="p-3 font-semibold">{formatNaira(p.price)}</td>
                <td className="p-3">{formatSize(p.size, p.sizeUnit)}</td>
                <td className="p-3">
                  <Select value={p.status} onValueChange={(v) => { actions.setStatus(p.id, v as PropertyStatus); toast.success(`${p.ref} set to ${v}`); }}>
                    <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0 shadow-none" aria-label="Change status"><StatusBadge status={p.status} className="after:content-['_▾']" /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => { if (confirm(`Delete ${p.title}?`)) { actions.deleteProperty(p.id); toast.success("Listing deleted"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No listings match.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {editing && <Editor initial={editing} isNew={!properties.some((p) => p.id === editing.id)} existing={properties} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Editor({ initial, isNew, existing, onDone }: { initial: Property; isNew: boolean; existing: Property[]; onDone: () => void }) {
  const [p, setP] = useState<Property>(initial);
  const [feature, setFeature] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const set = <K extends keyof Property>(k: K, v: Property[K]) => setP((x) => ({ ...x, [k]: v }));

  const save = () => {
    if (p.title.trim().length < 3) return toast.error("Please enter a title");
    if (p.price <= 0) return toast.error("Please enter a price");
    if (p.images.length === 0) return toast.error("Add at least one image");
    const ref = p.ref.trim() || `RHM-${p.location === "Azare" ? "AZR" : "BAU"}-${String(existing.length + 1).padStart(3, "0")}`;
    if (existing.some((x) => x.ref === ref && x.id !== p.id)) return toast.error("Reference code already in use");
    const slug = p.slug || slugify(`${p.title}-${ref}`);
    actions.saveProperty({ ...p, ref, slug, title: p.title.trim() });
    toast.success(isNew ? "Property created" : "Property updated");
    onDone();
  };

  const row = (label: string, el: React.ReactNode) => <div className="space-y-1.5"><Label>{label}</Label>{el}</div>;
  const opt = (value: string, onChange: (v: string) => void, items: string[]) => (
    <Select value={value} onValueChange={onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>
  );

  return (
    <>
      <DialogHeader><DialogTitle>{isNew ? "Create new property" : `Edit ${p.ref}`}</DialogTitle></DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{row("Title", <Input value={p.title} onChange={(e) => set("title", e.target.value)} />)}</div>
        {row("Reference code", <Input placeholder="Auto e.g. RHM-AZR-009" value={p.ref} onChange={(e) => set("ref", e.target.value.toUpperCase())} />)}
        {row("Status", opt(p.status, (v) => set("status", v as PropertyStatus), STATUSES))}
        {row("Type", opt(p.type, (v) => set("type", v as Property["type"]), ["Residential Land", "Commercial Land", "House/Villa"]))}
        {row("Town", opt(p.location, (v) => { set("location", v); set("area", AREAS.find((a) => a.includes(v)) ?? p.area); }, ["Azare", "Bauchi"]))}
        {row("Area", opt(p.area, (v) => set("area", v), AREAS.filter((a) => a.includes(p.location))))}
        {row("Price (₦)", <Input type="number" min={0} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} />)}
        <div className="flex gap-2">
          <div className="flex-1">{row("Size", <Input type="number" min={0} value={p.size} onChange={(e) => set("size", Number(e.target.value))} />)}</div>
          <div className="w-32">{row("Unit", opt(p.sizeUnit, (v) => set("sizeUnit", v as Property["sizeUnit"]), ["plots", "sqm", "hectares"]))}</div>
        </div>
        {p.type === "House/Villa" && <>
          {row("Bedrooms", <Input type="number" min={0} value={p.bedrooms ?? ""} onChange={(e) => set("bedrooms", Number(e.target.value))} />)}
          {row("Bathrooms", <Input type="number" min={0} value={p.bathrooms ?? ""} onChange={(e) => set("bathrooms", Number(e.target.value))} />)}
        </>}
        <div className="sm:col-span-2">{row("Description", <Textarea rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} />)}</div>
        <div className="sm:col-span-2 space-y-2">
          <Label>Features</Label>
          <div className="flex flex-wrap gap-2">{p.features.map((f) => <span key={f} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">{f}<button aria-label={`Remove ${f}`} onClick={() => set("features", p.features.filter((x) => x !== f))}><X className="h-3 w-3" /></button></span>)}</div>
          <div className="flex gap-2"><Input placeholder="e.g. Borehole" value={feature} onChange={(e) => setFeature(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && feature.trim()) { e.preventDefault(); set("features", [...p.features, feature.trim()]); setFeature(""); } }} /><Button type="button" variant="outline" onClick={() => { if (feature.trim()) { set("features", [...p.features, feature.trim()]); setFeature(""); } }}>Add</Button></div>
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label>Images (first is the cover)</Label>
          <div className="flex flex-wrap gap-2">
            {p.images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="h-16 w-24 rounded object-cover" />
                <button aria-label="Remove image" onClick={() => set("images", p.images.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Add from library:</p>
          <div className="flex gap-2">{LIBRARY.map((img) => <button key={img} onClick={() => set("images", [...p.images, img])} className="opacity-80 hover:opacity-100"><img src={img} alt="" className="h-12 w-16 rounded object-cover" /></button>)}</div>
          <div className="flex gap-2"><Input placeholder="…or paste an image URL (https://)" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} /><Button type="button" variant="outline" onClick={() => { if (/^https:\/\//.test(imgUrl)) { set("images", [...p.images, imgUrl]); setImgUrl(""); } else toast.error("Use an https:// link"); }}>Add</Button></div>
        </div>
        <label className="flex items-center gap-3 sm:col-span-2"><Switch checked={p.featured} onCheckedChange={(v) => set("featured", v)} />Feature on homepage</label>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><Button onClick={save}>{isNew ? "Create property" : "Save changes"}</Button></div>
    </>
  );
}
