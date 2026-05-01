import { notFound } from "next/navigation";
import {
  addEventCollaboratorAction,
  removeEventCollaboratorAction
} from "@/app/actions/collaborators";
import { updateEventAction } from "@/app/actions/events";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventCollaboratorsForm } from "@/components/forms/event-collaborators-form";
import { EventForm } from "@/components/forms/event-form";
import { createClient } from "@/lib/supabase/server";
import type { EventCollaboratorRecord } from "@/types";

type EventSettingsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventSettingsPage({ params }: EventSettingsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [
    { data, error },
    { data: collaborators, error: collaboratorsError },
    {
      data: { user }
    }
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, event_date, location, attendee_count, status, currency, budget_cap, notes, created_by")
      .eq("id", id)
      .single(),
    supabase
      .from("event_collaborators")
      .select("id, email, role, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
    supabase.auth.getUser()
  ]);

  if (error || !data || collaboratorsError) {
    notFound();
  }

  const action = updateEventAction.bind(null, id);
  const addCollaborator = addEventCollaboratorAction.bind(null, id);
  const removeCollaborator = removeEventCollaboratorAction.bind(null, id);
  const canManageCollaborators = user?.id === data.created_by;
  const collaboratorRecords: EventCollaboratorRecord[] = (collaborators ?? []).map((collaborator) => ({
    id: collaborator.id,
    email: collaborator.email,
    role: collaborator.role,
    createdAt: collaborator.created_at
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Event settings</p>
        <h1 className="mt-3 text-3xl font-semibold">Edit event</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          This page reuses the event form component so updates stay consistent with creation.
        </p>
        {canManageCollaborators ? (
        <div className="mt-5">
          <DeleteEventButton eventId={id} />
        </div>
        ) : null}
      </div>
      <EventForm
        defaults={{
          name: data.name,
          eventDate: data.event_date ?? "",
          location: data.location ?? "",
          attendeeCount: data.attendee_count ?? 0,
          status: data.status,
          currency: data.currency,
          budgetCap: Number(data.budget_cap ?? 0),
          notes: data.notes ?? ""
        }}
        action={action}
        submitLabel="Save Changes"
      />
      <EventCollaboratorsForm
        collaborators={collaboratorRecords}
        addAction={addCollaborator}
        removeAction={removeCollaborator}
        canManage={canManageCollaborators}
      />
    </div>
  );
}
