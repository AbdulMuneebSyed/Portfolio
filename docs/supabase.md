# Supabase setup for the Contact and Feedback forms

The site writes visitor messages to two tables. The client lives in
`lib/supabase-client.ts` and uses the project's public **anon** key, so the
tables must be protected with row-level security (RLS): visitors may insert
rows but never read them.

| Table | Written by | Columns used |
|---|---|---|
| `review` | Feedback → Reviews | `name`, `email`, `rating`, `review_text` |
| `bugs_and_suggestions` | Feedback → Bugs & suggestions, and Contact | `name`, `email`, `report_text` |

Contact form messages are stored in `bugs_and_suggestions` with
`report_text` starting `[CONTACT FORM] Subject: …`.

## SQL

```sql
create extension if not exists pgcrypto;

create table if not exists public.review (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  rating int check (rating between 1 and 5),
  review_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bugs_and_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  report_text text not null,
  created_at timestamptz not null default now()
);

alter table public.review enable row level security;
alter table public.bugs_and_suggestions enable row level security;

-- Visitors can submit, but not read, messages.
create policy "Anyone can submit a review"
  on public.review for insert to anon with check (true);

create policy "Anyone can submit a report"
  on public.bugs_and_suggestions for insert to anon with check (true);
```

Read submissions from the Supabase dashboard (Table Editor), which uses
your own credentials rather than the anon key.

## Moving the keys to environment variables (optional)

The URL and anon key are currently in `lib/supabase-client.ts`. The anon
key is designed to be public, so this is safe as long as RLS is enabled as
above. To configure them per environment instead, add to `.env.local` (and
to the Vercel project settings):

```
NEXT_PUBLIC_SUPABASE_URL=<your project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
```

and read `process.env.NEXT_PUBLIC_SUPABASE_URL` /
`process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` in `lib/supabase-client.ts`.
