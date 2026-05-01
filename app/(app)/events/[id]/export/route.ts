import { NextResponse } from "next/server";
import { buildEventBudgetWorkbook, createXlsxResponse } from "@/lib/excel-export";
import { slugifyFilename } from "@/lib/export";
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
  const workbook = await buildEventBudgetWorkbook(event);

  return createXlsxResponse(`${slugifyFilename(event.name) || "event"}-budget-workbook.xlsx`, workbook);
}
