-- Temporadas/capítulos, tráileres e historial. Ejecutar en Supabase > SQL Editor
-- después de 08_catalogo_portadas.sql y ANTES de iniciar la nueva versión del backend
-- (el perfil supabase valida el esquema y no arranca si faltan estas columnas).
begin;
set local lock_timeout = '10s';

-- Tráiler de YouTube por título (opcional).
alter table cabana.contents add column if not exists trailer_url varchar(300);

-- Fecha de la última reproducción: ordena el historial.
alter table cabana.watch_progress add column if not exists updated_at timestamptz not null default now();
create index if not exists watch_progress_user_recent_idx on cabana.watch_progress(user_id, updated_at desc);

-- Capítulos de las series.
create table if not exists cabana.episodes (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references cabana.contents(id) on delete cascade,
  season integer not null check (season between 1 and 100),
  number integer not null check (number between 1 and 500),
  title varchar(150) not null,
  description varchar(1000),
  duration_minutes integer not null check (duration_minutes between 1 and 600),
  unique(content_id, season, number)
);
alter table cabana.episodes enable row level security;
revoke all on cabana.episodes from public, anon, authenticated;

-- Capítulos de ejemplo (no se duplican si ya existen).
insert into cabana.episodes(content_id, season, number, title, description, duration_minutes)
select c.id, v.season, v.number, v.title, v.description, v.minutes
from (values
  ('Stranger Things',1,1,'Capítulo uno: La desaparición de Will Byers','Will desaparece de camino a casa y una niña misteriosa aparece en el bosque.',48),
  ('Stranger Things',1,2,'Capítulo dos: La loca de la calle Maple','Los chicos esconden a Once mientras la búsqueda de Will se complica.',55),
  ('Stranger Things',1,3,'Capítulo tres: Holly, Jolly','Joyce intenta comunicarse con Will usando luces de Navidad.',51),
  ('Dark',1,1,'Secretos','En 2019 desaparece un niño en Winden y viejos secretos salen a la luz.',51),
  ('Dark',1,2,'Mentiras','Mikkel despierta en un lugar que no reconoce mientras su familia lo busca.',44),
  ('Dark',1,3,'Pasado y presente','Ulrich sigue una pista que conecta la desaparición con 1986.',45)
) as v(series, season, number, title, description, minutes)
join cabana.contents c on c.title = v.series and c.type = 'SERIES'
on conflict (content_id, season, number) do nothing;
commit;
