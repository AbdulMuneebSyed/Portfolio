# Feedback & Reports Supabase Integration

## Required Tables

```sql
-- Reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  rating int not null check (rating between 1 and 5),
  type text not null default 'review',
  created_at timestamptz default now()
);

-- Bug Reports / Suggestions table
create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  type text not null default 'bug', -- 'bug' | 'suggestion'
  created_at timestamptz default now()
);

-- (Optional) Enable Row Level Security and policies
alter table public.reviews enable row level security;
alter table public.bug_reports enable row level security;

-- Allow anonymous inserts (adjust as needed)
create policy "Allow insert reviews" on public.reviews
  for insert with check (true);

create policy "Allow select reviews" on public.reviews
  for select using (true);

create policy "Allow insert bug reports" on public.bug_reports
  for insert with check (true);

create policy "Allow select bug reports" on public.bug_reports
  for select using (true);
```

If `gen_random_uuid()` is unavailable, enable the pgcrypto extension:

```sql
create extension if not exists pgcrypto;
```

## Environment Variables (.env.local)

Instead of hardcoding, move these into your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://upyblkiaivmpsadkexdj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweWJsa2lhaXZtcHNhZGtleGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTUyMzMsImV4cCI6MjA3NDk5MTIzM30.Lke4YMUHIzycHemzDFqydVINlBmOGgJKxkNkWybYr8w
```

Then update `supabase-client.ts` to read from `process.env.*`.

## Notes

- Email is optional; it's stored only if provided.
- Consider adding rate limiting or captcha if abuse happens.
- You can add a `status` column to `bug_reports` later (e.g., open, triaged, fixed).
- For suggestions vs bugs, allow the user to toggle and store `type='suggestion'`.

## Future Enhancements

- Real-time subscription to new reviews.
- Admin moderation flag.
- Upvote helpful reviews.
- Export feedback as CSV.
