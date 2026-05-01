import type { Route } from "next";
import Link from "next/link";
import type { EventRecord } from "@/types";

export function EventCard({ event }: { event: EventRecord }) {
  return (
    <article className="rounded-[1.75rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-moss">{event.status}</p>
          <h3 className="mt-2 text-xl font-semibold">{event.name}</h3>
        </div>
        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
          {event.currency}
        </span>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-ink/65">
        <p>{event.date}</p>
        <p>{event.location}</p>
        <p>{event.attendeeCount} attendees</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-shell p-4 text-sm">
        <div>
          <p className="text-ink/55">Budget cap</p>
          <p className="mt-1 font-semibold">${event.budgetCap.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-ink/55">Actual</p>
          <p className="mt-1 font-semibold">${event.actualTotal.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link
          href={`/events/${event.id}` as Route}
          className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Open Event
        </Link>
        <Link
          href={`/events/${event.id}/settings` as Route}
          className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
        >
          Settings
        </Link>
      </div>
    </article>
  );
}
