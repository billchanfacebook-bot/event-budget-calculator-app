import { NextResponse } from "next/server";
import { buildBudgetItemsCsv, createCsvResponse, slugifyFilename } from "@/lib/export";
import { mapEventWithItems } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

type EventExportRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: EventExportRouteProps) {
  const { id } = await params;
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
      "id, name, event_date, location, attendee_count, status, currency, budget_cap, notes, budget_items(id, item_name, vendor, estimated_cost, actual_cost, payment_status, due_date, notes, budget_categories(name))"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response("Event not found", { status: 404 });
  }

  const event = mapEventWithItems(data);
  const csv = buildBudgetItemsCsv(event);

  return createCsvResponse(`${slugifyFilename(event.name) || "event"}-budget-items.csv`, csv);
}
