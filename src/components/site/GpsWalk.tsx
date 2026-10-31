import { useEffect, useRef, useState } from "react";
import { Footprints, MapPin, Square, X } from "lucide-react";
import { distanceM, formatArea, polygonAreaSqm, validateBoundary, type LatLng } from "@/lib/measurements";
import { Button } from "@/components/ui/button";

const inIframe = () => { try { return window.self !== window.top; } catch { return true; } };

/**
 * Walk the field with the phone. Press Start at one corner, walk round the edge;
 * the line grows on the map as you move. Press Finish to calculate and fill the listing.
 */
export function GpsWalk({ onProgress, onFinish }: { onProgress: (points: LatLng[]) => void; onFinish: (points: LatLng[]) => void }) {
  const [walking, setWalking] = useState(false);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const watch = useRef<number | null>(null);
  const live = useRef<LatLng[]>([]);

  const stopWatch = () => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); watch.current = null; };
  useEffect(() => stopWatch, []);

  const push = (pt: LatLng, force = false) => {
    const last = live.current[live.current.length - 1];
    if (!force && last && distanceM(last, pt) < 1.5) return; // add a point every ~1.5 m of walking
    live.current = [...live.current, pt];
    setPoints(live.current);
    onProgress(live.current);
  };

  const fail = (e: GeolocationPositionError) => {
    stopWatch(); setWalking(false);
    if (e.code === 1) {
      setErr(inIframe()
        ? "GPS is blocked inside the editor preview. Open the live website (rahama-property-compass.lovable.app/admin) directly in Chrome on your phone and try again — or tap the corners on the map below."
        : "Location is blocked for this website. In Chrome tap the lock icon next to the address → Permissions → Location → Allow, then reload. Also turn on phone Location (High accuracy).");
    } else setErr("No GPS signal yet. Stand in an open area away from buildings for a few seconds and press Start again.");
  };

  const start = () => {
    if (!("geolocation" in navigator)) { setErr("This browser cannot use GPS. Tap the corners on the map instead."); return; }
    setErr(null); live.current = []; setPoints([]); onProgress([]); setWalking(true);
    // Ask once first so the phone shows its permission prompt, then follow movement.
    navigator.geolocation.getCurrentPosition((pos) => {
      setAccuracy(Math.round(pos.coords.accuracy));
      push([pos.coords.latitude, pos.coords.longitude], true);
      watch.current = navigator.geolocation.watchPosition(
        (p) => { setAccuracy(Math.round(p.coords.accuracy)); if (p.coords.accuracy <= 30) push([p.coords.latitude, p.coords.longitude]); },
        fail,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
      );
    }, fail, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
  };

  const markCorner = () => navigator.geolocation.getCurrentPosition((pos) => push([pos.coords.latitude, pos.coords.longitude], true), fail, { enableHighAccuracy: true, maximumAge: 0 });
  const cancel = () => { stopWatch(); setWalking(false); live.current = []; setPoints([]); onProgress([]); };
  const finish = () => {
    stopWatch(); setWalking(false);
    const invalid = validateBoundary(live.current);
    if (invalid) { setErr(`Walk a bit more of the boundary first. ${invalid}`); return; }
    onFinish(live.current);
  };

  const area = points.length > 2 && !validateBoundary(points) ? polygonAreaSqm(points) : 0;
  const walkedFt = points.slice(1).reduce((a, p, i) => a + distanceM(points[i]!, p), 0) * 3.28084;

  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-background p-3">
      <p className="flex items-center gap-2 text-sm font-semibold"><Footprints className="h-4 w-4 text-primary" />Walk the field with your phone</p>
      <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
        <li>Stand at one corner of the land and press <b>Start</b>.</li>
        <li>Walk slowly along the edge — a green line follows you on the map.</li>
        <li>Back at the start, press <b>Finish</b>. Size is filled in automatically.</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        {!walking ? <Button type="button" onClick={start}><Footprints className="h-4 w-4" />Start</Button> : <>
          <Button type="button" onClick={finish}><Square className="h-4 w-4" />Finish</Button>
          <Button type="button" variant="outline" onClick={markCorner}><MapPin className="h-4 w-4" />Mark corner</Button>
          <Button type="button" variant="ghost" onClick={cancel}><X className="h-4 w-4" />Cancel</Button>
        </>}
      </div>
      {(walking || points.length > 0) && (
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Walked</p><p className="font-semibold">{Math.round(walkedFt).toLocaleString()} ft</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">GPS accuracy</p><p className="font-semibold">{accuracy !== null ? `±${Math.round(accuracy * 3.28)} ft` : "Waiting…"}</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Area so far</p><p className="font-semibold">{formatArea(area, "sqft")}</p></div>
          <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Plots</p><p className="font-semibold">{formatArea(area, "plots")}</p></div>
        </div>
      )}
      {err && <p className="rounded bg-destructive/10 p-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
