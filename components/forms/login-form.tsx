"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = {
  error: ""
};

export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton
        pendingLabel="Signing in..."
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Sign In
      </SubmitButton>
      <div className="flex items-center justify-between text-sm text-ink/60">
        <Link href="/forgot-password" className="text-accent">
          Forgot password
        </Link>
        <span>Supabase email/password login</span>
      </div>
    </form>
  );
}
