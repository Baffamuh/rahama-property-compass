import { createServerFn } from "@tanstack/react-start";

// One-time: creates the company admin account. Removed after use.
export const bootstrapAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = "rahmalapd@gmail.com";
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  let user = list?.users.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password: "rahama2026", email_confirm: true });
    if (error) return { ok: false, error: error.message };
    user = data.user!;
  }
  const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
  return { ok: !error, error: error?.message ?? null };
});
