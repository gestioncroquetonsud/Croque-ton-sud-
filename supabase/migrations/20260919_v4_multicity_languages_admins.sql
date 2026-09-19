-- Croque ton Sud V4 foundation. Review in preview before production.
create table if not exists public.property_cities (
  property_id uuid not null references public.properties(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  active boolean not null default true,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  primary key(property_id, city_id)
);
alter table public.property_cities enable row level security;

do $$ begin
  alter table public.guide_documents add column language text not null default 'fr' check (language in ('fr','en'));
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.admin_profiles add column role text not null default 'secondary' check (role in ('owner','secondary'));
exception when duplicate_column then null; end $$;

update public.admin_profiles set role='owner' where user_id='4d7f2bee-7afe-4ee2-a091-a7e081d85df9';

insert into public.property_cities(property_id,city_id,active,sort_order,is_default)
select id,city_id,true,0,true from public.properties where city_id is not null
on conflict(property_id,city_id) do nothing;

drop index if exists one_published_guide_per_city;
create unique index if not exists one_published_guide_per_city_language
on public.guide_documents(city_id,language) where status='published';

create index if not exists property_cities_city_idx on public.property_cities(city_id) where active=true;
