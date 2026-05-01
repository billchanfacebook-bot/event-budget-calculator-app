"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { FormState } from "@/types";

const initialState: FormState = {
  error: ""
};

export function EventNotesForm({
  action,
  defaultValue
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValue: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Event notes</p>
        <h2 className="mt-3 text-xl font-semibold">Planning snapshot</h2>
      </div>
      <textarea
        name="notes"
        rows={8}
        defaultValue={defaultValue}
        placeholder="Add planning notes, sponsor reminders, approvals, or delivery checkpoints."
      />
      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton
          pendingLabel="Saving notes..."
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Save Notes
        </SubmitButton>
        <p className="text-sm text-ink/55">Notes save directly to this event record.</p>
      </div>
    </form>
  );
}
