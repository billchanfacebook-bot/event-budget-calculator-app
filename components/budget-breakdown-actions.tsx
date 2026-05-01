"use client";

import { useActionState, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/forms/submit-button";
import type { BudgetCategoryRecord, FormState } from "@/types";

const initialState: FormState = { error: "" };

export function BudgetBreakdownActions({
  eventId,
  categories,
  quickAddAction,
  importAction
}: {
  eventId: string;
  categories: BudgetCategoryRecord[];
  quickAddAction: (state: FormState, formData: FormData) => Promise<FormState>;
  importAction: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddState, quickAddFormAction] = useActionState(quickAddAction, initialState);
  const [importState, importFormAction] = useActionState(importAction, initialState);
  const selectedCategoryId = categories[0]?.id ?? "";
  const hasCategories = categories.length > 0;
  const categoryOptions = useMemo(() => categories, [categories]);

  return (
    <div className="flex w-full flex-col gap-3 lg:w-auto lg:max-w-5xl lg:flex-row lg:items-start lg:justify-end">
      <Link
        href={`/events/${eventId}/items/new` as Route}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white hover:opacity-90"
      >
        Add Item
      </Link>
      <button
        type="button"
        onClick={() => setIsQuickAddOpen(true)}
        disabled={!hasCategories}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        Quick Add
      </button>
      <form
        action={importFormAction}
        className="flex w-full flex-col gap-2 rounded-2xl border border-dashed border-border bg-white px-3 py-3 lg:w-[420px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Excel Import</p>
            <p className="text-xs text-ink/55">Drag & drop or choose a workbook to batch import.</p>
          </div>
          <SubmitButton
            pendingLabel="Importing..."
            className="h-9 rounded-full bg-accent px-4 text-xs font-semibold text-white hover:opacity-90"
          >
            Import
          </SubmitButton>
        </div>
        <input
          type="file"
          name="file"
          accept=".xlsx"
          required
          className="min-w-0 rounded-xl border border-border bg-shell px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
        />
        {importState.error ? (
          <p className="text-sm text-red-700">{importState.error}</p>
        ) : null}
      </form>
      <Link
        href={`/events/${eventId}/template` as Route}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold hover:border-accent hover:text-accent"
      >
        Download Template
      </Link>

      {isQuickAddOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-moss">Quick add</p>
                <h3 className="mt-2 text-2xl font-semibold">Add line item fast</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Close
              </button>
            </div>

            {!hasCategories ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No budget categories available yet. Create categories first before using Quick Add.
              </p>
            ) : (
              <form action={quickAddFormAction} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="quick-itemName" className="text-sm font-medium">
                    Item
                  </label>
                  <input id="quick-itemName" name="itemName" placeholder="Venue deposit" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-categoryId" className="text-sm font-medium">
                    Category
                  </label>
                  <select id="quick-categoryId" name="categoryId" defaultValue={selectedCategoryId} required>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-vendor" className="text-sm font-medium">
                    Vendor
                  </label>
                  <input id="quick-vendor" name="vendor" placeholder="Harbour Hall" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-estimatedCost" className="text-sm font-medium">
                    Estimated
                  </label>
                  <input id="quick-estimatedCost" name="estimatedCost" type="number" min="0" step="0.01" defaultValue={0} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-actualCost" className="text-sm font-medium">
                    Actual
                  </label>
                  <input id="quick-actualCost" name="actualCost" type="number" min="0" step="0.01" defaultValue={0} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-paymentStatus" className="text-sm font-medium">
                    Status
                  </label>
                  <select id="quick-paymentStatus" name="paymentStatus" defaultValue="pending">
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially paid</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="quick-dueDate" className="text-sm font-medium">
                    Due
                  </label>
                  <input id="quick-dueDate" name="dueDate" type="date" />
                </div>
                <input type="hidden" name="notes" value="" />
                {quickAddState.error ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                    {quickAddState.error}
                  </p>
                ) : null}
                <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                  <SubmitButton
                    pendingLabel="Saving..."
                    className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Save Item
                  </SubmitButton>
                  <p className="text-sm text-ink/55">This uses the same validation as the full Add Item form.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
