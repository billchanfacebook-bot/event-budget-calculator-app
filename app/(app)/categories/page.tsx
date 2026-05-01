import { createBudgetCategoryAction, updateBudgetCategoryAction } from "@/app/actions/budget-categories";
import { DeleteCategoryButton } from "@/components/delete-category-button";
import { BudgetCategoryForm } from "@/components/forms/budget-category-form";
import { EmptyState } from "@/components/empty-state";
import { getBudgetCategories } from "@/lib/budget-categories";

export default async function CategoriesPage() {
  const categories = await getBudgetCategories();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Budget categories</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold">Manage shared budget categories</h1>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Add or refine the category list used across all events. Deleting a category will keep existing line
              items, but they will become uncategorized.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.3em] text-moss">New category</p>
          <h2 className="mt-2 text-2xl font-semibold">Create a reusable category</h2>
        </div>
        <BudgetCategoryForm
          action={createBudgetCategoryAction}
          submitLabel="Add Category"
          pendingLabel="Adding..."
          helperText="Use simple slugs like venue, catering, or sponsorship. Spaces will be normalized to hyphens."
        />
      </section>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first budget category so new event line items can be grouped consistently."
          actionHref="/categories"
          actionLabel="Refresh Page"
        />
      ) : (
        <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.3em] text-moss">Existing categories</p>
            <h2 className="mt-2 text-2xl font-semibold">Edit names, slugs, and order</h2>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const action = updateBudgetCategoryAction.bind(null, category.id);

              return (
                <article key={category.id} className="rounded-[1.5rem] border border-border bg-white p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="flex-1">
                      <BudgetCategoryForm
                        action={action}
                        submitLabel="Save"
                        pendingLabel="Saving..."
                        defaults={category}
                        compact
                      />
                    </div>
                    <DeleteCategoryButton categoryId={category.id} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
