-- LocalLang AI — Supabase schema
-- Run this in the Supabase SQL editor before loading the dataset.

create table if not exists public.translations (
  id text primary key,
  language text not null,
  dialect text,
  category text,
  subcategory text,
  input text not null,
  output text not null,
  example_sentence text,
  sentence_translation text,
  source text,
  confidence text default 'verified',
  created_at timestamptz not null default now()
);

-- Grants (PostgREST needs these explicitly)
grant select on public.translations to anon;
grant select on public.translations to authenticated;
grant all on public.translations to service_role;

alter table public.translations enable row level security;

-- The corpus is public reference data: read-only for everyone, writes via service role only.
drop policy if exists "Public can read translations" on public.translations;
create policy "Public can read translations"
  on public.translations for select
  to anon, authenticated
  using (true);

-- Search indexes
create index if not exists translations_language_idx on public.translations (language);
create index if not exists translations_category_idx on public.translations (category);
create index if not exists translations_input_idx on public.translations (lower(input));
create index if not exists translations_output_idx on public.translations (lower(output));
create extension if not exists pg_trgm;
create index if not exists translations_input_trgm on public.translations using gin (input gin_trgm_ops);
create index if not exists translations_output_trgm on public.translations using gin (output gin_trgm_ops);

-- Optional: conversation log for the doctor/patient screen
create table if not exists public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  speaker text not null check (speaker in ('patient', 'doctor')),
  source_language text not null,
  target_language text not null,
  original_text text not null,
  translated_text text,
  confidence text,
  found_in_dataset boolean default false,
  created_at timestamptz not null default now()
);

grant select, insert on public.conversation_turns to anon;
grant select, insert on public.conversation_turns to authenticated;
grant all on public.conversation_turns to service_role;

alter table public.conversation_turns enable row level security;

drop policy if exists "Anyone can log a turn" on public.conversation_turns;
create policy "Anyone can log a turn"
  on public.conversation_turns for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Read own session turns" on public.conversation_turns;
create policy "Read own session turns"
  on public.conversation_turns for select
  to anon, authenticated
  using (true);
