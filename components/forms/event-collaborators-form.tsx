"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { EventCollaboratorRecord, FormState } from "@/types";

const initialState: FormState = {
  error: ""
};

export function EventCollaboratorsForm({
  collaborators,
  addAction,
  removeAction,
  canManage
}: {
  collaborators: EventCollaboratorRecord[];
  addAction: (state: FormState, formData: FormData) => Promise<FormState>;
  removeAction: (collaboratorId: string) => Promise<void>;
  canManage: boolean;
}) {
  const [state, formAction] = useActionState(addAction, initialState);

  return (
    <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Collaboration</p>
        <h2 className="text-2xl font-semibold">Collaborators</h2>
        <p className="text-sm leading-7 text-ink/65">
          Add teammates by login email. Collaborators can view and update this event, budget items, and payments.
        </p>
      </div>

      {canManage ? (
        <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            placeholder="teammate@example.com"
            required
            className="min-w-0 flex-1"
          />
          <SubmitButton
            pendingLabel="Adding..."
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Add Collaborator
          </SubmitButton>
        </form>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-shell px-4 py-3 text-sm text-ink/65">
          Only the event owner can manage the collaborator list.
        </p>
      )}

      {state.error ? (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
        {collaborators.length === 0 ? (
          <p className="px-4 py-5 text-sm text-ink/55">No collaborators added yet.</p>
        ) : (
          collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{collaborator.email}</p>
                <p className="text-sm capitalize text-ink/50">{collaborator.role}</p>
              </div>
              {canManage ? (
                <form action={removeAction.bind(null, collaborator.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
