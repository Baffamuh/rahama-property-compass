import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { actions } from "@/lib/store";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Invalid email").max(255)]),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
});

export function EnquiryForm({ propertyRef, propertyTitle, defaultMessage = "" }: { propertyRef?: string; propertyTitle?: string; defaultMessage?: string }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: defaultMessage });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    actions.addEnquiry({
      name: r.data.name, phone: r.data.phone, message: r.data.message,
      ...(r.data.email ? { email: r.data.email } : {}),
      ...(propertyRef ? { propertyRef } : {}),
      ...(propertyTitle ? { propertyTitle } : {}),
    });
    setSent(true);
    toast.success("Enquiry sent — our team will contact you shortly.");
  };

  if (sent)
    return (
      <div className="rounded-xl border bg-secondary p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-3 font-semibold">Thank you, {form.name.split(" ")[0]}!</p>
        <p className="text-sm text-muted-foreground">We've received your enquiry and will be in touch.</p>
        <Button variant="link" onClick={() => { setSent(false); setForm({ name: "", phone: "", email: "", message: defaultMessage }); }}>Send another</Button>
      </div>
    );

  const field = (k: keyof typeof form, label: string, el: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      {el}
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {field("name", "Full name", <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />)}
      {field("phone", "Phone / WhatsApp", <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />)}
      {field("email", "Email (optional)", <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />)}
      {field("message", "Message", <Textarea id="message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />)}
      <Button type="submit" className="w-full" size="lg">Send enquiry</Button>
    </form>
  );
}
