"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ExcelJS from "exceljs";
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

function normalizeStatus(value: string | undefined) {
  const normalized = value?.trim().toLowerCase().replaceAll(" ", "_");

  switch (normalized) {
    case "pending":
    case "partially_paid":
    case "paid":
    case "cancelled":
      return normalized;
    default:
      return "pending";
  }
}

function parseNumericCell(value: ExcelJS.CellValue) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.trim() || 0);
  if (value && typeof value === "object" && "result" in value) {
    return Number(value.result ?? 0);
  }
  return 0;
}

function parseTextCell(value: ExcelJS.CellValue) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value && typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text.trim();
  }
  if (value && typeof value === "object" && "result" in value) {
    return String(value.result ?? "").trim();
  }
  return "";
}

function parseDateCell(value: ExcelJS.CellValue) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = parseTextCell(value);
  if (!text) return null;

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
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

export async function importBudgetItemsAction(
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

  const upload = formData.get("file");

  if (!(upload instanceof File) || upload.size === 0) {
    return {
      error: "Please choose an Excel file to import."
    };
  }

  const [{ data: categories, error: categoriesError }, workbookBuffer] = await Promise.all([
    supabase.from("budget_categories").select("id, name"),
    upload.arrayBuffer()
  ]);

  if (categoriesError) {
    return {
      error: categoriesError.message
    };
  }

  const categoryMap = new Map(
    (categories ?? []).map((category) => [category.name.trim().toLowerCase(), category.id])
  );

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(workbookBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return {
      error: "The uploaded workbook does not contain any sheets."
    };
  }

  const inserts: Array<Record<string, string | number | null>> = [];

  for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const rawRow = worksheet.getRow(rowNumber).values;
    if (!Array.isArray(rawRow)) continue;

    const itemName = parseTextCell(rawRow[1]);
    const categoryName = parseTextCell(rawRow[2]);
    const vendor = parseTextCell(rawRow[3]);
    const estimatedCost = parseNumericCell(rawRow[4]);
    const actualCost = parseNumericCell(rawRow[5]);
    const paymentStatus = normalizeStatus(parseTextCell(rawRow[6]));
    const dueDate = parseDateCell(rawRow[7]);
    const notes = parseTextCell(rawRow[8]);

    if (!itemName && !categoryName && !vendor && estimatedCost === 0 && actualCost === 0 && !dueDate && !notes) {
      continue;
    }

    const categoryId = categoryMap.get(categoryName.toLowerCase());

    if (!itemName) {
      return {
        error: "Every imported row must include an Item value."
      };
    }

    if (!categoryId) {
      return {
        error: `Category "${categoryName || "(blank)"}" does not match your configured categories.`
      };
    }

    inserts.push({
      event_id: eventId,
      category_id: categoryId,
      item_name: itemName,
      vendor: normalizeOptionalString(vendor),
      estimated_cost: estimatedCost,
      actual_cost: actualCost,
      payment_status: paymentStatus,
      due_date: dueDate,
      notes: normalizeOptionalString(notes),
      created_by: user.id
    });
  }

  if (inserts.length === 0) {
    return {
      error: "No importable rows were found in the workbook."
    };
  }

  const { error } = await supabase.from("budget_items").insert(inserts);

  if (error) {
    return {
      error: error.message
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

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
