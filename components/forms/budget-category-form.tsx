"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/submit-button";
import type { BudgetCategoryRecord, FormState } from "@/types";

const initialState: FormState = {
  error: ""
};

type BudgetCategoryFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  defaults?: Pick<BudgetCategoryRecord, "name" | "slug" | "sortOrder">;
  compact?: boolean;
  helperText?: string;
};

export function BudgetCategoryForm({
  action,
  submitLabel,
  pendingLabel,
  defaults,
  compact = false,
  helperText
}: BudgetCategoryFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className={compact ? "grid gap-4 lg:grid-cols-[1.6fr_1.2fr_140px_auto]" : "space-y-4"}>
      <div className="space-y-2">
        <label htmlFor={compact ? `name-${defaults?.slug ?? "new"}` : "name"} className="text-sm font-medium">
          Category name
        </label>
        <input
          id={compact ? `name-${defaults?.slug ?? "new"}` : "name"}
          name="name"
          defaultValue={defaults?.name ?? ""}
          placeholder="Venue"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={compact ? `slug-${defaults?.slug ?? "new"}` : "slug"} className="text-sm font-medium">
          Slug
        </label>
        <input
          id={compact ? `slug-${defaults?.slug ?? "new"}` : "slug"}
          name="slug"
          defaultValue={defaults?.slug ?? ""}
          placeholder="venue"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={compact ? `sortOrder-${defaults?.slug ?? "new"}` : "sortOrder"}
          className="text-sm font-medium"
        >
          Sort order
        </label>
        <input
          id={compact ? `sortOrder-${defaults?.slug ?? "new"}` : "sortOrder"}
          name="sortOrder"
          type="number"
          min="0"
          step="1"
          defaultValue={defaults?.sortOrder ?? 0}
          required
        />
      </div>

      <div className={compact ? "flex items-end" : "pt-2"}>
        <SubmitButton
          pendingLabel={pendingLabel}
          className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          {submitLabel}
        </SubmitButton>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-full">
          {state.error}
        </p>
      ) : null}

      {helperText ? <p className="text-sm text-ink/55 lg:col-span-full">{helperText}</p> : null}
    </form>
  );
}
