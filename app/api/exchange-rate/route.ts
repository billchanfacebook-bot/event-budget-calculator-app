import { NextResponse } from "next/server";

const ALLOWED_CURRENCIES = new Set(["HKD", "TWD", "CNY", "JPY", "EUR", "GBP", "USD"]);

function normalizeCurrency(value: string | null) {
  const normalized = (value ?? "").trim().toUpperCase();
  return normalized === "RMB" ? "CNY" : normalized;
}

function getDirectOrCrossRate(
  rates: Record<string, number>,
  fromCurrency: string,
  toCurrency: string
) {
  if (fromCurrency === toCurrency) return 1;

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (typeof fromRate !== "number" || typeof toRate !== "number" || fromRate <= 0 || toRate <= 0) {
    return null;
  }

  return toRate / fromRate;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromCurrency = normalizeCurrency(searchParams.get("from"));
  const toCurrency = normalizeCurrency(searchParams.get("to"));

  if (!ALLOWED_CURRENCIES.has(fromCurrency) || !ALLOWED_CURRENCIES.has(toCurrency)) {
    return NextResponse.json({ error: "Unsupported currency." }, { status: 400 });
  }

  if (fromCurrency === toCurrency) {
    return NextResponse.json({
      from: fromCurrency,
      to: toCurrency,
      rate: 1,
      fetchedAt: new Date().toISOString(),
      source: "same-currency"
    });
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Exchange provider returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    const rate = payload.rates ? getDirectOrCrossRate(payload.rates, fromCurrency, toCurrency) : null;

    if (!rate) {
      throw new Error("Exchange rate is unavailable.");
    }

    return NextResponse.json({
      from: fromCurrency,
      to: toCurrency,
      rate,
      fetchedAt: payload.time_last_update_utc ?? new Date().toISOString(),
      source: "open.er-api.com"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch exchange rate."
      },
      { status: 502 }
    );
  }
}
