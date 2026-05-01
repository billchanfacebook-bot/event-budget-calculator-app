import { notFound } from "next/navigation";
import { BudgetItemTable } from "@/components/budget-item-table";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventCharts } from "@/components/event-charts";
import { EventFilters } from "@/components/event-filters";
import { ExportLink } from "@/components/export-link";
import { EventNotesForm } from "@/components/forms/event-notes-form";
import { SummaryCard } from "@/components/summary-card";
import { updateEventNotesAction } from "@/app/actions/events";
import { createBudgetItemAction, importBudgetItemsAction } from "@/app/actions/budget-items";
import { getBudgetCategories } from "@/lib/budget-categories";
import {
  buildCategoryComparisonData,
  buildCategorySpendData,
  mapEventWithItems,
  sortBudgetItems
} from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; status?: string; sort?: string }>;
};

export default async function EventDetailPage({ params, searchParams }: EventDetailPageProps) {
  const { id } = await params;
  const { category = "", status = "", sort = "category_asc" } = await searchParams;
  const supabase = await createClient();
  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, name, event_date, location, attendee_count, status, currency, budget_cap, notes, budget_items(id, item_name, vendor, estimated_cost, actual_cost, payment_status, due_date, notes, budget_categories(name))"
      )
      .eq("id", id)
      .single(),
    getBudgetCategories()
  ]);

  if (error || !data) {
    notFound();
  }

  const event = mapEventWithItems(data);
  const eventSummaries = [
    { label: "Budget cap", value: `$${event.budgetCap.toLocaleString()}`, helper: "Manual event spending limit" },
    { label: "Estimated items", value: `$${event.estimatedTotal.toLocaleString()}`, helper: "Sum of all estimated line items" },
    { label: "Actual", value: `$${event.actualTotal.toLocaleString()}`, helper: "Recorded spend to date" },
    { label: "Remaining", value: `$${event.remainingBudget.toLocaleString()}`, helper: "Available before reaching budget cap" },
    { label: "Paid", value: `$${event.paidTotal.toLocaleString()}`, helper: "Fully settled items" },
    { label: "Pending", value: `$${event.pendingTotal.toLocaleString()}`, helper: "Pending or partially paid" },
    { label: "Variance", value: `$${event.variance.toLocaleString()}`, helper: "Positive means actual spend is over the cap" }
  ];
  const filterCategories = Array.from(new Set(event.items.map((item) => item.categoryName))).sort((a, b) =>
    a.localeCompare(b)
  );
  const filteredItems = event.items.filter((item) => {
    const matchesCategory = category ? item.categoryName === category : true;
    const matchesStatus = status ? item.paymentStatus === status : true;
    return matchesCategory && matchesStatus;
  });
  const sortedItems = sortBudgetItems(filteredItems, sort);
  const categorySpendData = buildCategorySpendData(sortedItems);
  const categoryComparisonData = buildCategoryComparisonData(sortedItems);
  const activeFilters = [
    category ? `Category: ${category}` : "",
    status ? `Status: ${status.replaceAll("_", " ")}` : "",
    sort ? `Sort: ${sort.replaceAll("_", " ")}` : ""
  ].filter(Boolean);
  const helperText =
    activeFilters.length > 0
      ? `${sortedItems.length} filtered item(s). ${activeFilters.join(" | ")}`
      : `${event.items.length} total item(s) across this event.`;
  const updateNotes = updateEventNotesAction.bind(null, event.id);
  const quickAddAction = createBudgetItemAction.bind(null, event.id);
  const importAction = importBudgetItemsAction.bind(null, event.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-moss">{event.status}</p>
            <h1 className="text-3xl font-semibold">{event.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-ink/65">
              <span>{event.date}</span>
              <span>{event.location}</span>
              <span>{event.attendeeCount} attendees</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-shell px-4 py-3 text-sm">
              Currency: <span className="font-semibold">{event.currency}</span>
            </div>
            <ExportLink href={`/events/${event.id}/export`} label="Export Excel" />
            <DeleteEventButton eventId={event.id} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {eventSummaries.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <EventFilters
        eventId={event.id}
        categories={filterCategories}
        selectedCategory={category}
        selectedStatus={status}
        selectedSort={sort}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <EventCharts
          categorySpendData={categorySpendData}
          categoryComparisonData={categoryComparisonData}
        />
        <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
          <EventNotesForm action={updateNotes} defaultValue={event.notes} />
        </div>
      </section>

      <BudgetItemTable
        items={sortedItems}
        eventId={event.id}
        helperText={helperText}
        categories={categories}
        quickAddAction={quickAddAction}
        importAction={importAction}
      />
    </div>
  );
}
