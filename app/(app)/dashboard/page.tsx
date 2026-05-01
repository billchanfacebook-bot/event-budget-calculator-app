import { DashboardCharts } from "@/components/dashboard-charts";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { ExportLink } from "@/components/export-link";
import { SummaryCard } from "@/components/summary-card";
import {
  buildEventSpendComparisonData,
  buildStatusSpendData,
  mapEventWithItems
} from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

function currency(value: number) {
  return `$${value.toLocaleString()}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, name, event_date, location, attendee_count, status, currency, notes, budget_items(id, item_name, vendor, estimated_cost, actual_cost, payment_status, due_date, notes, budget_categories(name))"
    )
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const events = (data ?? []).map(mapEventWithItems);
  const plannedBudget = events.reduce((sum, event) => sum + event.estimatedTotal, 0);
  const actualSpend = events.reduce((sum, event) => sum + event.actualTotal, 0);
  const outstanding = events.reduce((sum, event) => sum + event.pendingTotal, 0);
  const overBudget = events
    .filter((event) => event.variance > 0)
    .reduce((sum, event) => sum + event.variance, 0);

  const dashboardSummary = [
    { label: "Planned budget", value: currency(plannedBudget), helper: "Across all current events" },
    { label: "Actual spend", value: currency(actualSpend), helper: "Updated from live event data" },
    { label: "Outstanding", value: currency(outstanding), helper: "Pending and partially paid items" },
    { label: "Over budget", value: currency(overBudget), helper: "Total overspend across current events" }
  ];
  const statusData = buildStatusSpendData(events);
  const eventSpendData = buildEventSpendComparisonData(events);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-moss">Overview</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Budget dashboard</h1>
          <p className="max-w-2xl text-sm leading-7 text-ink/65">
            Monitor total planned budget, actual spending, outstanding payments, and current
            event health in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportLink href="/events/export" label="Export Summary CSV" />
          <Link
            href="/events/new"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Create New Event
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardSummary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      {events.length > 0 ? (
        <DashboardCharts statusData={statusData} eventSpendData={eventSpendData} />
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active events</h2>
          <Link href="/events" className="text-sm font-medium text-accent">
            View all
          </Link>
        </div>
        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            description="Create your first event to start tracking budget targets, actual spending, and payment progress."
            actionHref="/events/new"
            actionLabel="Create First Event"
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
