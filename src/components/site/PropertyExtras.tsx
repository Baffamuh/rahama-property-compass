import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, FileCheck2 } from "lucide-react";
import { actions } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import type { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function titleDocs(p: Property): string[] {
  const f = p.features.join(" ").toLowerCase();
  const docs: string[] = [];
  if (/c of o|certificate of occupancy/.test(f)) docs.push("Certificate of Occupancy");
  if (/r of o|right of occupancy/.test(f)) docs.push("Right of Occupancy");
  if (/survey/.test(f)) docs.push("Survey Plan");
  if (/customary/.test(f)) docs.push("Customary Grant");
  docs.push("Deed of Assignment");
  return docs;
}

export function TitleBadges({ p }: { p: Property }) {
  return (
    <div className="flex flex-wrap gap-2">
      {titleDocs(p).map((d) => (
        <span key={d} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-semibold text-primary"><FileCheck2 className="h-3.5 w-3.5" />{d}</span>
      ))}
    </div>
  );
}

export function InstallmentCalculator({ price }: { price: number }) {
  const [down, setDown] = useState(30);
  const [months, setMonths] = useState(6);
  const deposit = Math.round((price * down) / 100);
  const monthly = Math.round((price - deposit) / months);
  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="text-xl font-bold">Payment plan calculator</h2>
      <p className="text-sm text-muted-foreground">Estimate only — final terms are agreed at our office.</p>
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-sm"><Label>Down payment</Label><span className="font-semibold">{down}% · {formatNaira(deposit)}</span></div>
        <Slider min={20} max={100} step={5} value={[down]} onValueChange={(v) => setDown(v[0] ?? 30)} aria-label="Down payment percent" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {[3, 6, 12].map((m) => <Button key={m} size="sm" variant={months === m ? "default" : "outline"} onClick={() => setMonths(m)}>{m} months</Button>)}
      </div>
      <div className="mt-5 rounded-lg bg-secondary p-4">
        <p className="text-xs uppercase text-muted-foreground">Monthly instalment</p>
        <p className="text-2xl font-extrabold text-primary">{down === 100 ? "Paid in full" : formatNaira(monthly)}</p>
      </div>
    </div>
  );
}

export function InspectionBooking({ p }: { p: Property }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "10:00" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length < 10 || !form.date) { toast.error("Please enter your name, phone and a date"); return; }
    actions.addEnquiry({ name: form.name.trim(), phone: form.phone.trim(), propertyRef: p.ref, propertyTitle: p.title, message: `I want to book a site inspection on ${form.date} at ${form.time}.` });
    toast.success("Inspection request sent — our field team will call to confirm.");
    setOpen(false);
    setForm({ name: "", phone: "", date: "", time: "10:00" });
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="lg" className="w-full"><CalendarCheck className="mr-2 h-4 w-4" />Book site inspection</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Book a free site inspection</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{p.title} · {p.ref}</p>
        <form onSubmit={submit} className="space-y-3">
          <div><Label htmlFor="bk-name">Full name</Label><Input id="bk-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label htmlFor="bk-phone">Phone</Label><Input id="bk-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="bk-date">Date</Label><Input id="bk-date" type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label htmlFor="bk-time">Time</Label><Input id="bk-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <Button type="submit" className="w-full">Request inspection</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
