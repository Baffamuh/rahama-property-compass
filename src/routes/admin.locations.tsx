import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import type { SubZone, Zone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Zones & Areas — Rahama Admin" }, { name: "description", content: "Manage zones, sub-zones and areas." }, { property: "og:title", content: "Zones & Areas — Rahama Admin" }, { property: "og:description", content: "Manage zones, sub-zones and areas." }] }),
  component: Locations,
});

function Locations() {
  const zones = useStore((s) => s.zones);
  const [name, setName] = useState("");
  const [town, setTown] = useState("Azare");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !town.trim()) { toast.error("Enter a zone name and town"); return; }
    actions.addZone(name.trim(), town.trim());
    setName("");
    toast.success("Zone added");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold md:text-3xl">Zones & Areas</h1><p className="text-muted-foreground">Create zones, add sub-zones under them, then list as many area names as you need. These appear in the property editor and public search.</p></div>
      <form onSubmit={add} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_200px_auto]">
        <Input placeholder="New zone name, e.g. Azare North" value={name} onChange={(e) => setName(e.target.value)} aria-label="Zone name" />
        <Input placeholder="Town" value={town} onChange={(e) => setTown(e.target.value)} aria-label="Town" />
        <Button type="submit"><Plus className="h-4 w-4" />Add zone</Button>
      </form>
      {zones.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No zones yet. Add your first zone above.</p>}
      <div className="grid gap-4 lg:grid-cols-2">{zones.map((z) => <ZoneCard key={z.id} z={z} />)}</div>
    </div>
  );
}

function ZoneCard({ z }: { z: Zone }) {
  const [sub, setSub] = useState("");
  const count = z.subZones.reduce((n, s) => n + s.areas.length, 0);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <Input className="font-semibold" defaultValue={z.name} aria-label="Zone name" onBlur={(e) => e.target.value.trim() && actions.updateZone(z.id, { name: e.target.value.trim() })} />
          <p className="text-xs text-muted-foreground">Town: {z.town} · {z.subZones.length} sub-zones · {count} areas</p>
        </div>
        <Button variant="ghost" size="icon" aria-label={`Delete zone ${z.name}`} onClick={() => confirm(`Delete zone ${z.name} and everything under it?`) && actions.deleteZone(z.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      <div className="mt-4 space-y-3">{z.subZones.map((s) => <SubCard key={s.id} zoneId={z.id} s={s} />)}</div>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!sub.trim()) return; actions.addSubZone(z.id, sub.trim()); setSub(""); }}>
        <Input placeholder="Add sub-zone…" value={sub} onChange={(e) => setSub(e.target.value)} aria-label={`New sub-zone in ${z.name}`} />
        <Button type="submit" variant="secondary"><Plus className="h-4 w-4" />Sub-zone</Button>
      </form>
    </div>
  );
}

function SubCard({ zoneId, s }: { zoneId: string; s: SubZone }) {
  const [area, setArea] = useState("");
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    // Comma-separated input lets staff add many areas at once.
    const names = area.split(",").map((x) => x.trim()).filter(Boolean);
    if (!names.length) return;
    actions.addAreas(zoneId, s.id, names);
    setArea("");
  };
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <Input className="h-8 bg-background" defaultValue={s.name} aria-label="Sub-zone name" onBlur={(e) => e.target.value.trim() && actions.updateSubZone(zoneId, s.id, e.target.value.trim())} />
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Delete sub-zone ${s.name}`} onClick={() => confirm(`Delete sub-zone ${s.name}?`) && actions.deleteSubZone(zoneId, s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {s.areas.map((a) => (
          <span key={a} className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs"><MapPin className="h-3 w-3 text-primary" />{a}
            <button aria-label={`Remove ${a}`} onClick={() => actions.deleteArea(zoneId, s.id, a)}><X className="h-3 w-3" /></button>
          </span>
        ))}
        {s.areas.length === 0 && <span className="text-xs text-muted-foreground">No areas yet</span>}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={add}>
        <Input className="h-8 bg-background" placeholder="Area names (separate with commas)" value={area} onChange={(e) => setArea(e.target.value)} aria-label={`New areas in ${s.name}`} />
        <Button type="submit" size="sm">Add</Button>
      </form>
    </div>
  );
}
