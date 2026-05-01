import { SignOutButton } from "@/components/forms/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-white/60 bg-card/70 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss">Workspace</p>
          <h1 className="text-lg font-semibold">Event Budget Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white px-4 py-2 text-sm text-ink/65 shadow-sm">
            {user?.email ?? "admin@example.com"}
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
