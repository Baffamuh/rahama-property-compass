import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, X, Check } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { areasOf } from "@/lib/locations";
import type { Zone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/locations")({
  head: () => ({ meta: [{ title: "Zones & Areas — Rahama Admin" }, { name: "description", content: "Manage areas under Rahama’s six Azare zones." }, { property: "og:title", content: "Zones & Areas — Rahama Admin" }, { property: "og:description", content: "Manage areas under Rahama’s six Azare zones." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Locations,
});

function Locations() {
  const zones = useStore((s) => s.zones);
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold md:text-3xl">Zones & Areas</h1><p className="text-muted-foreground">Azare · {zones.length} zones</p></div>
    <div className="grid gap-4 lg:grid-cols-2">{zones.map((z) => <ZoneCard key={z.id} z={z} />)}</div>
  </div>;
}

function ZoneCard({ z }: { z: Zone }) {
  const [area, setArea] = useState("");
  const [busy, setBusy] = useState(false);
  const areas = areasOf([z]);
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = area.split(",").map((a) => a.trim()).filter(Boolean);
    if (!names.length || busy) return;
    setBusy(true);
    if (await actions.addZoneAreas(z.id, names)) { setArea(""); toast.success("Areas added"); }
    setBusy(false);
  };
  return <section className="min-w-0 rounded-lg border bg-card p-4 shadow-sm">
    <h2 className="text-lg font-bold">{z.name}</h2>
    <p className="text-xs text-muted-foreground">{z.town} · {areas.length} {areas.length === 1 ? "area" : "areas"}</p>
    <div className="mt-4 divide-y">{areas.map((a) => <AreaRow key={a} zoneId={z.id} area={a} />)}</div>
    {!areas.length && <p className="py-4 text-sm text-muted-foreground">No areas added yet</p>}
    <form className="mt-3 flex min-w-0 flex-wrap gap-2" onSubmit={add}>
      <Input className="min-w-0 flex-1 basis-40" placeholder="Area names, separated by commas" value={area} onChange={(e) => setArea(e.target.value)} aria-label={`New areas in ${z.name}`} />
      <Button type="submit" disabled={busy || !area.trim()}><Plus className="h-4 w-4" />{busy ? "Saving…" : "Add area"}</Button>
    </form>
  </section>;
}

function AreaRow({ zoneId, area }: { zoneId: string; area: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(area);
  const [busy, setBusy] = useState(false);
  return <div className="flex min-w-0 items-center gap-2 py-2">
    <MapPin className="h-4 w-4 shrink-0 text-primary" />
    {editing ? <Input aria-label={`Rename ${area}`} value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1" /> : <span className="min-w-0 flex-1 break-words text-sm">{area}</span>}
    <Button variant="ghost" size="icon" disabled={busy || (editing && !name.trim())} aria-label={editing ? `Save area ${area}` : `Edit area ${area}`} onClick={async () => {
      if (!editing) { setEditing(true); return; }
      setBusy(true);
      if (await actions.renameZoneArea(zoneId, area, name)) setEditing(false);
      setBusy(false);
    }}>{editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}</Button>
    <Button variant="ghost" size="icon" disabled={busy} aria-label={`Remove ${area}`} onClick={async () => {
      if (!confirm(`Remove ${area} from this zone? Existing property records will be kept.`)) return;
      setBusy(true);
      await actions.deleteZoneArea(zoneId, area);
      setBusy(false);
    }}><X className="h-4 w-4 text-destructive" /></Button>
  </div>;
}