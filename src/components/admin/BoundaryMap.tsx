// Browser-only Leaflet map. Load with React.lazy behind <ClientOnly>.
import { useEffect, useRef } from "react";
import L from "leaflet";
import { AZARE_CENTRAL, type LatLng } from "@/lib/measurements";

export default function BoundaryMap({ points, onChange, readOnly = false, height = 360 }: { points: LatLng[]; onChange?: (p: LatLng[]) => void; readOnly?: boolean; height?: number }) {
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
    if (points.length > 1) L.polygon(points, { color: "#1f5130", fillColor: "#a3d14a", fillOpacity: 0.35, weight: 2 }).addTo(g);
    points.forEach((p, i) => {
      const mk = L.circleMarker(p, { radius: 7, color: "#1f5130", fillColor: "#ffffff", fillOpacity: 1, weight: 2 }).addTo(g);
      mk.bindTooltip(String(i + 1), { permanent: true, direction: "top", offset: [0, -6] });
      if (!readOnly) mk.on("click", (e) => { L.DomEvent.stopPropagation(e); cb.current?.(pts.current.filter((_, j) => j !== i)); });
    });
  }, [points, readOnly]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-lg border" />;
}
