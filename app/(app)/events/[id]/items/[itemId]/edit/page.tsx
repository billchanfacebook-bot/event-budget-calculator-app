import { notFound } from "next/navigation";
import { updateBudgetItemAction } from "@/app/actions/budget-items";
import { createPaymentAction } from "@/app/actions/payments";
import { DeleteBudgetItemButton } from "@/components/delete-budget-item-button";
import { DeletePaymentButton } from "@/components/delete-payment-button";
import { EmptyState } from "@/components/empty-state";
import { BudgetItemForm } from "@/components/forms/budget-item-form";
import { PaymentForm } from "@/components/forms/payment-form";
import { getBudgetCategories } from "@/lib/budget-categories";
import { mapPayment } from "@/lib/events";
import { createClient } from "@/lib/supabase/server";

type EditBudgetItemPageProps = {
  params: Promise<{ id: string; itemId: string }>;
};

export default async function EditBudgetItemPage({ params }: EditBudgetItemPageProps) {
  const { id, itemId } = await params;
  const supabase = await createClient();
  const [{ data: item, error }, categories, { data: paymentsData, error: paymentsError }] = await Promise.all([
    supabase
      .from("budget_items")
      .select("id, event_id, category_id, item_name, vendor, estimated_cost, actual_cost, payment_status, due_date, notes")
      .eq("id", itemId)
      .eq("event_id", id)
      .single(),
    getBudgetCategories(),
    supabase
      .from("payments")
      .select("id, amount, payment_date, payment_method, note, created_at")
      .eq("budget_item_id", itemId)
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })
  ]);

  if (error || !item) {
    notFound();
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <EmptyState
          title="No categories available"
          description="Run the Supabase schema seed so your budget categories are created before editing line items."
          actionHref={`/events/${id}`}
          actionLabel="Back to Event"
        />
      </div>
    );
  }

  const action = updateBudgetItemAction.bind(null, id, itemId);
  const createPayment = createPaymentAction.bind(null, id, itemId);
  const payments = (paymentsData ?? []).map(mapPayment);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Budget item</p>
        <h1 className="mt-3 text-3xl font-semibold">Edit item</h1>
        <p className="mt-2 text-sm leading-7 text-ink/65">
          Update this budget line and save changes back to Supabase. If you add payments below, the item actual cost
          and payment status will sync automatically.
        </p>
        <div className="mt-5">
          <DeleteBudgetItemButton eventId={id} itemId={itemId} />
        </div>
      </div>
      <BudgetItemForm
        action={action}
        categories={categories}
        defaults={{
          itemName: item.item_name,
          categoryId: item.category_id ?? categories[0]?.id ?? "",
          vendor: item.vendor ?? "",
          estimatedCost: Number(item.estimated_cost ?? 0),
          actualCost: Number(item.actual_cost ?? 0),
          paymentStatus: item.payment_status,
          dueDate: item.due_date ?? "",
          notes: item.notes ?? ""
        }}
        submitLabel="Save Item"
      />

      <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.3em] text-moss">Payments</p>
          <h2 className="mt-2 text-2xl font-semibold">Track installments and settlements</h2>
        </div>
        <PaymentForm action={createPayment} />

        <div className="mt-6 space-y-4">
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-8 text-center text-sm text-ink/60">
              No payments recorded yet. Add the first payment to start tracking deposits or partial settlements.
            </div>
          ) : (
            payments.map((payment) => (
              <article key={payment.id} className="rounded-[1.5rem] border border-border bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">${payment.amount.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-ink/65">
                      <span>{payment.paymentDate}</span>
                      <span>{payment.paymentMethod}</span>
                    </div>
                    {payment.note ? <p className="text-sm leading-7 text-ink/70">{payment.note}</p> : null}
                  </div>
                  <DeletePaymentButton eventId={id} itemId={itemId} paymentId={payment.id} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
