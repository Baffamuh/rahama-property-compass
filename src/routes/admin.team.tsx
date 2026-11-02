import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { createAdminAccount } from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Admin Accounts — Rahama Admin" }, { name: "description", content: "Create admin accounts." }, { property: "og:title", content: "Admin Accounts — Rahama Admin" }, { property: "og:description", content: "Create admin accounts." }] }),
  component: Team,
});

function Team() {
  const create = useServerFn(createAdminAccount);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await create({ data: f });
      if (r.ok) { toast.success(`${r.email} can now sign in`); setF({ name: "", email: "", password: "" }); }
      else toast.error(r.error);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="max-w-md space-y-6">
      <div><h1 className="text-2xl font-bold md:text-3xl">Admin accounts</h1><p className="text-muted-foreground">New admins can sign in straight away — no email confirmation.</p></div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-4">
        <div className="space-y-1.5"><Label htmlFor="n">Full name</Label><Input id="n" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Password</Label><Input id="p" type="text" minLength={6} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <Button type="submit" className="w-full" disabled={busy}><UserPlus className="h-4 w-4" />{busy ? "Creating…" : "Create admin"}</Button>
      </form>
    </div>
  );
}
