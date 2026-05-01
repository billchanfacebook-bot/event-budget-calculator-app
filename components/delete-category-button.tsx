import { deleteBudgetCategoryAction } from "@/app/actions/budget-categories";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const action = deleteBudgetCategoryAction.bind(null, categoryId);

  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
