import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, Crosshair, LocateFixed, Trash2, Undo2 } from "lucide-react";
import { formatArea, perimeterFt, polygonAreaSqm, sideLengthsFt, simplifyBoundary, sizeFromArea, validateBoundary, type AreaUnit, type LatLng } from "@/lib/measurements";
import type { Property } from "@/lib/types";
import { GpsWalk } from "@/components/site/GpsWalk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BoundaryMap = lazy(() => import("@/components/admin/BoundaryMap"));
const UNITS: AreaUnit[] = ["sqft", "sqm", "plots", "hectares", "acres"];
const Skeleton = ({ h }: { h: number }) => <div style={{ height: h }} className="w-full animate-pulse rounded-lg bg-muted" />;

export const DISCLAIMER = "Map estimate only — not a certified survey. Confirm with a licensed surveyor's survey plan before purchase.";

/** Admin editor: draw boundary, review, record verified survey separately. */
export function MeasurementEditor({ p, onChange }: { p: Property; onChange: (patch: Partial<Property>) => void }) {
  const [points, setPoints] = useState<LatLng[]>(p.boundary ?? []);
  const [walking, setWalking] = useState(false);
  const [w, setW] = useState("");
  const [l, setL] = useState("");
  const unit = p.areaDisplayUnit ?? "sqft";
  const error = points.length ? validateBoundary(points) : null;
  const live = error ? 0 : polygonAreaSqm(points);

  const update = (next: LatLng[]) => {
    setPoints(next);
    const ok = !validateBoundary(next);
    const sqm = ok ? Math.round(polygonAreaSqm(next) * 100) / 100 : undefined;
    const unitForSize = p.sizeUnit === "hectares" ? "hectares" : p.sizeUnit === "sqm" ? "sqm" : "plots";
    onChange({ boundary: next.length ? next : undefined, mapAreaSqm: sqm, ...(sqm ? { size: sizeFromArea(sqm, unitForSize), sizeUnit: unitForSize } : {}) });
  };
  const sides = !walking && !error && points.length > 2 && points.length <= 16 ? sideLengthsFt(points) : [];
  const applyDims = () => {
    const wf = Number(w), lf = Number(l);
    if (!(wf > 0 && lf > 0)) return;
    const sqm = (wf * lf) / 10.7639104;
    onChange({ size: sizeFromArea(sqm, p.sizeUnit === "hectares" ? "hectares" : p.sizeUnit === "sqm" ? "sqm" : "plots"), ...(p.sizeUnit === "hectares" || p.sizeUnit === "sqm" ? {} : { sizeUnit: "plots" as const }) });
  };

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold"><Crosshair className="h-4 w-4 text-primary" />Map land measurement</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={!points.length} onClick={() => update(points.slice(0, -1))}><Undo2 className="h-3.5 w-3.5" />Undo</Button>
          <Button type="button" size="sm" variant="outline" disabled={!points.length} onClick={() => { if (confirm("Clear all boundary points?")) update([]); }}><Trash2 className="h-3.5 w-3.5" />Clear</Button>
        </div>
      </div>
      <GpsWalk onProgress={(pts) => { setWalking(pts.length > 0); setPoints(pts); }} onFinish={(pts) => { setWalking(false); update(simplifyBoundary(pts)); }} />
      <p className="text-xs text-muted-foreground">Or tap the map at each corner of the land in order. Tap a numbered point to remove it. Map opens on Azare Central.</p>
      <ClientOnly fallback={<Skeleton h={340} />}><Suspense fallback={<Skeleton h={340} />}><BoundaryMap points={points} onChange={walking ? undefined : update} track={walking} height={340} /></Suspense></ClientOnly>
      {sides.length > 0 && (
        <div className="rounded-md bg-background p-3 text-sm">
          <p className="mb-1 font-semibold">Side lengths</p>
          <ul className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2">{sides.map((ft, i) => <li key={i}>Point {i + 1} → Point {(i + 1) % sides.length + 1}: <b>{Math.round(ft).toLocaleString()} ft</b></li>)}</ul>
          <p className="mt-1 text-xs text-muted-foreground">Total boundary (perimeter): {Math.round(perimeterFt(points)).toLocaleString()} ft</p>
        </div>
      )}
      {!walking && error ? <p className="flex items-center gap-1 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{error}</p> : points.length > 2 && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
          {UNITS.map((u) => <div key={u} className="rounded-md bg-background p-2"><p className="text-[11px] text-muted-foreground">{u === unit ? "Shown publicly" : " "}</p><p className="font-semibold">{formatArea(live, u)}</p></div>)}
        </div>
      )}
      <div className="rounded-md border bg-background p-3">
        <p className="text-sm font-semibold">No GPS? Enter the plot size in feet</p>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="w-24 space-y-1"><Label className="text-xs">Width (ft)</Label><Input type="number" inputMode="decimal" min={0} value={w} onChange={(e) => setW(e.target.value)} placeholder="50" /></div>
          <div className="w-24 space-y-1"><Label className="text-xs">Length (ft)</Label><Input type="number" inputMode="decimal" min={0} value={l} onChange={(e) => setL(e.target.value)} placeholder="100" /></div>
          <Button type="button" variant="outline" onClick={applyDims} disabled={!(Number(w) > 0 && Number(l) > 0)}>Use this size</Button>
        </div>
        {Number(w) > 0 && Number(l) > 0 && <p className="mt-1 text-xs text-muted-foreground">{(Number(w) * Number(l)).toLocaleString()} sq ft ≈ {formatArea((Number(w) * Number(l)) / 10.7639104, "sqm")} ≈ {formatArea((Number(w) * Number(l)) / 10.7639104, "plots")}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Preferred display unit</Label>
          <Select value={unit} onValueChange={(v) => onChange({ areaDisplayUnit: v as AreaUnit })}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{formatArea(0, u).replace(/^[\d.,]+ /, "")}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>
      <p className="flex items-start gap-1 text-xs text-muted-foreground"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{DISCLAIMER}</p>

      <div className="border-t pt-3">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><BadgeCheck className="h-4 w-4 text-primary" />Verified survey (licensed surveyor)</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Survey area (m²)</Label><Input type="number" min={0} value={p.surveyAreaSqm ?? ""} onChange={(e) => onChange({ surveyAreaSqm: e.target.value ? Number(e.target.value) : undefined })} /></div>
          <div className="space-y-1.5"><Label>Survey plan no.</Label><Input value={p.surveyRef ?? ""} onChange={(e) => onChange({ surveyRef: e.target.value || undefined })} /></div>
          <div className="space-y-1.5"><Label>Surveyor / source</Label><Input value={p.surveySource ?? ""} onChange={(e) => onChange({ surveySource: e.target.value || undefined })} /></div>
        </div>
      </div>
    </div>
  );
}

