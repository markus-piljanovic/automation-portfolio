-- Database schema for the Automation Compliance Guide (Supabase / PostgreSQL).
-- Run once in the SQL editor of your Supabase project, before the ingest workflow.

create extension if not exists vector;

-- Law cards: one row per article (or part of an article), filled by the ingest workflow.
-- metadata holds: gesetz, typ, nummer, titel, fundstelle, quelle, stand, fassung, thema
create table public.documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);
create index documents_gesetz_nummer_idx on public.documents ((metadata->>'gesetz'), (metadata->>'nummer'));
alter table public.documents enable row level security;

-- Cost log: one row per request, written by the usage logger workflow.
-- The main workflow adds up today's rows (without is_test) for the daily limit.
create table public.usage_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  workflow text,
  execution_id text,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  cost_eur numeric(12,6),
  price_stand text,
  question_chars integer,
  is_test boolean not null default false
);
create index usage_log_created_at_idx on public.usage_log (created_at);
alter table public.usage_log enable row level security;
