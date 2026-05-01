"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = {
  error: "",
  success: ""
};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <SubmitButton
        pendingLabel="Sending reset link..."
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Send Reset Link
      </SubmitButton>
    </form>
  );
}
