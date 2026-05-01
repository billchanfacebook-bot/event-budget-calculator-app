import { UpdatePasswordForm } from "@/components/forms/update-password-form";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-card p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold">Choose a new password</h1>
        <p className="mt-3 text-sm leading-7 text-ink/65">
          {user
            ? "Your recovery session is active. Set a new password below."
            : "Open the recovery link from your email first. Once the recovery session is active, you can set a new password here."}
        </p>
        <div className="mt-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
