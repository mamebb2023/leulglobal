-- 001_init.sql
-- Run this once in the Supabase SQL editor (or apply with the Supabase CLI).
-- RLS is enabled with no policies: only the server-side secret key can read or
-- write these tables. The publishable/anon key has no access.

create table quotes_latest (
  instrument_id text primary key,
  category      text not null,
  price         numeric not null check (price > 0),
  change_abs    numeric,
  change_pct    numeric,
  source        text not null,
  as_of         timestamptz not null,
  fetched_at    timestamptz not null default now()
);

create table quote_history (
  id            bigserial primary key,
  instrument_id text not null,
  price         numeric not null check (price > 0),
  as_of         timestamptz not null,
  fetched_at    timestamptz not null default now()
);
create index quote_history_idx on quote_history (instrument_id, as_of desc);
create unique index quote_history_dedupe on quote_history (instrument_id, as_of);

create table refresh_log (
  id          bigserial primary key,
  provider    text not null,
  ok          boolean not null,
  quotes      int not null default 0,
  duration_ms int,
  error       text,
  ran_at      timestamptz not null default now()
);
create index refresh_log_idx on refresh_log (provider, ran_at desc);

alter table quotes_latest enable row level security;
alter table quote_history enable row level security;
alter table refresh_log   enable row level security;
-- No policies: only the secret key (server) can read/write.
