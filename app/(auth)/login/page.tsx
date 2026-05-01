import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-card shadow-soft md:grid-cols-[1fr_420px]">
        <section className="hidden bg-ink px-10 py-12 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">Budget Command</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight">
              Keep every event budget visible, current, and under control.
            </h1>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <p>Responsive dashboard for desktop and mobile teams.</p>
            <p>Supabase auth and database ready for Netlify deployment.</p>
          </div>
        </section>

        <section className="p-8 md:p-10">
          <div className="mb-8 space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-moss">Admin access</p>
            <h2 className="text-3xl font-semibold">Sign in</h2>
            <p className="text-sm text-ink/60">Sign in or sign up with Google, or use email/password.</p>
          </div>
          {error ? (
            <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </p>
          ) : null}
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
