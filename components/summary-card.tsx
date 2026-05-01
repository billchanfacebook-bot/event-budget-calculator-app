type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
};

export function SummaryCard({ label, value, helper, valueClassName = "" }: SummaryCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-white/60 bg-card p-5 shadow-soft">
      <p className="text-sm text-ink/55">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm text-ink/60">{helper}</p>
    </article>
  );
}
