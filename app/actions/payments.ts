"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types";

const paymentSchema = z.object({
  amount: z.coerce.number().min(0, "Payment amount cannot be negative."),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  note: z.string().optional()
});

function normalizeOptionalString(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

async function syncBudgetItemPaymentSummary(eventId: string, itemId: string, userId: string) {
  const supabase = await createClient();
  const [{ data: item, error: itemError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase
      .from("budget_items")
      .select("estimated_cost")
      .eq("id", itemId)
      .eq("event_id", eventId)
      .eq("created_by", userId)
      .single(),
    supabase.from("payments").select("amount").eq("budget_item_id", itemId)
  ]);

  if (itemError || !item) {
    throw new Error(itemError?.message ?? "Unable to refresh payment totals.");
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const totalPaid = (payments ?? []).reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const estimated = Number(item.estimated_cost ?? 0);
  const paymentStatus =
    totalPaid <= 0 ? "pending" : totalPaid >= estimated || estimated === 0 ? "paid" : "partially_paid";

  const { error: updateError } = await supabase
    .from("budget_items")
    .update({
      actual_cost: totalPaid,
      payment_status: paymentStatus
    })
    .eq("id", itemId)
    .eq("event_id", eventId)
    .eq("created_by", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function revalidatePaymentViews(eventId: string, itemId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/items/${itemId}/edit`);
}

export async function createPaymentAction(
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

  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    paymentDate: formData.get("paymentDate"),
    paymentMethod: formData.get("paymentMethod"),
    note: formData.get("note")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to add payment."
    };
  }

  const { error } = await supabase.from("payments").insert({
    budget_item_id: itemId,
    amount: parsed.data.amount,
    payment_date: normalizeOptionalString(parsed.data.paymentDate),
    payment_method: normalizeOptionalString(parsed.data.paymentMethod),
    note: normalizeOptionalString(parsed.data.note),
    created_by: user.id
  });

  if (error) {
    return {
      error: error.message
    };
  }

  try {
    await syncBudgetItemPaymentSummary(eventId, itemId, user.id);
  } catch (syncError) {
    return {
      error: syncError instanceof Error ? syncError.message : "Unable to sync payment totals."
    };
  }

  revalidatePaymentViews(eventId, itemId);

  return {
    error: ""
  };
}

export async function deletePaymentAction(eventId: string, itemId: string, paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("payments").delete().eq("id", paymentId).eq("created_by", user.id);
  await syncBudgetItemPaymentSummary(eventId, itemId, user.id);

  revalidatePaymentViews(eventId, itemId);
  redirect(`/events/${eventId}/items/${itemId}/edit`);
}
