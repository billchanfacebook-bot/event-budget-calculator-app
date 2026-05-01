"use client";

import { useState } from "react";
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
  categoryProjectedSpendData: Array<{
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

export function EventCharts({
  categorySpendData,
  categoryProjectedSpendData,
  categoryComparisonData
}: EventChartsProps) {
  const [spendMode, setSpendMode] = useState<"actual" | "estimated">("actual");
  const activeSpendData = spendMode === "actual" ? categorySpendData : categoryProjectedSpendData;
  const hasSpendData = activeSpendData.some((entry) => entry.value > 0);
  const activeSpendLabel = spendMode === "actual" ? "Actual spend" : "Estimated spend";
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
      <div className="mt-6 grid gap-4 2xl:grid-cols-[0.9fr_1.35fr_1fr]">
        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium">Category spend share</span>
            <div className="inline-flex rounded-full border border-border bg-white p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSpendMode("actual")}
                className={`rounded-full px-3 py-1.5 ${
                  spendMode === "actual" ? "bg-accent text-white" : "text-ink/55 hover:text-accent"
                }`}
              >
                Actual
              </button>
              <button
                type="button"
                onClick={() => setSpendMode("estimated")}
                className={`rounded-full px-3 py-1.5 ${
                  spendMode === "estimated" ? "bg-accent text-white" : "text-ink/55 hover:text-accent"
                }`}
              >
                Estimated
              </button>
            </div>
          </div>
          {hasSpendData ? (
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] 2xl:grid-cols-1">
              <p className="text-xs text-ink/50 lg:col-span-2 2xl:col-span-1">{activeSpendLabel}</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeSpendData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {activeSpendData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => currency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid content-start gap-2 text-sm text-ink/65">
                {activeSpendData.map((entry, index) => (
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
            </div>
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
            <div className="h-72">
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
            <div className="grid gap-2 text-sm text-ink/65 sm:grid-cols-2 2xl:grid-cols-1">
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