/** Public display beneath listing details. */
export function MeasurementSummary({ p }: { p: Property }) {
  if (!p.mapAreaSqm && !p.surveyAreaSqm) return null;
  const unit = p.areaDisplayUnit ?? "sqft";
  return (
    <div className="space-y-4">
      {p.surveyAreaSqm ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary"><BadgeCheck className="h-4 w-4" />Verified survey area</p>
          <p className="mt-1 text-2xl font-bold">{formatArea(p.surveyAreaSqm, unit)}</p>
          <p className="text-sm text-muted-foreground">{formatArea(p.surveyAreaSqm, "sqm")} · {formatArea(p.surveyAreaSqm, "hectares")} · {formatArea(p.surveyAreaSqm, "acres")}</p>
          {(p.surveyRef || p.surveySource) && <p className="mt-1 text-xs text-muted-foreground">{p.surveyRef && `Survey plan ${p.surveyRef}`}{p.surveyRef && p.surveySource && " · "}{p.surveySource}</p>}
        </div>
      ) : null}
      {p.mapAreaSqm ? (
        <div className="rounded-xl border bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold"><LocateFixed className="h-4 w-4 text-primary" />Estimated area (map measurement)</p>
          <p className="mt-1 text-2xl font-bold">≈ {formatArea(p.mapAreaSqm, unit)}</p>
          <p className="text-sm text-muted-foreground">≈ {formatArea(p.mapAreaSqm, "sqm")} · {formatArea(p.mapAreaSqm, "hectares")} · {formatArea(p.mapAreaSqm, "acres")}</p>
          {p.boundary && p.boundary.length > 2 && <div className="mt-3"><ClientOnly fallback={<Skeleton h={260} />}><Suspense fallback={<Skeleton h={260} />}><BoundaryMap points={p.boundary} readOnly height={260} /></Suspense></ClientOnly></div>}
          <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{DISCLAIMER}</p>
        </div>
      ) : null}
    </div>
  );
}
