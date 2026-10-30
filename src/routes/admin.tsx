import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Building2, ExternalLink, Inbox, LayoutDashboard, Map, LogOut, Trophy, Menu } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isAdmin())) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/properties", label: "Properties", icon: Building2, exact: false },
  { to: "/admin/locations", label: "Zones & Areas", icon: Map, exact: false },
  { to: "/admin/agents", label: "Agents & Sales", icon: Trophy, exact: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login", replace: true }); };

  const links = (
    <nav className="space-y-1">
      {nav.map((n) => (
        <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }} onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground">
          <n.icon className="h-4 w-4" />{n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className={`no-print fixed inset-y-0 left-0 z-40 w-60 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex ${open ? "flex" : "hidden"}`}>
        <div className="mb-8 px-2"><p className="font-display text-lg font-bold">Rahama Hub</p><p className="text-xs opacity-70">Admin portal</p></div>
        {links}
        <div className="mt-auto space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent"><ExternalLink className="h-4 w-4" />View website</Link>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm opacity-80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0 flex-1 md:ml-60 print:ml-0">
        <header className="no-print flex h-14 items-center border-b bg-background px-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></Button>
          <span className="ml-2 font-display font-bold">Rahama Hub</span>
        </header>
        <main className="p-4 md:p-8 print:p-0"><Outlet /></main>
      </div>
    </div>
  );
}
