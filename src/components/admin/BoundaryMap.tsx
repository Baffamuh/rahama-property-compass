// Browser-only Leaflet map. Load with React.lazy behind <ClientOnly>.
import { useEffect, useRef } from "react";
import L from "leaflet";
import { AZARE_CENTRAL, distanceM, FT_PER_M, type LatLng } from "@/lib/measurements";

/** `track`: live GPS walk — draws the walked line and follows the walker. */
export default function BoundaryMap({ points, onChange, readOnly = false, track = false, height = 360 }: { points: LatLng[]; onChange?: (p: LatLng[]) => void; readOnly?: boolean; track?: boolean; height?: number }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const cb = useRef(onChange);
  const pts = useRef(points);
  cb.current = onChange;
  pts.current = points;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { center: points[0] ?? AZARE_CENTRAL, zoom: points.length ? 18 : 16 });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    if (!readOnly) m.on("click", (e: L.LeafletMouseEvent) => cb.current?.([...pts.current, [e.latlng.lat, e.latlng.lng]]));
    map.current = m;
    if (points.length > 2) m.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    return () => { m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    if (track) {
      if (points.length > 1) L.polyline(points, { color: "#1f5130", weight: 4 }).addTo(g);
      const last = points[points.length - 1];
      if (last) { L.circleMarker(last, { radius: 8, color: "#ffffff", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }).addTo(g); map.current?.setView(last, Math.max(map.current.getZoom(), 18)); }
      if (points[0]) L.circleMarker(points[0], { radius: 6, color: "#1f5130", fillColor: "#a3d14a", fillOpacity: 1, weight: 2 }).addTo(g).bindTooltip("Start", { permanent: true, direction: "top" });
      return;
    }
    if (points.length > 1) L.polygon(points, { color: "#1f5130", fillColor: "#a3d14a", fillOpacity: 0.35, weight: 2 }).addTo(g);
    if (points.length > 2 && points.length <= 16) points.forEach((p, i) => {
      const q = points[(i + 1) % points.length]!;
      L.tooltip({ permanent: true, direction: "center", className: "edge-label" }).setLatLng([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]).setContent(`${Math.round(distanceM(p, q) * FT_PER_M)} ft`).addTo(g);
    });
    if (points.length > 2 && map.current) map.current.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 20 });
    points.forEach((p, i) => {
      const mk = L.circleMarker(p, { radius: 7, color: "#1f5130", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }).addTo(g);
      mk.bindTooltip(String(i + 1), { permanent: true, direction: "top", offset: [0, -6] });
      if (!readOnly) mk.on("click", (e) => { L.DomEvent.stopPropagation(e); cb.current?.(pts.current.filter((_, j) => j !== i)); });
    });
  }, [points, readOnly, track]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-lg border" />;
}
