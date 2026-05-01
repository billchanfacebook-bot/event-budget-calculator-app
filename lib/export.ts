import type { BudgetItemRecord, EventWithItemsRecord } from "@/types";

function escapeCsvValue(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value);

  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
}

export function buildCsv(columns: string[], rows: Array<Array<string | number | null | undefined>>) {
  const header = columns.map(escapeCsvValue).join(",");
  const body = rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  return `${header}\n${body}`;
}

export function createCsvResponse(filename: string, csv: string) {
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}

export function slugifyFilename(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildEventsSummaryCsv(events: EventWithItemsRecord[]) {
  const columns = [
    "Event Name",
    "Event Date",
    "Location",
    "Status",
    "Currency",
    "Attendee Count",
    "Budget Cap",
    "Estimated Total",
    "Actual Total",
    "Remaining Budget",
    "Paid Total",
    "Pending Total",
    "Variance",
    "Notes"
  ];

  const rows = events.map((event) => [
    event.name,
    event.date,
    event.location,
    event.status,
    event.currency,
    event.attendeeCount,
    event.budgetCap,
    event.estimatedTotal,
    event.actualTotal,
    event.remainingBudget,
    event.paidTotal,
    event.pendingTotal,
    event.variance,
    event.notes
  ]);

  return buildCsv(columns, rows);
}

export function buildBudgetItemsCsv(event: EventWithItemsRecord) {
  const columns = [
    "Event Name",
    "Category",
    "Item Name",
    "Vendor",
    "Estimated Cost",
    "Actual Cost",
    "Payment Status",
    "Due Date",
    "Notes"
  ];

  const rows = event.items.map((item: BudgetItemRecord) => [
    event.name,
    item.categoryName,
    item.itemName,
    item.vendor,
    item.estimatedCost,
    item.actualCost,
    item.paymentStatus,
    item.dueDate,
    item.notes ?? ""
  ]);

  return buildCsv(columns, rows);
}
