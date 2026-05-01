# Event Budget Admin

A responsive `Next.js + Supabase` starter for managing multiple event budgets across desktop and mobile.

## Stack

- `Next.js 15` with App Router
- `TypeScript`
- `Tailwind CSS`
- `Supabase Auth + PostgreSQL`
- `Netlify` deployment target

## Included

- Landing page and admin login page
- Shared app shell with sidebar and topbar
- Protected dashboard, event list, event detail, event settings pages
- Live event create, edit, and delete flow
- Shared budget category management page with create, edit, and delete flow
- Live budget item create, edit, and delete flow
- Payment ledger per budget item with automatic actual-cost and payment-status sync
- CSV export for event summaries and single-event budget line items
- Recharts-based dashboard and event analytics
- Event detail filters for category and payment status
- Supabase sign-in, sign-out, forgot-password, callback, and update-password flows
- Middleware-based route protection
- Supabase client helpers
- `supabase/schema.sql` with tables, triggers, seed categories, and RLS policies

## Project Structure

```text
app/
  (app)/
  (auth)/
components/
  forms/
lib/
  supabase/
supabase/
types/
```

## Local Setup

1. Install packages:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Fill in your Supabase keys in `.env.local`.

4. Run development server:

```bash
npm run dev
```

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run [`supabase/schema.sql`](/Users/billchan/Desktop/Codex_ALL/Event Budget Calculator/supabase/schema.sql).
   If you already ran an older version, re-run it so the latest `budget_categories` write policies are applied.
4. In Authentication, enable Email login.
5. Create at least one admin user in Supabase Auth.
6. Add your local and Netlify site URLs to the auth redirect settings.

## Netlify Notes

This project now includes [`netlify.toml`](/Users/billchan/Desktop/Codex_ALL/Event Budget Calculator/netlify.toml) with:

- `npm run build` as the build command
- `NODE_VERSION = 20`
- `@netlify/plugin-nextjs` so App Router, middleware, and server actions are deployed correctly

### Netlify Environment Variables

Add these in Netlify Site configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Netlify Deploy Steps

1. Push this project to GitHub.
2. In Netlify, create a new site from that repository.
3. Confirm the build command is `npm run build`.
4. Confirm Node version is `20`.
5. Add the Supabase environment variables above.
6. Deploy the site.

### Supabase Redirect URLs

In Supabase Auth settings, add:

- Local URL:
  - `http://localhost:3000`
- Netlify production URL:
  - `https://your-site-name.netlify.app`
- If you use a custom domain later, add that too.

### Important Note

Because this app uses middleware and server actions, do not deploy it as a plain static site. Keep the Next.js Netlify runtime enabled through the plugin.

## Recommended Next Steps

1. Add confirmation UI and success toasts for create, update, and delete actions.
2. Add event-level notes editing directly from the detail screen.
3. Add Excel export once a spreadsheet library is available in the environment.
4. Add sortable columns to the event budget table.
5. Run install/build locally once a package manager is available in the environment.
