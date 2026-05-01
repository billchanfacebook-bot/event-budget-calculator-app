"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types";

const collaboratorSchema = z.object({
  email: z.string().trim().email("Please enter a valid collaborator email.")
});

export async function addEventCollaboratorAction(
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

  const parsed = collaboratorSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to add collaborator."
    };
  }

  const email = parsed.data.email.toLowerCase();

  if (email === user.email?.toLowerCase()) {
    return {
      error: "This email is already the event owner."
    };
  }

  const { error } = await supabase.from("event_collaborators").insert({
    event_id: eventId,
    email,
    role: "editor",
    added_by: user.id
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "This collaborator is already on the list."
      };
    }

    return {
      error: error.message
    };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);

  return {
    error: ""
  };
}

export async function removeEventCollaboratorAction(eventId: string, collaboratorId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("event_collaborators")
    .delete()
    .eq("id", collaboratorId)
    .eq("event_id", eventId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);
  redirect(`/events/${eventId}/settings`);
}
