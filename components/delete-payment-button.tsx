import { deletePaymentAction } from "@/app/actions/payments";

export function DeletePaymentButton({
  eventId,
  itemId,
  paymentId
}: {
  eventId: string;
  itemId: string;
  paymentId: string;
}) {
  const action = deletePaymentAction.bind(null, eventId, itemId, paymentId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Delete Payment
      </button>
    </form>
  );
}
