"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState = {
  error: "",
  success: ""
};

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
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
        pendingLabel="Updating password..."
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Update Password
      </SubmitButton>
    </form>
  );
}
