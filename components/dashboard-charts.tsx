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

const chartColors = ["#d0672f", "#71816d", "#18212f", "#c48b5a", "#9db0a0", "#ddba93"];

type DashboardChartsProps = {
  statusData: Array<{
    name: string;
    value: number;
  }>;
  eventSpendData: Array<{
    name: string;
    planned: number;
    actual: number;
  }>;
};

function currency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function DashboardCharts({ statusData, eventSpendData }: DashboardChartsProps) {
  const hasStatusData = statusData.some((entry) => entry.value > 0);
  const hasEventSpendData = eventSpendData.some((entry) => entry.planned > 0 || entry.actual > 0);

  return (
    <section className="rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-moss">Analytics</p>
        <h2 className="mt-3 text-2xl font-semibold">Portfolio snapshot</h2>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Budget by event status</span>
            <span className="text-xs text-ink/50">Actual spend share</span>
          </div>
          {hasStatusData ? (
            <>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => currency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-ink/65">
                {statusData.map((entry, index) => (
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
            <div className="flex h-72 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-white text-sm text-ink/45">
              Spend data will appear once events start recording actual costs.
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-shell p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium">Planned vs actual by event</span>
            <span className="text-xs text-ink/50">Top-level comparison</span>
          </div>
          {hasEventSpendData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventSpendData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ddd2" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip formatter={(value: number) => currency(value)} />
                  <Bar dataKey="planned" fill="#d0672f" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="actual" fill="#71816d" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-white text-sm text-ink/45">
              Event comparison will appear after budget values are added.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
