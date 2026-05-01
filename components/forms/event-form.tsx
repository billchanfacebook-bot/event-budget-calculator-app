"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { EventFormState, EventFormValues } from "@/types";

const initialState: EventFormState = {
  error: ""
};

export function EventForm({
  action,
  defaults,
  submitLabel = "Create Event"
}: {
  action: (state: EventFormState, formData: FormData) => Promise<EventFormState>;
  defaults?: Partial<EventFormValues>;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="name" className="text-sm font-medium">
            Event name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={defaults?.name ?? ""}
            placeholder="Annual Charity Gala"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="eventDate" className="text-sm font-medium">
            Event date
          </label>
          <input id="eventDate" name="eventDate" type="date" defaultValue={defaults?.eventDate ?? ""} />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="Hong Kong Convention Centre"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="attendeeCount" className="text-sm font-medium">
            Attendee count
          </label>
          <input
            id="attendeeCount"
            name="attendeeCount"
            type="number"
            min="0"
            defaultValue={defaults?.attendeeCount ?? 0}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={defaults?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Currency
          </label>
          <select id="currency" name="currency" defaultValue={defaults?.currency ?? "HKD"}>
            <option value="HKD">HKD</option>
            <option value="USD">USD</option>
            <option value="CNY">CNY</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={defaults?.notes ?? ""}
            placeholder="Add planning notes, sponsor notes, or critical reminders."
          />
        </div>
      </div>
      {state.error ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SubmitButton className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          {submitLabel}
        </SubmitButton>
        <p className="text-sm text-ink/55">Changes will be saved directly to Supabase.</p>
      </div>
    </form>
  );
}
