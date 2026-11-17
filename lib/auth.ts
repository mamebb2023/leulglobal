import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Server-side gate for the dashboard. Reads the fresh user record (not the
 * unverified cookie payload) and only allows the allow-listed owner email.
 */
export async function requireOwner() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user?.email) {
    redirect("/login");
  }

  if (user.email.toLowerCase() !== (process.env.OWNER_EMAIL ?? "").toLowerCase()) {
    redirect("/login");
  }

  return user;
}
