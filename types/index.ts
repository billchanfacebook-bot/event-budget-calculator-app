export type SummaryRecord = {
  label: string;
  value: string;
  helper: string;
};

export type FormState = {
  error: string;
};

export type EventFormState = FormState;

export type EventFormValues = {
  name: string;
  eventDate: string;
  location: string;
  attendeeCount: number;
  status: string;
  currency: string;
  notes: string;
};

export type EventRecord = {
  id: string;
  name: string;
  date: string;
  location: string;
  attendeeCount: number;
  status: string;
  currency: string;
  notes: string;
  estimatedTotal: number;
  actualTotal: number;
};

export type BudgetCategoryRecord = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type BudgetItemFormValues = {
  itemName: string;
  categoryId: string;
  vendor: string;
  estimatedCost: number;
  actualCost: number;
  paymentStatus: string;
  dueDate: string;
  notes: string;
};

export type BudgetItemRecord = {
  id: string;
  eventId: string;
  categoryName: string;
  itemName: string;
  vendor: string;
  estimatedCost: number;
  actualCost: number;
  paymentStatus: string;
  dueDate: string;
  notes?: string;
};

export type PaymentFormValues = {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  note: string;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  note: string;
  createdAt: string;
};

export type EventSummaryMetrics = {
  estimatedTotal: number;
  actualTotal: number;
  paidTotal: number;
  pendingTotal: number;
  remainingBudget: number;
  variance: number;
};

export type EventWithItemsRecord = EventRecord &
  EventSummaryMetrics & {
    items: BudgetItemRecord[];
  };
