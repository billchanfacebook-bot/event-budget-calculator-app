import type { Route } from "next";
import Link from "next/link";
import { BudgetBreakdownActions } from "@/components/budget-breakdown-actions";
import type { BudgetCategoryRecord, FormState } from "@/types";
import type { BudgetItemRecord } from "@/types";

export function BudgetItemTable({
  items,
  eventId,
  helperText,
  categories,
  quickAddAction,
  importAction
}: {
  items: BudgetItemRecord[];
  eventId: string;
  helperText?: string;
  categories: BudgetCategoryRecord[];
  quickAddAction: (state: FormState, formData: FormData) => Promise<FormState>;
  importAction: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-moss">Line items</p>
          <h2 className="mt-2 text-2xl font-semibold">Budget breakdown</h2>
          {helperText ? <p className="mt-2 text-sm text-ink/60">{helperText}</p> : null}
        </div>
        <BudgetBreakdownActions
          eventId={eventId}
          categories={categories}
          quickAddAction={quickAddAction}
          importAction={importAction}
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center text-sm text-ink/60">
          No budget items match the current view. Try changing filters or add the first line item for this event.
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-shell">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Estimated</th>
                  <th className="px-4 py-3 font-medium">Actual</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 font-medium">{item.itemName}</td>
                    <td className="px-4 py-4">{item.categoryName}</td>
                    <td className="px-4 py-4">{item.vendor}</td>
                    <td className="px-4 py-4">${item.estimatedCost.toLocaleString()}</td>
                    <td className="px-4 py-4">${item.actualCost.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">{item.dueDate}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/events/${item.eventId}/items/${item.id}/edit` as Route}
                        className="font-medium text-accent"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.itemName}</h3>
                    <p className="mt-1 text-sm text-ink/60">{item.categoryName}</p>
                  </div>
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                    {item.paymentStatus}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <p>Estimated: ${item.estimatedCost.toLocaleString()}</p>
                  <p>Actual: ${item.actualCost.toLocaleString()}</p>
                  <p>Vendor: {item.vendor}</p>
                  <p>Due: {item.dueDate}</p>
                </div>
                <Link
                  href={`/events/${item.eventId}/items/${item.id}/edit` as Route}
                  className="mt-4 inline-flex text-sm font-semibold text-accent"
                >
                  Edit Item
                </Link>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
