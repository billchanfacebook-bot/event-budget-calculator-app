"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { BudgetBreakdownActions } from "@/components/budget-breakdown-actions";
import type { BudgetCategoryRecord, FormState } from "@/types";
import type { BudgetItemRecord } from "@/types";

type SortKey = "item" | "category" | "vendor" | "estimated" | "actual" | "status" | "due";
type SortDirection = "asc" | "desc";

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function getSortValue(item: BudgetItemRecord, sortKey: SortKey) {
  switch (sortKey) {
    case "item":
      return item.itemName;
    case "category":
      return item.categoryName;
    case "vendor":
      return item.vendor;
    case "estimated":
      return item.estimatedCost;
    case "actual":
      return item.actualCost;
    case "status":
      return item.paymentStatus;
    case "due":
      return item.dueDate;
    default:
      return item.itemName;
  }
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className = ""
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (sortKey: SortKey) => void;
  className?: string;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th className={`px-4 py-3 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 text-left hover:text-accent"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-ink/35"}`} />
        {isActive ? <span className="text-xs text-ink/45">{direction}</span> : null}
      </button>
    </th>
  );
}

export function BudgetItemTable({
  items,
  eventId,
  helperText,
  categories,
  quickAddAction,
  importAction,
  batchDeleteAction
}: {
  items: BudgetItemRecord[];
  eventId: string;
  helperText?: string;
  categories: BudgetCategoryRecord[];
  quickAddAction: (state: FormState, formData: FormData) => Promise<FormState>;
  importAction: (state: FormState, formData: FormData) => Promise<FormState>;
  batchDeleteAction: (formData: FormData) => Promise<void>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      const comparison =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : compareText(String(aValue ?? ""), String(bValue ?? ""));

      return sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [items, sortDirection, sortKey]);

  const allVisibleSelected = sortedItems.length > 0 && sortedItems.every((item) => selectedIds.includes(item.id));

  function handleSort(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  function toggleItem(itemId: string) {
    setSelectedIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]
    );
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const visibleIds = sortedItems.map((item) => item.id);

      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  function handleBatchDelete(formData: FormData) {
    startTransition(async () => {
      await batchDeleteAction(formData);
      setSelectedIds([]);
    });
  }

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

      {items.length > 0 ? (
        <form action={handleBatchDelete} className="mb-4 flex flex-wrap items-center gap-3">
          {selectedIds.map((itemId) => (
            <input key={itemId} type="hidden" name="itemIds" value={itemId} />
          ))}
          <p className="text-sm text-ink/60">{selectedIds.length} selected</p>
          <button
            type="submit"
            disabled={selectedIds.length === 0 || isPending}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete selected"}
          </button>
        </form>
      ) : null}

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
                  <th className="px-4 py-3 font-medium">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label="Select all visible items"
                    />
                  </th>
                  <SortHeader label="Item" sortKey="item" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Category" sortKey="category" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Vendor" sortKey="vendor" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Estimated" sortKey="estimated" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Actual" sortKey="actual" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Status" sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortHeader label="Due" sortKey="due" activeKey={sortKey} direction={sortDirection} onSort={handleSort} />
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        aria-label={`Select ${item.itemName}`}
                      />
                    </td>
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
            {sortedItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                      aria-label={`Select ${item.itemName}`}
                      className="mt-1"
                    />
                    <div>
                    <h3 className="font-semibold">{item.itemName}</h3>
                    <p className="mt-1 text-sm text-ink/60">{item.categoryName}</p>
                    </div>
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
