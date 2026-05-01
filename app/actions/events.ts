"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { EventFormState, FormState } from "@/types";

const eventSchema = z.object({
  name: z.string().trim().min(1, "Event name is required."),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  attendeeCount: z.coerce.number().int().min(0, "Attendee count cannot be negative."),
  status: z.enum(["draft", "active", "completed", "archived"]),
  currency: z.string().trim().min(1, "Currency is required."),
  notes: z.string().optional()
});

const eventNotesSchema = z.object({
  notes: z.string().optional()
});

function normalizeOptionalString(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    eventDate: formData.get("eventDate"),
    location: formData.get("location"),
    attendeeCount: formData.get("attendeeCount"),
    status: formData.get("status"),
    currency: formData.get("currency"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to create event."
    };
  }

  const payload = {
    name: parsed.data.name,
    event_date: normalizeOptionalString(parsed.data.eventDate),
    location: normalizeOptionalString(parsed.data.location),
    attendee_count: parsed.data.attendeeCount,
    status: parsed.data.status,
    currency: parsed.data.currency,
    notes: normalizeOptionalString(parsed.data.notes),
    created_by: user.id
  };

  const { data, error } = await supabase.from("events").insert(payload).select("id").single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to create event."
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEventAction(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    eventDate: formData.get("eventDate"),
    location: formData.get("location"),
    attendeeCount: formData.get("attendeeCount"),
    status: formData.get("status"),
    currency: formData.get("currency"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to update event."
    };
  }

  const { error } = await supabase
    .from("events")
    .update({
      name: parsed.data.name,
      event_date: normalizeOptionalString(parsed.data.eventDate),
      location: normalizeOptionalString(parsed.data.location),
      attendee_count: parsed.data.attendeeCount,
      status: parsed.data.status,
      currency: parsed.data.currency,
      notes: normalizeOptionalString(parsed.data.notes)
    })
    .eq("id", eventId)
    .eq("created_by", user.id);

  if (error) {
    return {
      error: error.message
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);

  redirect(`/events/${eventId}`);
}

export async function deleteEventAction(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("events").delete().eq("id", eventId).eq("created_by", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/events");
  redirect("/events");
}

export async function updateEventNotesAction(
  eventId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = eventNotesSchema.safeParse({
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to update notes."
    };
  }

  const { error } = await supabase
    .from("events")
    .update({
      notes: normalizeOptionalString(parsed.data.notes)
    })
    .eq("id", eventId)
    .eq("created_by", user.id);

  if (error) {
    return {
      error: error.message
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

  return {
    error: ""
  };
}
