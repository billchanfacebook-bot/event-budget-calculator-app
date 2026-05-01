"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types";

const budgetItemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required."),
  categoryId: z.string().uuid("Please choose a valid category."),
  vendor: z.string().optional(),
  estimatedCost: z.coerce.number().min(0, "Estimated cost cannot be negative."),
  actualCost: z.coerce.number().min(0, "Actual cost cannot be negative."),
  paymentStatus: z.enum(["pending", "partially_paid", "paid", "cancelled"]),
  dueDate: z.string().optional(),
  notes: z.string().optional()
});

function normalizeOptionalString(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function createBudgetItemAction(
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

  const parsed = budgetItemSchema.safeParse({
    itemName: formData.get("itemName"),
    categoryId: formData.get("categoryId"),
    vendor: formData.get("vendor"),
    estimatedCost: formData.get("estimatedCost"),
    actualCost: formData.get("actualCost"),
    paymentStatus: formData.get("paymentStatus"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to create budget item."
    };
  }

  const { error } = await supabase.from("budget_items").insert({
    event_id: eventId,
    category_id: parsed.data.categoryId,
    item_name: parsed.data.itemName,
    vendor: normalizeOptionalString(parsed.data.vendor),
    estimated_cost: parsed.data.estimatedCost,
    actual_cost: parsed.data.actualCost,
    payment_status: parsed.data.paymentStatus,
    due_date: normalizeOptionalString(parsed.data.dueDate),
    notes: normalizeOptionalString(parsed.data.notes),
    created_by: user.id
  });

  if (error) {
    return {
      error: error.message
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/items/new`);
  redirect(`/events/${eventId}`);
}

export async function updateBudgetItemAction(
  eventId: string,
  itemId: string,
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

  const parsed = budgetItemSchema.safeParse({
    itemName: formData.get("itemName"),
    categoryId: formData.get("categoryId"),
    vendor: formData.get("vendor"),
    estimatedCost: formData.get("estimatedCost"),
    actualCost: formData.get("actualCost"),
    paymentStatus: formData.get("paymentStatus"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to update budget item."
    };
  }

  const { error } = await supabase
    .from("budget_items")
    .update({
      category_id: parsed.data.categoryId,
      item_name: parsed.data.itemName,
      vendor: normalizeOptionalString(parsed.data.vendor),
      estimated_cost: parsed.data.estimatedCost,
      actual_cost: parsed.data.actualCost,
      payment_status: parsed.data.paymentStatus,
      due_date: normalizeOptionalString(parsed.data.dueDate),
      notes: normalizeOptionalString(parsed.data.notes)
    })
    .eq("id", itemId)
    .eq("event_id", eventId);

  if (error) {
    return {
      error: error.message
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/items/${itemId}/edit`);
  redirect(`/events/${eventId}`);
}

export async function deleteBudgetItemAction(eventId: string, itemId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("budget_items")
    .delete()
    .eq("id", itemId)
    .eq("event_id", eventId);

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
