-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table responses enable row level security;

-- Allow anyone (anonymous respondents) to submit a response
create policy "Allow public insert"
  on responses for insert
  to anon
  with check (true);

-- Allow anyone to read responses (needed for the results dashboard)
create policy "Allow public read"
  on responses for select
  to anon
  using (true);
