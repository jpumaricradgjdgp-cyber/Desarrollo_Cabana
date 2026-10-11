-- Ejecutar una vez en Supabase > SQL Editor antes de iniciar el perfil supabase.
-- El esquema privado cabana se consulta desde Java por JDBC; no exponerlo en Data API.
begin;
create schema if not exists cabana;
revoke all on schema cabana from public, anon, authenticated;
create table if not exists cabana.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(254) not null unique,
  name varchar(80) not null,
  role varchar(10) not null default 'USER' check (role in ('USER','ADMIN')),
  password_hash varchar(100)
);
create table if not exists cabana.contents (
  id uuid primary key default gen_random_uuid(),
  title varchar(150) not null,
  description varchar(2000) not null,
  type varchar(10) not null check (type in ('MOVIE','SERIES')),
  release_year integer not null check (release_year between 1888 and 2100),
  duration_minutes integer not null check (duration_minutes between 1 and 1500),
  seasons integer not null default 0 check (seasons between 0 and 100),
  genre varchar(30) not null,
  image_url varchar(1000) not null,
  video_path varchar(1000),
  featured boolean not null default false,
  age_rating varchar(10) not null check (age_rating in ('ATP','7+','13+','16+','18+'))
);
create table if not exists cabana.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references cabana.contents(id) on delete cascade,
  unique(user_id,content_id)
);
create table if not exists cabana.watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references cabana.contents(id) on delete cascade,
  seconds bigint not null default 0 check (seconds between 0 and 86400),
  unique(user_id,content_id)
);
create index if not exists content_type_genre_idx on cabana.contents(type,genre);
create index if not exists content_title_idx on cabana.contents(lower(title));
-- Defensa adicional: sin políticas para clientes públicos. El servidor JDBC usa postgres.
alter table cabana.accounts enable row level security;
alter table cabana.contents enable row level security;
alter table cabana.saved_items enable row level security;
alter table cabana.watch_progress enable row level security;
revoke all on all tables in schema cabana from public, anon, authenticated;
alter default privileges in schema cabana revoke all on tables from public, anon, authenticated;
-- Bucket privado. Solo Java genera URLs temporales; no se añaden políticas públicas.
insert into storage.buckets(id,name,public) values ('videos','videos',false) on conflict (id) do nothing;
commit;
