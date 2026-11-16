-- Recupera el esquema anterior sin perder géneros, títulos o UUID.
-- Detener la versión nueva antes de volver a la versión anterior del backend.
begin;
set local lock_timeout='10s';
lock table cabana.contents in access exclusive mode;
alter table cabana.contents add column if not exists genre varchar(30);
update cabana.contents c set genre=g.name from cabana.genres g where g.id=c.genre_id;
alter table cabana.contents alter column genre set not null;
drop index if exists cabana.content_type_genre_idx;
alter table cabana.contents drop column genre_id;
create index content_type_genre_idx on cabana.contents(type,genre);
-- Se conserva genres para no eliminar información.
commit;
