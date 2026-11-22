"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  changePasswordSchema,
  type ChangePasswordState,
} from "@/lib/validators";

export type LoginState = { error: string } | null;

export async function signInAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  // Sign-ups may still be open in Supabase, so a valid non-owner account must
  // not be allowed to keep a session. The proxy and requireOwner() reject it
  // too; this makes the login form fail clearly.
  if (
    data.user.email?.toLowerCase() !==
    (process.env.OWNER_EMAIL ?? "").toLowerCase()
  ) {
    await supabase.auth.signOut();
    return { error: "This account is not allowed." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePasswordAction(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return { status: "error", error: "Unable to verify your account." };
  }

  // Verify the current password before allowing a change.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { status: "error", error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { status: "error", error: "Failed to update password. Try again." };
  }

  return { status: "success" };
}
