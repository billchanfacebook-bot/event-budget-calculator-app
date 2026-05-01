import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
      >
        Log out
      </button>
    </form>
  );
}
