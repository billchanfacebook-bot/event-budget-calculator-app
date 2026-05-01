import { NextResponse } from "next/server";
import { buildBudgetImportTemplateWorkbook, createXlsxResponse } from "@/lib/excel-export";
import { createClient } from "@/lib/supabase/server";

type EventTemplateRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: EventTemplateRouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const [{ data: event, error: eventError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase.from("events").select("id, name").eq("id", id).single(),
      supabase.from("budget_categories").select("name").order("sort_order", { ascending: true })
    ]);

  if (eventError || !event) {
    return new Response("Event not found", { status: 404 });
  }

  if (categoriesError) {
    return new Response(categoriesError.message, { status: 500 });
  }

  const workbook = await buildBudgetImportTemplateWorkbook((categories ?? []).map((category) => category.name));

  return createXlsxResponse("budget-item-import-template.xlsx", workbook);
}
