"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address.")
});

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your new password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export async function signInAction(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to sign in."
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: error.message
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: { error: string; success: string },
  formData: FormData
): Promise<{ error: string; success: string }> {
  const parsed = passwordResetSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to send reset email.",
      success: ""
    };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const redirectTo = origin ? `${origin}/auth/callback?next=/update-password` : undefined;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo
  });

  if (error) {
    return {
      error: error.message,
      success: ""
    };
  }

  return {
    error: "",
    success: "If that email exists, a password reset link has been sent."
  };
}

export async function updatePasswordAction(
  _prevState: { error: string; success: string },
  formData: FormData
): Promise<{ error: string; success: string }> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to update password.",
      success: ""
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Recovery session not found. Open the reset link from your email and try again.",
      success: ""
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  });

  if (error) {
    return {
      error: error.message,
      success: ""
    };
  }

  return {
    error: "",
    success: "Password updated successfully. You can now continue using the app."
  };
}
