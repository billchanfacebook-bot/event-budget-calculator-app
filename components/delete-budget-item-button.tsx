import { deleteBudgetItemAction } from "@/app/actions/budget-items";

export function DeleteBudgetItemButton({
  eventId,
  itemId
}: {
  eventId: string;
  itemId: string;
}) {
  const action = deleteBudgetItemAction.bind(null, eventId, itemId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Delete Item
      </button>
    </form>
  );
}
