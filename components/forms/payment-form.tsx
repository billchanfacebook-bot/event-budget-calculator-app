"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { FormState } from "@/types";

const initialState: FormState = {
  error: ""
};

export function PaymentForm({
  action
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 lg:grid-cols-[160px_180px_1fr]">
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Amount
        </label>
        <input id="amount" name="amount" type="number" min="0" step="0.01" defaultValue={0} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="paymentDate" className="text-sm font-medium">
          Payment date
        </label>
        <input id="paymentDate" name="paymentDate" type="date" />
      </div>
      <div className="space-y-2">
        <label htmlFor="paymentMethod" className="text-sm font-medium">
          Payment method
        </label>
        <input id="paymentMethod" name="paymentMethod" placeholder="Bank transfer / FPS / Cash" />
      </div>
      <div className="space-y-2 lg:col-span-3">
        <label htmlFor="note" className="text-sm font-medium">
          Note
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Deposit paid after vendor confirmation."
        />
      </div>
      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-3">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 lg:col-span-3">
        <SubmitButton
          pendingLabel="Adding payment..."
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Add Payment
        </SubmitButton>
        <p className="text-sm text-ink/55">Saving a payment will update the item total and payment status.</p>
      </div>
    </form>
  );
}
