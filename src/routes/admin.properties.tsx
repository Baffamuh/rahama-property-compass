import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { compressImage } from "@/lib/image-upload";
import { actions, useStore } from "@/lib/store";
import { formatNaira, formatSize, slugify } from "@/lib/format";
import { AREAS, IMAGES } from "@/lib/sample-data";
import { areasOf, findArea } from "@/lib/locations";
import type { Property, PropertyStatus } from "@/lib/types";
import { MeasurementEditor } from "@/components/site/LandMeasurement";
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

      <div className="space-y-3 md:hidden">
        {list.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-3">
            <div className="flex min-w-0 gap-3">
              <img src={p.images[0]} alt="" className="h-16 w-20 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{p.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{p.ref}</p>
                <p className="mt-1 text-sm font-semibold">{formatNaira(p.price)}</p>
                <p className="text-xs text-muted-foreground">{p.type} · {formatSize(p.size, p.sizeUnit)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Select value={p.status} onValueChange={(v) => { actions.setStatus(p.id, v as PropertyStatus); toast.success(`${p.ref} set to ${v}`); }}>
                <SelectTrigger className="h-9 w-36" aria-label="Change status"><StatusBadge status={p.status} /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" />Edit</Button>
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => { if (confirm(`Delete ${p.title}?`)) { actions.deleteProperty(p.id); toast.success("Listing deleted"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-10 text-center text-muted-foreground">No listings match.</p>}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
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
                    <SelectTrigger className="h-8 w-36 border-0 bg-transparent p-0 shadow-none" aria-label="Change status"><StatusBadge status={p.status} /></SelectTrigger>
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
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto overflow-x-hidden p-4 sm:max-w-3xl sm:p-6">
          {editing && <Editor initial={editing} isNew={!properties.some((p) => p.id === editing.id)} existing={properties} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Editor({ initial, isNew, existing, onDone }: { initial: Property; isNew: boolean; existing: Property[]; onDone: () => void }) {
  const [p, setP] = useState<Property>(initial);
  const [feature, setFeature] = useState("");
  const [uploading, setUploading] = useState(false);
  const zones = useStore((s) => s.zones);
  const legacy = findArea(zones, p.area);
  const zone = zones.find((z) => z.id === p.zoneId) ?? legacy?.zone;
  const subZone = zone?.subZones.find((s) => s.id === p.subZoneId) ?? (legacy?.zone.id === zone?.id ? legacy?.subZone : undefined);
  const subAreas = zone ? areasOf(zones, { zoneId: zone.id, subZoneId: subZone?.id }) : [];
  const areaList = subAreas.includes(p.area) ? subAreas : [p.area, ...subAreas];
  const set = <K extends keyof Property>(k: K, v: Property[K]) => setP((x) => ({ ...x, [k]: v }));

  const save = (): void => {
    if (p.title.trim().length < 3) { toast.error("Please enter a title"); return; }
    if (p.price <= 0) { toast.error("Please enter a price"); return; }
    if (p.images.length === 0) { toast.error("Add at least one image"); return; }
    const ref = p.ref.trim() || `RHM-${p.location === "Azare" ? "AZR" : "BAU"}-${String(existing.length + 1).padStart(3, "0")}`;
    if (existing.some((x) => x.ref === ref && x.id !== p.id)) { toast.error("Reference code already in use"); return; }
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
        {row("Zone", (
          <Select value={zone?.id ?? ""} onValueChange={(v) => {
            const z = zones.find((x) => x.id === v); const s = z?.subZones[0];
            setP((x) => ({ ...x, zoneId: v, subZoneId: s?.id, location: z?.town ?? x.location, area: s?.areas[0] ?? x.area }));
          }}>
            <SelectTrigger><SelectValue placeholder="Choose zone" /></SelectTrigger>
            <SelectContent>{zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name} ({z.town})</SelectItem>)}</SelectContent>
          </Select>
        ))}
        {row("Sub-zone", (
          <Select value={subZone?.id ?? ""} disabled={!zone} onValueChange={(v) => {
            const s = zone?.subZones.find((x) => x.id === v);
            setP((x) => ({ ...x, subZoneId: v, area: s?.areas[0] ?? x.area }));
          }}>
            <SelectTrigger><SelectValue placeholder={zone ? "Choose sub-zone" : "Pick a zone first"} /></SelectTrigger>
            <SelectContent>{zone?.subZones.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        ))}
        {row("Area", opt(p.area, (v) => set("area", v), areaList))}
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
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm font-semibold text-primary hover:bg-primary/10">
            <Upload className="h-4 w-4" />{uploading ? "Processing photos…" : "Upload photos from device / camera"}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (!files.length) return;
              setUploading(true);
              try {
                const out = await Promise.all(files.map((f) => compressImage(f)));
                setP((x) => ({ ...x, images: [...x.images, ...out] }));
                toast.success(`${out.length} photo${out.length > 1 ? "s" : ""} added`);
              } catch { toast.error("Could not read one of the photos"); }
              finally { setUploading(false); }
            }} />
          </label>
          <p className="text-xs text-muted-foreground">Photos are resized automatically so pages load fast. Or pick a sample:</p>
          <div className="flex gap-2">{LIBRARY.map((img) => <button type="button" key={img} onClick={() => set("images", [...p.images, img])} className="opacity-80 hover:opacity-100"><img src={img} alt="" className="h-12 w-16 rounded object-cover" /></button>)}</div>
        </div>
        <div className="sm:col-span-2"><MeasurementEditor p={p} onChange={(patch) => setP((x) => ({ ...x, ...patch }))} /></div>
        <label className="flex items-center gap-3 sm:col-span-2"><Switch checked={p.featured} onCheckedChange={(v) => set("featured", v)} />Feature on homepage</label>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><Button onClick={save}>{isNew ? "Create property" : "Save changes"}</Button></div>
    </>
  );
}
