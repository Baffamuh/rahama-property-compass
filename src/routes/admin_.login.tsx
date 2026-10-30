import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import logo from "@/assets/rahama-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, DEMO_ADMIN } from "@/lib/store";

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.signIn(email, password)) navigate({ to: "/admin" });
    else setError("Incorrect email or password.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <img src={logo} alt="Rahama logo" className="mx-auto h-16 rounded-md" />
        <h1 className="mt-6 text-center text-2xl font-bold">Admin portal</h1>
        <p className="text-center text-sm text-muted-foreground">Sign in to manage listings and enquiries</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full"><Lock className="h-4 w-4" />Sign in</Button>
        </form>
        <p className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">Demo access: {DEMO_ADMIN.email} / {DEMO_ADMIN.password}</p>
      </div>
    </div>
  );
}
