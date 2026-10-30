import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/rahama-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Rahama Property Hub" },
      { name: "description", content: "Staff sign-in for the Rahama Property Hub admin portal." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — Rahama" },
      { property: "og:description", content: "Staff portal." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setBusy(true);
    if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      setBusy(false);
      if (error) setError(error.message);
      else { toast.success("Check your email for a password reset link."); setForgot(false); }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setBusy(false); setError("Incorrect email or password."); return; }
    if (!(await isAdmin())) { await supabase.auth.signOut(); setBusy(false); setError("This account does not have admin access."); return; }
    navigate({ to: "/admin" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <img src={logo} alt="Rahama logo" className="mx-auto h-16 rounded-md" />
        <h1 className="mt-6 text-center text-2xl font-bold">{forgot ? "Reset password" : "Admin portal"}</h1>
        <p className="text-center text-sm text-muted-foreground">{forgot ? "We'll email you a link to set a new password" : "Sign in to manage listings and enquiries"}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {!forgot && <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}><Lock className="h-4 w-4" />{forgot ? "Send reset link" : "Sign in"}</Button>
        </form>
        <button type="button" onClick={() => { setForgot(!forgot); setError(""); }} className="mt-4 w-full text-center text-sm text-primary underline">
          {forgot ? "Back to sign in" : "Forgot password?"}
        </button>
      </div>
    </div>
  );
}
