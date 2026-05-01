import { notFound } from "next/navigation";
import { createBudgetItemAction } from "@/app/actions/budget-items";
import { EmptyState } from "@/components/empty-state";
import { BudgetItemForm } from "@/components/forms/budget-item-form";
import { getBudgetCategories } from "@/lib/budget-categories";
import { createClient } from "@/lib/supabase/server";

type NewBudgetItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewBudgetItemPage({ params }: NewBudgetItemPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event, error }, categories] = await Promise.all([
    supabase.from("events").select("id, name").eq("id", id).single(),
    getBudgetCategories()
  ]);

  if (error || !event) {
    notFound();
  }

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <EmptyState
          title="No categories available"
          description="Run the Supabase schema seed so your budget categories are created before adding line items."
          actionHref={`/events/${id}`}
          actionLabel="Back to Event"
        />
      </div>
    );
  }

  const action = createBudgetItemAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Budget item</p>
        <h1 className="mt-3 text-3xl font-semibold">Add new item</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          Add a new budget line under <span className="font-semibold">{event.name}</span>.
        </p>
      </div>
      <BudgetItemForm action={action} categories={categories} />
    </div>
  );
}
