import { mapBudgetCategory } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

export async function getBudgetCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapBudgetCategory);
}
