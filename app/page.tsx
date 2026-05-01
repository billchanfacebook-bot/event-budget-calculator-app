import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between rounded-[2rem] border border-white/60 bg-card/90 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-accentSoft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Event Budget Admin
          </span>
          <Link
            href="/login"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium hover:border-accent hover:text-accent"
          >
            Admin Login
          </Link>
        </div>

        <section className="grid gap-12 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-moss">
              Multi-event budget planning
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
              Plan budgets, track spending, and manage every event from one responsive dashboard.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-ink/70 md:text-lg">
              This starter includes admin auth scaffolding, event and budget pages, shared UI
              components, and a Supabase schema designed for Netlify deployment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Open Demo Dashboard
              </Link>
              <Link
                href="/events/new"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Create Event
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-soft">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quick Overview</h2>
                <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                  HKD
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-shell p-4">
                  <p className="text-sm text-ink/60">Events</p>
                  <p className="mt-2 text-2xl font-semibold">3</p>
                </div>
                <div className="rounded-2xl bg-shell p-4">
                  <p className="text-sm text-ink/60">Budget Items</p>
                  <p className="mt-2 text-2xl font-semibold">29</p>
                </div>
                <div className="rounded-2xl bg-shell p-4">
                  <p className="text-sm text-ink/60">Total Planned</p>
                  <p className="mt-2 text-2xl font-semibold">$188,500</p>
                </div>
                <div className="rounded-2xl bg-shell p-4">
                  <p className="text-sm text-ink/60">Actual Spend</p>
                  <p className="mt-2 text-2xl font-semibold">$176,940</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
