import { deleteEventAction } from "@/app/actions/events";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const deleteAction = deleteEventAction.bind(null, eventId);

  return (
    <form action={deleteAction}>
      <button
        type="submit"
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Delete Event
      </button>
    </form>
  );
}
