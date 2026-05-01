import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-card p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm leading-7 text-ink/65">
          Enter your admin email and we will send you a recovery link through Supabase Auth.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
