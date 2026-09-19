-- V4 secure traveler context. Review in preview before production.
do $$ begin
  alter table public.cities add column cover_image_url text;
exception when duplicate_column then null; end $$;

create table if not exists public.traveler_sessions (
  id uuid primary key default gen_random_uuid(),
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  language text check (language is null or language in ('fr','en')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
alter table public.traveler_sessions enable row level security;
create index if not exists traveler_sessions_expiry_idx on public.traveler_sessions(expires_at);
create index if not exists traveler_sessions_property_idx on public.traveler_sessions(property_id, created_at desc);

-- No anon/authenticated policy by design: only the service-role edge function reads/writes sessions.
