-- «Seguir viendo»: guarda la duración de lo reproducido (tráiler o video) para mostrar el % real.
-- Ejecutar en Supabase > SQL Editor después de 10_trailers.sql y ANTES de iniciar esta versión
-- del backend (el perfil supabase valida el esquema al arrancar).
begin;
alter table cabana.watch_progress add column if not exists total_seconds integer
  check (total_seconds is null or total_seconds between 1 and 86400);
commit;
