import type { Route } from "next";
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <section className="rounded-[2rem] border border-dashed border-border bg-card p-8 text-center shadow-soft">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/65">{description}</p>
      <Link
        href={actionHref as Route}
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
