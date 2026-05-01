import { createEventAction } from "@/app/actions/events";
import { EventForm } from "@/components/forms/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">New event</p>
        <h1 className="mt-3 text-3xl font-semibold">Create event</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          Capture the key details first, then build the budget items under the event detail page.
        </p>
      </div>
      <EventForm action={createEventAction} />
    </div>
  );
}
