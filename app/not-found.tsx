import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-[2rem] border border-white/60 bg-card p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Not found</p>
        <h1 className="mt-3 text-3xl font-semibold">This event page does not exist.</h1>
        <p className="mt-3 text-sm leading-7 text-ink/65">
          Once real Supabase data is connected, this view will also catch missing or deleted
          events.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
