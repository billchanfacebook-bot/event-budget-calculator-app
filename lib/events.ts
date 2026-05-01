import type {
  BudgetCategoryRecord,
  BudgetItemRecord,
  EventRecord,
  EventSummaryMetrics,
  EventWithItemsRecord,
  PaymentRecord
} from "@/types";

type EventQueryRow = {
  id: string;
  name: string;
  event_date: string | null;
  location: string | null;
  attendee_count: number | null;
  status: string;
  currency: string;
  budget_cap: number | string | null;
  notes: string | null;
  budget_items?: Array<{
    id: string;
    item_name: string;
    vendor: string | null;
    estimated_cost: number | string;
    actual_cost: number | string;
    payment_status: string;
    due_date: string | null;
    notes: string | null;
    budget_categories: { name: string } | Array<{ name: string }> | null;
  }>;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function formatDate(value: string | null) {
  if (!value) return "TBC";
  return value;
}

export function calculateEventMetrics(items: BudgetItemRecord[], budgetCap: number): EventSummaryMetrics {
  const estimatedTotal = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const actualTotal = items.reduce((sum, item) => sum + item.actualCost, 0);
  const paidTotal = items
    .filter((item) => item.paymentStatus === "paid")
    .reduce((sum, item) => sum + item.actualCost, 0);
  const pendingTotal = items
    .filter((item) => item.paymentStatus !== "paid" && item.paymentStatus !== "cancelled")
    .reduce((sum, item) => sum + item.actualCost, 0);
  const remainingBudget = budgetCap - actualTotal;

  return {
    budgetCap,
    estimatedTotal,
    actualTotal,
    paidTotal,
    pendingTotal,
    remainingBudget,
    variance: actualTotal - budgetCap
  };
}

export function mapBudgetItem(item: NonNullable<EventQueryRow["budget_items"]>[number], eventId: string): BudgetItemRecord {
  const category =
    Array.isArray(item.budget_categories) ? item.budget_categories[0] : item.budget_categories;

  return {
    id: item.id,
    eventId,
    categoryName: category?.name ?? "Uncategorized",
    itemName: item.item_name,
    vendor: item.vendor ?? "-",
    estimatedCost: toNumber(item.estimated_cost),
    actualCost: toNumber(item.actual_cost),
    paymentStatus: item.payment_status,
    dueDate: item.due_date ?? "TBC",
    notes: item.notes ?? ""
  };
}

export function mapEvent(row: EventQueryRow): EventRecord {
  const items = (row.budget_items ?? []).map((item) => mapBudgetItem(item, row.id));
  const metrics = calculateEventMetrics(items, toNumber(row.budget_cap));

  return {
    id: row.id,
    name: row.name,
    date: formatDate(row.event_date),
    location: row.location ?? "TBC",
    attendeeCount: row.attendee_count ?? 0,
    status: row.status,
    currency: row.currency,
    budgetCap: metrics.budgetCap,
    notes: row.notes ?? "",
    estimatedTotal: metrics.estimatedTotal,
    actualTotal: metrics.actualTotal
  };
}

export function mapEventWithItems(row: EventQueryRow): EventWithItemsRecord {
  const items = (row.budget_items ?? []).map((item) => mapBudgetItem(item, row.id));
  const metrics = calculateEventMetrics(items, toNumber(row.budget_cap));

  return {
    ...mapEvent(row),
    items,
    ...metrics
  };
}

export function mapBudgetCategory(row: {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}): BudgetCategoryRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order
  };
}

export function mapPayment(row: {
  id: string;
  amount: number | string;
  payment_date: string | null;
  payment_method: string | null;
  note: string | null;
  created_at: string;
}): PaymentRecord {
  return {
    id: row.id,
    amount: toNumber(row.amount),
    paymentDate: row.payment_date ?? "TBC",
    paymentMethod: row.payment_method ?? "-",
    note: row.note ?? "",
    createdAt: row.created_at
  };
}

export function buildStatusSpendData(
  events: Array<Pick<EventWithItemsRecord, "status" | "actualTotal">>
) {
  const grouped = new Map<string, number>();

  events.forEach((event) => {
    grouped.set(event.status, (grouped.get(event.status) ?? 0) + event.actualTotal);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({
    name,
    value
  }));
}

export function buildEventSpendComparisonData(
  events: Array<Pick<EventWithItemsRecord, "name" | "budgetCap" | "actualTotal">>
) {
  return events.map((event) => ({
    name: event.name.length > 18 ? `${event.name.slice(0, 18)}...` : event.name,
    planned: event.budgetCap,
    actual: event.actualTotal
  }));
}

export function buildCategorySpendData(items: BudgetItemRecord[]) {
  const grouped = new Map<string, number>();

  items.forEach((item) => {
    grouped.set(item.categoryName, (grouped.get(item.categoryName) ?? 0) + item.actualCost);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({
    name,
    value
  }));
}

export function buildCategoryComparisonData(items: BudgetItemRecord[]) {
  const grouped = new Map<string, { estimated: number; actual: number }>();

  items.forEach((item) => {
    const current = grouped.get(item.categoryName) ?? { estimated: 0, actual: 0 };
    current.estimated += item.estimatedCost;
    current.actual += item.actualCost;
    grouped.set(item.categoryName, current);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({
    name,
    estimated: value.estimated,
    actual: value.actual
  }));
}

export function sortBudgetItems(items: BudgetItemRecord[], sortKey: string) {
  const sorted = [...items];

  const compareText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });
  const compareNumber = (a: number, b: number) => a - b;
  const compareDate = (a: string, b: string) => {
    if (a === "TBC" && b === "TBC") return 0;
    if (a === "TBC") return 1;
    if (b === "TBC") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  };

  sorted.sort((left, right) => {
    switch (sortKey) {
      case "item_asc":
        return compareText(left.itemName, right.itemName);
      case "item_desc":
        return compareText(right.itemName, left.itemName);
      case "category_asc":
        return compareText(left.categoryName, right.categoryName);
      case "category_desc":
        return compareText(right.categoryName, left.categoryName);
      case "estimated_asc":
        return compareNumber(left.estimatedCost, right.estimatedCost);
      case "estimated_desc":
        return compareNumber(right.estimatedCost, left.estimatedCost);
      case "actual_asc":
        return compareNumber(left.actualCost, right.actualCost);
      case "actual_desc":
        return compareNumber(right.actualCost, left.actualCost);
      case "due_asc":
        return compareDate(left.dueDate, right.dueDate);
      case "due_desc":
        return compareDate(right.dueDate, left.dueDate);
      case "status_asc":
        return compareText(left.paymentStatus, right.paymentStatus);
      case "status_desc":
        return compareText(right.paymentStatus, left.paymentStatus);
      default:
        return 0;
    }
  });

  return sorted;
}
