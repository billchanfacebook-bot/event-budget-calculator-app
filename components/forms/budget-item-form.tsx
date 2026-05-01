"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { BudgetCategoryRecord, BudgetItemFormValues, FormState } from "@/types";

const initialValues: BudgetItemFormValues = {
  itemName: "",
  categoryId: "",
  vendor: "",
  estimatedCost: 0,
  actualCost: 0,
  paymentStatus: "pending",
  dueDate: "",
  notes: ""
};

const initialState: FormState = {
  error: ""
};

export function BudgetItemForm({
  action,
  categories,
  defaults,
  submitLabel = "Create Item"
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: BudgetCategoryRecord[];
  defaults?: BudgetItemFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const selectedCategoryId = defaults?.categoryId ?? categories[0]?.id ?? initialValues.categoryId;

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="itemName" className="text-sm font-medium">
            Item name
          </label>
          <input
            id="itemName"
            name="itemName"
            defaultValue={defaults?.itemName ?? ""}
            placeholder="Venue deposit"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Category
          </label>
          <select id="categoryId" name="categoryId" defaultValue={selectedCategoryId} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="vendor" className="text-sm font-medium">
            Vendor
          </label>
          <input
            id="vendor"
            name="vendor"
            defaultValue={defaults?.vendor ?? ""}
            placeholder="Harbour Hall"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="estimatedCost" className="text-sm font-medium">
            Estimated cost
          </label>
          <input
            id="estimatedCost"
            name="estimatedCost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults?.estimatedCost ?? 0}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="actualCost" className="text-sm font-medium">
            Actual cost
          </label>
          <input
            id="actualCost"
            name="actualCost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={defaults?.actualCost ?? 0}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="paymentStatus" className="text-sm font-medium">
            Payment status
          </label>
          <select id="paymentStatus" name="paymentStatus" defaultValue={defaults?.paymentStatus ?? "pending"}>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially paid</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaults?.dueDate ?? ""}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={defaults?.notes ?? ""}
            placeholder="Add payment notes, quote conditions, or supplier details."
          />
        </div>
      </div>
      {state.error ? (
        <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SubmitButton className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          {submitLabel}
        </SubmitButton>
        <p className="text-sm text-ink/55">Budget items will be saved directly to Supabase.</p>
      </div>
    </form>
  );
}
