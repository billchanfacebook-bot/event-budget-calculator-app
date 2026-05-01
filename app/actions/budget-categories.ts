"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types";

const budgetCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  slug: z.string().trim().min(1, "Category slug is required."),
  sortOrder: z.coerce.number().int().min(0, "Sort order cannot be negative.")
});

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function revalidateCategoryViews() {
  revalidatePath("/categories");
  revalidatePath("/events", "layout");
  revalidatePath("/dashboard");
}

export async function createBudgetCategoryAction(
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

  const parsed = budgetCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to create category."
    };
  }

  const slug = normalizeSlug(parsed.data.slug);

  if (!slug) {
    return {
      error: "Category slug must contain letters or numbers."
    };
  }

  const { error } = await supabase.from("budget_categories").insert({
    name: parsed.data.name,
    slug,
    sort_order: parsed.data.sortOrder
  });

  if (error) {
    return {
      error: error.message
    };
  }

  revalidateCategoryViews();

  return {
    error: ""
  };
}

export async function updateBudgetCategoryAction(
  categoryId: string,
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

  const parsed = budgetCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to update category."
    };
  }

  const slug = normalizeSlug(parsed.data.slug);

  if (!slug) {
    return {
      error: "Category slug must contain letters or numbers."
    };
  }

  const { error } = await supabase
    .from("budget_categories")
    .update({
      name: parsed.data.name,
      slug,
      sort_order: parsed.data.sortOrder
    })
    .eq("id", categoryId);

  if (error) {
    return {
      error: error.message
    };
  }

  revalidateCategoryViews();

  return {
    error: ""
  };
}

export async function deleteBudgetCategoryAction(categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("budget_categories").delete().eq("id", categoryId);

  revalidateCategoryViews();
  redirect("/categories");
}
