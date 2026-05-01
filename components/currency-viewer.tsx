"use client";

import { useState, useTransition } from "react";

type CurrencyViewerMetric = {
  label: string;
  amount: number;
};

type CurrencyViewerProps = {
  baseCurrency: string;
  metrics: CurrencyViewerMetric[];
};

const CURRENCY_OPTIONS = [
  { label: "HKD", value: "HKD" },
  { label: "TWD", value: "TWD" },
  { label: "RMB", value: "CNY" },
  { label: "JPY", value: "JPY" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" }
];

function displayCurrency(currency: string) {
  return currency === "CNY" ? "RMB" : currency;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2
  }).format(value);
}

export function CurrencyViewer({ baseCurrency, metrics }: CurrencyViewerProps) {
  const normalizedBaseCurrency = baseCurrency === "RMB" ? "CNY" : baseCurrency;
  const defaultTarget =
    CURRENCY_OPTIONS.find((option) => option.value !== normalizedBaseCurrency)?.value ?? "HKD";
  const [isOpen, setIsOpen] = useState(false);
  const [targetCurrency, setTargetCurrency] = useState(defaultTarget);
  const [rate, setRate] = useState<number | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadRate = (currency: string) => {
    setTargetCurrency(currency);
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/exchange-rate?from=${encodeURIComponent(normalizedBaseCurrency)}&to=${encodeURIComponent(currency)}`,
          { cache: "no-store" }
        );
        const payload = (await response.json()) as {
          rate?: number;
          fetchedAt?: string;
          error?: string;
        };

        if (!response.ok || typeof payload.rate !== "number") {
          throw new Error(payload.error ?? "Unable to load exchange rate.");
        }

        setRate(payload.rate);
        setFetchedAt(payload.fetchedAt ?? "");
      } catch (fetchError) {
        setRate(null);
        setFetchedAt("");
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load exchange rate.");
      }
    });
  };

  const togglePanel = () => {
    setIsOpen((current) => {
      const next = !current;
      if (next && rate === null) {
        loadRate(targetCurrency);
      }
      return next;
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePanel}
        className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
      >
        View in Different Currency
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-3 w-[min(22rem,calc(100vw-3rem))] rounded-[1.5rem] border border-border bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-moss">Live view only</p>
              <h2 className="mt-1 text-lg font-semibold">Currency preview</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-border px-3 py-1 text-xs text-ink/60 hover:text-ink"
            >
              Close
            </button>
          </div>

          <label htmlFor="currency-preview" className="mt-4 block text-xs font-semibold text-ink/60">
            Convert {displayCurrency(normalizedBaseCurrency)} to
          </label>
          <select
            id="currency-preview"
            className="mt-2"
            value={targetCurrency}
            onChange={(event) => loadRate(event.target.value)}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="mt-4 rounded-2xl bg-shell p-3 text-sm">
            {isPending ? (
              <p className="text-ink/60">Loading live rate...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : rate ? (
              <div className="space-y-1">
                <p className="font-semibold">
                  1 {displayCurrency(normalizedBaseCurrency)} = {rate.toFixed(4)}{" "}
                  {displayCurrency(targetCurrency)}
                </p>
                <p className="text-xs text-ink/50">Rate timestamp: {fetchedAt || "just now"}</p>
              </div>
            ) : (
              <p className="text-ink/60">Choose a currency to preview converted values.</p>
            )}
          </div>

          {rate ? (
            <div className="mt-4 space-y-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 px-3 py-2 text-sm"
                >
                  <span className="text-ink/60">{metric.label}</span>
                  <span className="font-semibold">{formatMoney(metric.amount * rate, targetCurrency)}</span>
                </div>
              ))}
            </div>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-ink/50">
            Preview only. Original event currency and saved amounts remain unchanged.
          </p>
        </div>
      ) : null}
    </div>
  );
}
