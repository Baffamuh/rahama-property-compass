import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle, Save, Sparkles } from "lucide-react";
import { analyzeLead, draftReply, type Tone } from "@/lib/lead-advisor";
import { whatsappLink } from "@/lib/format";
import type { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TONES: { v: Tone; l: string }[] = [
  { v: "formal", l: "Formal" },
  { v: "warm", l: "Warm" },
  { v: "hausa", l: "Hausa greeting" },
];

const prioClass = { High: "bg-destructive text-destructive-foreground", Medium: "bg-warning text-foreground", Low: "bg-muted text-muted-foreground" };

export function LeadAdvisor({ name, phone, message, property, onSaveNote }: { name: string; phone?: string; message: string; property?: Property; onSaveNote?: (note: string) => void }) {
  const [tone, setTone] = useState<Tone>("formal");
  const analysis = useMemo(() => analyzeLead({ name, message, property }), [name, message, property]);
  const auto = useMemo(() => draftReply({ name, message, property }, analysis, tone), [name, message, property, analysis, tone]);
  const [edited, setEdited] = useState<string | null>(null);
  const reply = edited ?? auto;

  return (
    <div className="space-y-4 rounded-xl border border-primary/30 bg-secondary/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-primary" />Smart Lead Advisor</p>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${prioClass[analysis.priority]}`}>{analysis.priority} priority</span>
      </div>
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div><p className="text-xs uppercase text-muted-foreground">Signals</p><ul className="mt-1 list-disc pl-4">{analysis.signals.map((s) => <li key={s}>{s}</li>)}</ul></div>
        <div>
          <p className="text-xs uppercase text-muted-foreground">To verify</p>
          {analysis.questions.length ? <ul className="mt-1 list-disc pl-4">{analysis.questions.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="mt-1 text-muted-foreground">Nothing specific</p>}
          <p className="mt-3 text-xs uppercase text-muted-foreground">Next step</p><p className="font-medium">{analysis.nextStep}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => <Button key={t.v} size="sm" variant={tone === t.v ? "default" : "outline"} onClick={() => { setTone(t.v); setEdited(null); }}>{t.l}</Button>)}
      </div>
      <Textarea rows={9} value={reply} onChange={(e) => setEdited(e.target.value)} aria-label="Draft reply" />
      <div className="flex flex-wrap gap-2">
        {phone && <Button asChild size="sm"><a href={whatsappLink(reply, phone.replace(/\D/g, "").replace(/^0/, "234"))} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-4 w-4" />Send via WhatsApp</a></Button>}
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(reply); toast.success("Reply copied"); }}><Copy className="mr-1 h-4 w-4" />Copy reply</Button>
        {onSaveNote && <Button size="sm" variant="outline" onClick={() => onSaveNote(`[${analysis.priority} priority] ${analysis.signals.join(", ")}. Next: ${analysis.nextStep}`)}><Save className="mr-1 h-4 w-4" />Save to notes</Button>}
      </div>
    </div>
  );
}
