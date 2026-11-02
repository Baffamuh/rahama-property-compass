import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Input = { name: string; email: string; password: string };

/** Creates a ready-to-use admin account (no email verification). Caller must be an admin. */
export const createAdminAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    const name = String(d?.name ?? "").trim();
    const email = String(d?.email ?? "").trim().toLowerCase();
    const password = String(d?.password ?? "");
    if (name.length < 2 || name.length > 100) throw new Error("Enter a name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email");
    if (password.length < 6 || password.length > 72) throw new Error("Password must be 6–72 characters");
    return { name, email, password };
  })
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!ok) throw new Error("Only admins can create admin accounts");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true, user_metadata: { name: data.name },
    });
    if (error || !created.user) return { ok: false as const, error: error?.message ?? "Could not create account" };
    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) return { ok: false as const, error: "Account created but admin access failed" };
    return { ok: true as const, email: data.email };
  });
