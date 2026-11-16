-- Catálogo con portadas (versión Angular). Ejecutar en Supabase > SQL Editor después de 07_resenas.sql.
-- Es idempotente: no duplica títulos existentes y solo completa portadas vacías o de ejemplo.
-- Las imágenes viven en frontend-angular/public/assets/catalogo/ y se sirven desde /assets/catalogo/.
begin;
insert into cabana.genres(name) values ('Acción'), ('Animación'), ('Biografía'), ('Comedia'), ('Drama'), ('Suspenso'), ('Terror') on conflict(name) do nothing;
insert into cabana.contents(title,description,type,release_year,duration_minutes,seasons,genre_id,image_url,featured,age_rating)
select v.title,v.description,v.type,v.release_year,v.duration_minutes,v.seasons,g.id,v.image_url,v.featured,v.age_rating
from (values
  ('Avengers: Doomsday','Los Vengadores vuelven a unirse ante una amenaza capaz de poner fin a todos los mundos.','MOVIE',2026,150,0,'Acción','/assets/catalogo/avengers-doomsday.jpg',true,'13+'),
  ('Spider-Man: Brand New Day','Peter Parker empieza de cero en una ciudad que ya no lo recuerda, mientras surge un nuevo enemigo.','MOVIE',2026,135,0,'Acción','/assets/catalogo/spiderman-brand-new-day.webp',true,'13+'),
  ('Michael','La historia del Rey del Pop: de los inicios con sus hermanos a convertirse en un ícono mundial.','MOVIE',2026,127,0,'Biografía','/assets/catalogo/michael-jackson.jpg',false,'13+'),
  ('Obsesión','Un joven enamorado pide un deseo que convierte su vida sentimental en una pesadilla.','MOVIE',2026,100,0,'Suspenso','/assets/catalogo/obsesion.webp',false,'16+'),
  ('Scary Movie 6','La parodia regresa para burlarse de los éxitos de terror más recientes.','MOVIE',2026,95,0,'Comedia','/assets/catalogo/scary-movie-6.webp',false,'16+'),
  ('Rápidos y furiosos 11','Persecuciones, autos y familia en una nueva aventura. Póster de fans; título de muestra.','MOVIE',2027,140,0,'Acción','/assets/catalogo/rapidos-y-furiosos.jpg',false,'13+'),
  ('Pelé: el nacimiento de una leyenda','De las calles de Brasil a la gloria mundial: la juventud del futbolista más famoso.','MOVIE',2016,107,0,'Biografía','/assets/catalogo/pele-pelicula.jpg',false,'ATP'),
  ('La máscara','Un tímido empleado encuentra una máscara que lo convierte en un torbellino de caricatura.','MOVIE',1994,101,0,'Comedia','/assets/catalogo/la-mascara.jpg',false,'13+'),
  ('Joker','Un comediante fracasado de Ciudad Gótica cae poco a poco en la locura.','MOVIE',2019,122,0,'Drama','/assets/catalogo/joker.jpg',false,'16+'),
  ('Ted','Un hombre y su osito de peluche, que cobró vida, deben aprender a crecer… o no.','MOVIE',2012,106,0,'Comedia','/assets/catalogo/ted.jpg',false,'16+'),
  ('El conjuro 2','Los Warren viajan a Londres para ayudar a una familia atormentada por un espíritu.','MOVIE',2016,134,0,'Terror','/assets/catalogo/el-conjuro-2.jpg',false,'16+'),
  ('La noche del demonio','Un niño cae en un coma inexplicable y su familia descubre que algo quiere ocupar su cuerpo.','MOVIE',2010,103,0,'Terror','/assets/catalogo/la-noche-del-demonio.jpg',false,'16+'),
  ('Ouija','Un grupo de amigos usa un tablero para hablar con una amiga fallecida y despierta algo más.','MOVIE',2014,89,0,'Terror','/assets/catalogo/ouija.jpg',false,'13+'),
  ('Annabelle','Una pareja recibe una muñeca de colección que se convierte en la puerta de un mal antiguo.','MOVIE',2014,99,0,'Terror','/assets/catalogo/annabelle.jpg',false,'16+'),
  ('El culto de Chucky','Encerrada en un psiquiátrico, Nica descubre que Chucky ha vuelto, y no está solo.','MOVIE',2017,91,0,'Terror','/assets/catalogo/el-culto-de-chucky.jpg',false,'18+'),
  ('El títere','Una viuda regresa a su pueblo para descubrir la verdad detrás de la leyenda de una ventrílocua.','MOVIE',2007,89,0,'Terror','/assets/catalogo/el-titere.jpg',false,'16+'),
  ('Scream','Veinticinco años después, un nuevo asesino con la máscara de Ghostface aterroriza Woodsboro.','MOVIE',2022,114,0,'Terror','/assets/catalogo/scream.jpg',false,'18+'),
  ('It: Capítulo dos','El Club de los Perdedores regresa a Derry para enfrentar a Pennywise una última vez.','MOVIE',2019,169,0,'Terror','/assets/catalogo/it-capitulo-dos.jpg',false,'16+'),
  ('Grey''s Anatomy','Médicos residentes del Grey Sloan Memorial equilibran cirugías imposibles y vidas complicadas.','SERIES',2005,43,21,'Drama','/assets/catalogo/greys-anatomy.jpg',false,'16+'),
  ('Dr. House','Un médico brillante y huraño resuelve los diagnósticos que nadie más puede descifrar.','SERIES',2004,44,8,'Drama','/assets/catalogo/dr-house.jpg',false,'13+'),
  ('The Big Bang Theory','Cuatro científicos geniales y torpes descubren que la vida social es más difícil que la física.','SERIES',2007,22,12,'Comedia','/assets/catalogo/big-bang-theory.jpg',false,'13+'),
  ('Ted (serie)','Antes de la película: John y su osito parlanchín sobreviven a la secundaria en 1993.','SERIES',2024,30,1,'Comedia','/assets/catalogo/ted-serie.jpg',false,'16+'),
  ('Futurama','Fry despierta mil años en el futuro y empieza a trabajar en una empresa de mensajería espacial.','SERIES',1999,22,12,'Animación','/assets/catalogo/futurama.jpg',false,'13+'),
  ('Rick y Morty','Un científico alcohólico arrastra a su nieto a peligrosas aventuras por el multiverso.','SERIES',2013,22,8,'Animación','/assets/catalogo/rick-and-morty.jpg',false,'16+'),
  ('Los Simpson','La familia más famosa de Springfield y sus disparatadas aventuras de cada día.','SERIES',1989,22,36,'Animación','/assets/catalogo/los-simpson.jpg',false,'7+'),
  ('Chucky','Un adolescente compra un muñeco antiguo en una venta de garaje y una ola de crímenes sacude su pueblo.','SERIES',2021,45,3,'Terror','/assets/catalogo/chucky-serie.jpg',false,'18+')
) as v(title,description,type,release_year,duration_minutes,seasons,genre,image_url,featured,age_rating)
join cabana.genres g on g.name=v.genre
where not exists (select 1 from cabana.contents c where lower(c.title)=lower(v.title));
update cabana.contents set image_url='/assets/catalogo/la-la-land.jpg'
where title='La La Land' and (image_url is null or image_url like '%poster-placeholder%');
commit;
