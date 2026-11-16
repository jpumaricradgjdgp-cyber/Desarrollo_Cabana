-- Aplicar con la versión normalizada del backend. Migración transaccional.
-- Los UUID, usuarios, contenidos, favoritos, progresos y nombres se conservan.
begin;
set local lock_timeout = '10s';
select pg_advisory_xact_lock(628103406);
create table if not exists cabana.genres (
 id uuid primary key default gen_random_uuid(),
 name varchar(30) not null unique check (length(trim(name)) > 0)
);
alter table cabana.genres enable row level security;
revoke all on cabana.genres from public, anon, authenticated;
do $migration$
begin
 if exists (select 1 from information_schema.columns where table_schema='cabana' and table_name='contents' and column_name='genre') then
  lock table cabana.contents in access exclusive mode;
  if exists(select 1 from cabana.contents where genre is null or length(trim(genre))=0) then
   raise exception 'Hay géneros vacíos. La migración no modificó datos.';
  end if;
  insert into cabana.genres(name) select distinct genre from cabana.contents on conflict(name) do nothing;
  alter table cabana.contents add column if not exists genre_id uuid;
  update cabana.contents c set genre_id=g.id from cabana.genres g where g.name=c.genre;
  if exists(select 1 from cabana.contents c left join cabana.genres g on g.id=c.genre_id where g.id is null or g.name<>c.genre) then
   raise exception 'No se pudo conservar el género de todos los contenidos.';
  end if;
  alter table cabana.contents alter column genre_id set not null;
  alter table cabana.contents add constraint contents_genre_fk foreign key(genre_id) references cabana.genres(id) on delete restrict;
  drop index if exists cabana.content_type_genre_idx;
  alter table cabana.contents drop column genre;
 end if;
end $migration$;
insert into cabana.genres(name) values ('Acción'),('Aventura'),('Ciencia ficción'),('Comedia'),('Drama'),('Fantasía'),('Misterio'),('Romance'),('Terror') on conflict(name) do nothing;
create index if not exists content_type_genre_idx on cabana.contents(type,genre_id);
create index if not exists content_genre_idx on cabana.contents(genre_id);
commit;
