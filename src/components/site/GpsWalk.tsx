import { useEffect, useRef, useState } from "react";
import { Footprints, MapPin, Square } from "lucide-react";
import { formatArea, polygonAreaSqm, validateBoundary, type LatLng } from "@/lib/measurements";
import { Button } from "@/components/ui/button";

/** Walk the field with the phone: records GPS points while walking the boundary. */
export function GpsWalk({ onFinish }: { onFinish: (points: LatLng[]) => void }) {
  const [walking, setWalking] = useState(false);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const watch = useRef<number | null>(null);

  const stopWatch = () => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); watch.current = null; };
  useEffect(() => stopWatch, []);

  const start = () => {
    if (!("geolocation" in navigator)) { setErr("This device does not support GPS in the browser."); return; }
    setErr(null); setPoints([]); setWalking(true);
    watch.current = navigator.geolocation.watchPosition(
      (pos) => {
        setAccuracy(Math.round(pos.coords.accuracy));
        if (pos.coords.accuracy > 25) return; // ignore poor fixes
        const pt: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setPoints((prev) => {
          const last = prev[prev.length - 1];
          if (last && distM(last, pt) < 2) return prev; // only add after moving ~2 m
          return [...prev, pt];
        });
      },
      (e) => { setErr(e.code === 1 ? "Location permission denied. Allow location access and try again." : "Could not get GPS signal. Move to an open area."); setWalking(false); stopWatch(); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  };
  const markCorner = () => navigator.geolocation.getCurrentPosition((pos) => setPoints((p) => [...p, [pos.coords.latitude, pos.coords.longitude]]), undefined, { enableHighAccuracy: true });
  const finish = () => {
    stopWatch(); setWalking(false);
    const invalid = validateBoundary(points);
    if (invalid) { setErr(`Not enough walked path: ${invalid}`); return; }
    onFinish(points);
  };

  const area = points.length > 2 && !validateBoundary(points) ? polygonAreaSqm(points) : 0;

  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-background p-3">
      <p className="flex items-center gap-2 text-sm font-semibold"><Footprints className="h-4 w-4 text-primary" />Walk the field (phone GPS)</p>
      <p className="text-xs text-muted-foreground">Stand at one corner, press Start, then walk slowly along the edge of the land back to where you started. Press Finish to calculate.</p>
      <div className="flex flex-wrap gap-2">
        {!walking ? <Button type="button" size="sm" onClick={start}><Footprints className="h-3.5 w-3.5" />Start walking</Button> : <>
          <Button type="button" size="sm" variant="outline" onClick={markCorner}><MapPin className="h-3.5 w-3.5" />Mark corner</Button>
          <Button type="button" size="sm" onClick={finish}><Square className="h-3.5 w-3.5" />Finish & calculate</Button>
        </>}
      </div>
      {(walking || points.length > 0) && (
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Points</p><p className="font-semibold">{points.length}</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">GPS accuracy</p><p className="font-semibold">{accuracy !== null ? `±${accuracy} m` : "…"}</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Area so far</p><p className="font-semibold">{formatArea(area, "sqft")}</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Plots</p><p className="font-semibold">{formatArea(area, "plots")}</p></div>
        </div>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

function distM(a: LatLng, b: LatLng) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
