"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const chartColors = ["#d0672f", "#71816d", "#18212f", "#c48b5a", "#9db0a0", "#ddba93", "#b3541e"];

type EventChartsProps = {
  categorySpendData: Array<{
    name: string;
    value: number;
  }>;
  categoryComparisonData: Array<{
    name: string;
    estimated: number;
    actual: number;
  }>;
};

function currency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function EventCharts({ categorySpendData, categoryComparisonData }: EventChartsProps) {
  const hasSpendData = categorySpendData.some((entry) => entry.value > 0);
  const hasComparisonData = categoryComparisonData.some(
    (entry) => entry.estimated > 0 || entry.actual > 0
  );
  const categoryTotals = [...categoryComparisonData].sort(
    (left, right) => right.estimated + right.actual - (left.estimated + left.actual)
  );

  return (
    <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.3em] text-moss">Analytics</p>
      <h2 className="mt-3 text-2xl font-semibold">Budget vs actual</h2>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Category spend share</span>
            <span className="text-xs text-ink/50">Actual spend</span>
          </div>
          {hasSpendData ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpendData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {categorySpendData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => currency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-ink/65">
                {categorySpendData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">{currency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-white text-sm text-ink/45">
              Category spend will appear after this event has recorded actual costs.
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Estimated vs actual by category</span>
            <span className="text-xs text-ink/50">Variance spotlight</span>
          </div>
          {hasComparisonData ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryComparisonData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ddd2" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(value: number) => currency(value)} />
                  <Bar dataKey="estimated" fill="#d0672f" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="actual" fill="#71816d" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-white text-sm text-ink/45">
              Estimated versus actual comparison appears after line items are added.
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Category totals</span>
            <span className="text-xs text-ink/50">Estimated and actual sums</span>
          </div>
          {hasComparisonData ? (
            <div className="grid gap-2 text-sm text-ink/65">
              {categoryTotals.map((entry) => (
                <div key={entry.name} className="rounded-xl bg-white px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink">{entry.name}</span>
                    <span className="text-xs text-ink/45">
                      Diff {currency(entry.actual - entry.estimated)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-ink/45">Estimated</p>
                      <p className="mt-1 font-semibold text-accent">{currency(entry.estimated)}</p>
                    </div>
                    <div>
                      <p className="text-ink/45">Actual</p>
                      <p className="mt-1 font-semibold text-moss">{currency(entry.actual)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-white text-sm text-ink/45">
              Category totals will appear once estimated or actual values are available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
