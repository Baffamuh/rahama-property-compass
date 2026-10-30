import { supabase } from "@/integrations/supabase/client";

/** True only for a signed-in user holding the admin role in the database. */
export async function isAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok === true;
}
