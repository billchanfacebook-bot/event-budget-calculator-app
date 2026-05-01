import type { Route } from "next";
import Link from "next/link";

type EventFiltersProps = {
  eventId: string;
  categories: string[];
  selectedCategory: string;
  selectedStatus: string;
  selectedSort: string;
};

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" }
];

const sortOptions = [
  { value: "category_asc", label: "Category (A-Z)" },
  { value: "category_desc", label: "Category (Z-A)" },
  { value: "estimated_desc", label: "Estimated (High-Low)" },
  { value: "estimated_asc", label: "Estimated (Low-High)" },
  { value: "actual_desc", label: "Actual (High-Low)" },
  { value: "actual_asc", label: "Actual (Low-High)" },
  { value: "item_asc", label: "Item name (A-Z)" },
  { value: "item_desc", label: "Item name (Z-A)" },
  { value: "due_asc", label: "Due date (Earliest)" },
  { value: "due_desc", label: "Due date (Latest)" },
  { value: "status_asc", label: "Status (A-Z)" },
  { value: "status_desc", label: "Status (Z-A)" }
];

export function EventFilters({
  eventId,
  categories,
  selectedCategory,
  selectedStatus,
  selectedSort
}: EventFiltersProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-moss">Filters</p>
          <h2 className="mt-2 text-2xl font-semibold">Focus the breakdown</h2>
          <p className="mt-2 text-sm leading-7 text-ink/65">
            Narrow the charts and line items by category, payment status, or sorting preference.
          </p>
        </div>
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:min-w-[620px]">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select id="category" name="category" defaultValue={selectedCategory}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Payment status
            </label>
            <select id="status" name="status" defaultValue={selectedStatus}>
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="sort" className="text-sm font-medium">
              Sort by
            </label>
            <select id="sort" name="sort" defaultValue={selectedSort}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Apply Filters
            </button>
            <Link
              href={`/events/${eventId}` as Route}
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
