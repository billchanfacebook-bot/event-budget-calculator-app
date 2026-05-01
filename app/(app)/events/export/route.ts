import { NextResponse } from "next/server";
import { buildEventsSummaryCsv, createCsvResponse } from "@/lib/export";
import { mapEventWithItems } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, name, event_date, location, attendee_count, status, currency, notes, budget_items(id, item_name, vendor, estimated_cost, actual_cost, payment_status, due_date, notes, budget_categories(name))"
    )
    .order("event_date", { ascending: true });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const events = (data ?? []).map(mapEventWithItems);
  const csv = buildEventsSummaryCsv(events);

  return createCsvResponse("event-budget-summary.csv", csv);
}
