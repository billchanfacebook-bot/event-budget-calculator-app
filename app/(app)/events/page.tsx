import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { mapEventWithItems } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
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

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Events</p>
        <h1 className="mt-3 text-3xl font-semibold">All events</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/65">
          Browse all events tied to your admin account and open any one for budget tracking.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Your event list is empty. Create a new event and this page will start filling with live data from Supabase."
          actionHref="/events/new"
          actionLabel="Create Event"
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
