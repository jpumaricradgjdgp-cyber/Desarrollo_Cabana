-- Ejecutar después de 01_schema.sql. Añade la recomendación sin modificar otros títulos.
-- El personaje es una ilustración aportada por el usuario, no una portada oficial.
insert into cabana.contents(id,title,description,type,release_year,duration_minutes,seasons,genre,image_url,featured,age_rating)
values ('20000000-0000-0000-0000-000000000013','Viernes 13, parte 2','Una nueva generación vuelve a Crystal Lake. La leyenda de Jason convierte una escapada al bosque en una noche de terror.','MOVIE',1981,86,0,'Terror','/assets/jason-movie.png',false,'18+')
on conflict (id) do nothing;
