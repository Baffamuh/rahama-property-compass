import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Published: "bg-accent text-accent-foreground",
  Available: "bg-accent text-accent-foreground",
  Reserved: "bg-warning text-foreground",
  Sold: "bg-destructive text-destructive-foreground",
  Rented: "bg-destructive text-destructive-foreground",
  Draft: "bg-muted text-muted-foreground",
  Archived: "bg-secondary text-muted-foreground",
  New: "bg-accent text-accent-foreground",
  Contacted: "bg-secondary text-secondary-foreground",
  "Viewing Scheduled": "bg-warning text-foreground",
  Closed: "bg-primary text-primary-foreground",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = status === "Published" ? "Available" : status;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", styles[status], className)}>
      {label}
    </span>
  );
}
