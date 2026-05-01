import { notFound } from "next/navigation";
import { updateEventAction } from "@/app/actions/events";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventForm } from "@/components/forms/event-form";
import { createClient } from "@/lib/supabase/server";

type EventSettingsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventSettingsPage({ params }: EventSettingsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, name, event_date, location, attendee_count, status, currency, notes")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const action = updateEventAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Event settings</p>
        <h1 className="mt-3 text-3xl font-semibold">Edit event</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          This page reuses the event form component so updates stay consistent with creation.
        </p>
        <div className="mt-5">
          <DeleteEventButton eventId={id} />
        </div>
      </div>
      <EventForm
        defaults={{
          name: data.name,
          eventDate: data.event_date ?? "",
          location: data.location ?? "",
          attendeeCount: data.attendee_count ?? 0,
          status: data.status,
          currency: data.currency,
          notes: data.notes ?? ""
        }}
        action={action}
        submitLabel="Save Changes"
      />
    </div>
  );
}
