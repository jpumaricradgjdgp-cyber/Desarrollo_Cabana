-- Reseñas y calificaciones (versión Angular). Ejecutar en Supabase > SQL Editor
-- después de 06_normalizacion_generos.sql y antes de iniciar el backend con el perfil supabase.
begin;
set local lock_timeout = '10s';
create table if not exists cabana.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references cabana.accounts(id) on delete cascade,
  content_id uuid not null references cabana.contents(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment varchar(500),
  created_at timestamptz not null default now(),
  unique(user_id,content_id)
);
create index if not exists reviews_content_idx on cabana.reviews(content_id, created_at desc);
-- Igual que el resto del esquema: sin acceso desde la Data API, solo el backend Java por JDBC.
alter table cabana.reviews enable row level security;
revoke all on cabana.reviews from public, anon, authenticated;
commit;
