-- Tráileres oficiales de YouTube para el catálogo. Ejecutar en Supabase > SQL Editor
-- después de 09_episodios_trailers_historial.sql. Solo completa títulos que aún no tienen tráiler,
-- así que no reemplaza los que ya cargaste a mano desde el panel ADMIN.
begin;
update cabana.contents c
set trailer_url = v.url
from (values
  ('Stranger Things','https://www.youtube.com/watch?v=Wre1F5YyIlA'),
  ('Dark','https://www.youtube.com/watch?v=ESEUoa-mz2c'),
  ('WandaVision','https://www.youtube.com/watch?v=R2oA59hYN_Y'),
  ('Interstellar','https://www.youtube.com/watch?v=LYS2O1nl9iM'),
  ('La La Land','https://www.youtube.com/watch?v=0pdqf4P9MB8'),
  ('El origen','https://www.youtube.com/watch?v=RV9L7ui9Cn8'),
  ('El viaje de Chihiro','https://www.youtube.com/watch?v=fDUFP7EeXLE'),
  ('Breaking Bad','https://www.youtube.com/watch?v=mXd1zTwcQ18'),
  ('The Last of Us','https://www.youtube.com/watch?v=yyGetSp7CIc'),
  ('Game of Thrones','https://www.youtube.com/watch?v=KPLWWIOCOOQ'),
  ('Viernes 13, parte 2','https://www.youtube.com/watch?v=3mNnJuOoI80'),
  ('Avengers: Doomsday','https://www.youtube.com/watch?v=lAr_uspgHm8'),
  ('Spider-Man: Brand New Day','https://www.youtube.com/watch?v=pqLSLoDkZWE'),
  ('Michael','https://www.youtube.com/watch?v=o1HQSh6zZ8s'),
  ('Obsesión','https://www.youtube.com/watch?v=gMC8kkwbIQQ'),
  ('Scary Movie 6','https://www.youtube.com/watch?v=HMTKiPCKgpw'),
  ('Pelé: el nacimiento de una leyenda','https://www.youtube.com/watch?v=nStu_Nz7kQ8'),
  ('La máscara','https://www.youtube.com/watch?v=LZl69yk5lEY'),
  ('Joker','https://www.youtube.com/watch?v=TobNCFMK_bs'),
  ('Ted','https://www.youtube.com/watch?v=9fbo_pQvU7M'),
  ('El conjuro 2','https://www.youtube.com/watch?v=cuDBjj_Gs0M'),
  ('La noche del demonio','https://www.youtube.com/watch?v=62rpZcMYa0A'),
  ('Ouija','https://www.youtube.com/watch?v=PcX-nom2UCM'),
  ('Annabelle','https://www.youtube.com/watch?v=VDE7DxXJ3bg'),
  ('El culto de Chucky','https://www.youtube.com/watch?v=ksTv0_dGiX4'),
  ('El títere','https://www.youtube.com/watch?v=8b_HVtHmK30'),
  ('Scream','https://www.youtube.com/watch?v=RZveBrcxXqA'),
  ('It: Capítulo dos','https://www.youtube.com/watch?v=crDNzugmuGY'),
  ('Grey''s Anatomy','https://www.youtube.com/watch?v=ZfF1D73Vqnc'),
  ('Dr. House','https://www.youtube.com/watch?v=MczMB8nU1sY'),
  ('The Big Bang Theory','https://www.youtube.com/watch?v=eyWZk-UtCQo'),
  ('Ted (serie)','https://www.youtube.com/watch?v=aq2Vt7OvQG0'),
  ('Futurama','https://www.youtube.com/watch?v=PMYslwcXC4s'),
  ('Rick y Morty','https://www.youtube.com/watch?v=ySYnTO7leqI'),
  ('Los Simpson','https://www.youtube.com/watch?v=CLPoxiIR2ss'),
  ('Chucky','https://www.youtube.com/watch?v=Za3L68Y6ZFY')
) as v(title, url)
where c.title = v.title and (c.trailer_url is null or c.trailer_url = '');
commit;
