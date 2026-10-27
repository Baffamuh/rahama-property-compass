import { Link } from "@tanstack/react-router";
import { BedDouble, MapPin, Ruler } from "lucide-react";
import { formatNaira, formatSize } from "@/lib/format";
import type { Property } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      to="/properties/$slug"
      params={{ slug: p.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={p.images[0]} alt={p.title} loading="lazy" width={1200} height={800} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><StatusBadge status={p.status} /></div>
        <span className="absolute bottom-3 left-3 rounded-md bg-background/90 px-2 py-1 text-xs font-semibold text-primary">{p.type}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-mono text-muted-foreground">{p.ref}</p>
        <h3 className="line-clamp-1 text-lg font-semibold">{p.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /><span className="line-clamp-1">{p.area}</span></p>
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="text-xl font-bold text-primary">{formatNaira(p.price)}</span>
          <span className="flex items-center gap-3 text-xs text-muted-foreground">
            {p.bedrooms ? <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{p.bedrooms}</span> : null}
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{formatSize(p.size, p.sizeUnit)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
