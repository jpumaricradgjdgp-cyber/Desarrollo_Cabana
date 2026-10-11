-- Catálogo de muestra. Los títulos no incluyen videos: subir material autorizado a Storage.
insert into cabana.contents(id,title,description,type,release_year,duration_minutes,seasons,genre,image_url,featured,age_rating) values
('20000000-0000-0000-0000-000000000001','Stranger Things','Un grupo de amigos descubre un mundo paralelo y secretos que cambiarán sus vidas para siempre.','SERIES',2016,50,4,'Ciencia ficción','/assets/stranger.jpg',true,'16+'),
('20000000-0000-0000-0000-000000000002','Dark','La desaparición de un niño revela los misterios de cuatro familias y una historia que atraviesa el tiempo.','SERIES',2017,55,3,'Misterio','/assets/dark.jpg',true,'16+'),
('20000000-0000-0000-0000-000000000003','WandaVision','Wanda y Visión intentan llevar una vida perfecta, pero nada en su nuevo hogar es lo que parece.','SERIES',2021,35,1,'Ciencia ficción','/assets/wandavision.png',true,'13+'),
('20000000-0000-0000-0000-000000000004','Interstellar','Un viaje más allá de nuestra galaxia en busca de un futuro para la humanidad.','MOVIE',2014,169,0,'Ciencia ficción','/assets/poster-placeholder.svg',false,'13+'),
('20000000-0000-0000-0000-000000000005','La La Land','Una actriz y un músico persiguen sus sueños entre las luces de Los Ángeles.','MOVIE',2016,128,0,'Romance','/assets/poster-placeholder.svg',false,'13+'),
('20000000-0000-0000-0000-000000000006','El origen','Un equipo se adentra en los sueños para realizar una misión imposible.','MOVIE',2010,148,0,'Acción','/assets/poster-placeholder.svg',false,'13+'),
('20000000-0000-0000-0000-000000000007','El viaje de Chihiro','Una niña atraviesa un mundo fantástico para rescatar a sus padres.','MOVIE',2001,125,0,'Fantasía','/assets/poster-placeholder.svg',false,'ATP'),
('20000000-0000-0000-0000-000000000008','El refugio','Una expedición descubre un lugar que no figura en ningún mapa. Título ficticio de muestra.','MOVIE',2026,105,0,'Aventura','/assets/poster-placeholder.svg',false,'13+'),
('20000000-0000-0000-0000-000000000009','Una noche más','Una reunión inesperada cambia los planes de cinco amigos. Título ficticio de muestra.','MOVIE',2026,95,0,'Comedia','/assets/poster-placeholder.svg',false,'13+'),
('20000000-0000-0000-0000-000000000010','Breaking Bad','Un profesor de química toma una decisión que transforma su vida.','SERIES',2008,47,5,'Drama','/assets/poster-placeholder.svg',false,'18+'),
('20000000-0000-0000-0000-000000000011','The Last of Us','Dos sobrevivientes cruzan un país transformado por una pandemia.','SERIES',2023,55,1,'Drama','/assets/poster-placeholder.svg',false,'18+'),
('20000000-0000-0000-0000-000000000012','Game of Thrones','Varias familias disputan el poder en los Siete Reinos.','SERIES',2011,57,8,'Fantasía','/assets/poster-placeholder.svg',false,'18+')
on conflict (id) do nothing;
