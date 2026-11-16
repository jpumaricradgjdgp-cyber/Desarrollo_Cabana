package pe.cabana.service;
import java.util.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import pe.cabana.model.*;
import pe.cabana.repository.*;
@Component @Profile("demo")
public class DemoData implements CommandLineRunner {
  private final GenreRepository genres;private final AccountRepository accounts;private final ContentRepository contents;private final ReviewRepository reviews;private final EpisodeRepository episodes;
  public DemoData(AccountRepository a,ContentRepository c,GenreRepository g,ReviewRepository r,EpisodeRepository e){accounts=a;contents=c;genres=g;reviews=r;episodes=e;}
  public void run(String...args){
    var a=new Account();a.id=UUID.fromString("10000000-0000-0000-0000-000000000001");a.email="admin@cabana.demo";a.name="Administrador";a.role="ADMIN";a.passwordHash=new BCryptPasswordEncoder().encode("Cabana2026!");accounts.save(a);
    var u=new Account();u.id=UUID.fromString("10000000-0000-0000-0000-000000000002");u.email="usuario@cabana.demo";u.name="Lucía";u.passwordHash=new BCryptPasswordEncoder().encode("Cabana2026!");accounts.save(u);
    add("Stranger Things","Un grupo de amigos descubre un mundo paralelo y secretos que cambiarán sus vidas para siempre.","SERIES",2016,50,4,"Ciencia ficción","stranger.jpg",true,"16+");
    add("Dark","La desaparición de un niño revela los misterios de cuatro familias y una historia que atraviesa el tiempo.","SERIES",2017,55,3,"Misterio","dark.jpg",true,"16+");
    add("WandaVision","Wanda y Visión intentan llevar una vida perfecta, pero nada en su nuevo hogar es lo que parece.","SERIES",2021,35,1,"Ciencia ficción","wandavision.png",true,"13+");
    add("Interstellar","Un viaje más allá de nuestra galaxia en busca de un futuro para la humanidad.","MOVIE",2014,169,0,"Ciencia ficción","",false,"13+");
    add("La La Land","Una actriz y un músico persiguen sus sueños entre las luces de Los Ángeles.","MOVIE",2016,128,0,"Romance","catalogo/la-la-land.jpg",false,"13+");
    add("El origen","Un equipo se adentra en los sueños para realizar una misión imposible.","MOVIE",2010,148,0,"Acción","",false,"13+");
    add("El viaje de Chihiro","Una niña atraviesa un mundo fantástico para rescatar a sus padres.","MOVIE",2001,125,0,"Fantasía","",false,"ATP");
    add("El refugio","Una expedición descubre un lugar que no figura en ningún mapa. Título ficticio de muestra.","MOVIE",2026,105,0,"Aventura","",false,"13+");
    add("Una noche más","Una reunión inesperada cambia los planes de cinco amigos. Título ficticio de muestra.","MOVIE",2026,95,0,"Comedia","",false,"13+");
    add("Breaking Bad","Un profesor de química toma una decisión que transforma su vida.","SERIES",2008,47,5,"Drama","",false,"18+");
    add("The Last of Us","Dos sobrevivientes cruzan un país transformado por una pandemia.","SERIES",2023,55,1,"Drama","",false,"18+");
    add("Game of Thrones","Varias familias disputan el poder en los Siete Reinos.","SERIES",2011,57,8,"Fantasía","",false,"18+");
    add("Viernes 13, parte 2","Una nueva generación vuelve a Crystal Lake. La leyenda de Jason convierte una escapada al bosque en una noche de terror.","MOVIE",1981,86,0,"Terror","jason-movie.png",false,"18+");
    catalogo();
    // Tráileres oficiales de YouTube (verificados con oEmbed: existen y permiten insertarse).
    trailer("Stranger Things","https://www.youtube.com/watch?v=Wre1F5YyIlA");
    trailer("Dark","https://www.youtube.com/watch?v=ESEUoa-mz2c");
    trailer("WandaVision","https://www.youtube.com/watch?v=R2oA59hYN_Y");
    trailer("Interstellar","https://www.youtube.com/watch?v=LYS2O1nl9iM");
    trailer("La La Land","https://www.youtube.com/watch?v=0pdqf4P9MB8");
    trailer("El origen","https://www.youtube.com/watch?v=RV9L7ui9Cn8");
    trailer("El viaje de Chihiro","https://www.youtube.com/watch?v=fDUFP7EeXLE");
    trailer("Breaking Bad","https://www.youtube.com/watch?v=mXd1zTwcQ18");
    trailer("The Last of Us","https://www.youtube.com/watch?v=yyGetSp7CIc");
    trailer("Game of Thrones","https://www.youtube.com/watch?v=KPLWWIOCOOQ");
    trailer("Viernes 13, parte 2","https://www.youtube.com/watch?v=3mNnJuOoI80");
    trailer("Avengers: Doomsday","https://www.youtube.com/watch?v=lAr_uspgHm8");
    trailer("Spider-Man: Brand New Day","https://www.youtube.com/watch?v=pqLSLoDkZWE");
    trailer("Michael","https://www.youtube.com/watch?v=o1HQSh6zZ8s");
    trailer("Obsesión","https://www.youtube.com/watch?v=gMC8kkwbIQQ");
    trailer("Scary Movie 6","https://www.youtube.com/watch?v=HMTKiPCKgpw");
    trailer("Pelé: el nacimiento de una leyenda","https://www.youtube.com/watch?v=nStu_Nz7kQ8");
    trailer("La máscara","https://www.youtube.com/watch?v=LZl69yk5lEY");
    trailer("Joker","https://www.youtube.com/watch?v=TobNCFMK_bs");
    trailer("Ted","https://www.youtube.com/watch?v=9fbo_pQvU7M");
    trailer("El conjuro 2","https://www.youtube.com/watch?v=cuDBjj_Gs0M");
    trailer("La noche del demonio","https://www.youtube.com/watch?v=62rpZcMYa0A");
    trailer("Ouija","https://www.youtube.com/watch?v=PcX-nom2UCM");
    trailer("Annabelle","https://www.youtube.com/watch?v=VDE7DxXJ3bg");
    trailer("El culto de Chucky","https://www.youtube.com/watch?v=ksTv0_dGiX4");
    trailer("El títere","https://www.youtube.com/watch?v=8b_HVtHmK30");
    trailer("Scream","https://www.youtube.com/watch?v=RZveBrcxXqA");
    trailer("It: Capítulo dos","https://www.youtube.com/watch?v=crDNzugmuGY");
    trailer("Grey's Anatomy","https://www.youtube.com/watch?v=ZfF1D73Vqnc");
    trailer("Dr. House","https://www.youtube.com/watch?v=MczMB8nU1sY");
    trailer("The Big Bang Theory","https://www.youtube.com/watch?v=eyWZk-UtCQo");
    trailer("Ted (serie)","https://www.youtube.com/watch?v=aq2Vt7OvQG0");
    trailer("Futurama","https://www.youtube.com/watch?v=PMYslwcXC4s");
    trailer("Rick y Morty","https://www.youtube.com/watch?v=ySYnTO7leqI");
    trailer("Los Simpson","https://www.youtube.com/watch?v=CLPoxiIR2ss");
    trailer("Chucky","https://www.youtube.com/watch?v=Za3L68Y6ZFY");
    episode("Stranger Things",1,1,"Capítulo uno: La desaparición de Will Byers","Will desaparece de camino a casa y una niña misteriosa aparece en el bosque.",48);
    episode("Stranger Things",1,2,"Capítulo dos: La loca de la calle Maple","Los chicos esconden a Once mientras la búsqueda de Will se complica.",55);
    episode("Stranger Things",1,3,"Capítulo tres: Holly, Jolly","Joyce intenta comunicarse con Will usando luces de Navidad.",51);
    episode("Dark",1,1,"Secretos","En 2019 desaparece un niño en Winden y viejos secretos salen a la luz.",51);
    episode("Dark",1,2,"Mentiras","Mikkel despierta en un lugar que no reconoce mientras su familia lo busca.",44);
    episode("Dark",1,3,"Pasado y presente","Ulrich sigue una pista que conecta la desaparición con 1986.",45);
    review(u,"Dark",5,"La mejor serie de viajes en el tiempo. Hay que verla con atención.");
    review(a,"Dark",4,"Compleja, pero muy bien cerrada.");
    review(u,"Stranger Things",4,"Nostalgia ochentera y mucho misterio.");
    review(u,"Interstellar",5,"La banda sonora es increíble.");
    review(a,"El viaje de Chihiro",5,null);
  }
  /** Títulos con portada en /assets/catalogo/. Si falta el archivo, la interfaz genera una portada tipográfica. */
  private void catalogo(){
    // Estrenos
    add("Avengers: Doomsday","Los Vengadores vuelven a unirse ante una amenaza capaz de poner fin a todos los mundos.","MOVIE",2026,150,0,"Acción","catalogo/avengers-doomsday.jpg",true,"13+");
    add("Spider-Man: Brand New Day","Peter Parker empieza de cero en una ciudad que ya no lo recuerda, mientras surge un nuevo enemigo.","MOVIE",2026,135,0,"Acción","catalogo/spiderman-brand-new-day.webp",true,"13+");
    add("Michael","La historia del Rey del Pop: de los inicios con sus hermanos a convertirse en un ícono mundial.","MOVIE",2026,127,0,"Biografía","catalogo/michael-jackson.jpg",false,"13+");
    add("Obsesión","Un joven enamorado pide un deseo que convierte su vida sentimental en una pesadilla.","MOVIE",2026,100,0,"Suspenso","catalogo/obsesion.webp",false,"16+");
    add("Scary Movie 6","La parodia regresa para burlarse de los éxitos de terror más recientes.","MOVIE",2026,95,0,"Comedia","catalogo/scary-movie-6.webp",false,"16+");
    add("Rápidos y furiosos 11","Persecuciones, autos y familia en una nueva aventura. Póster de fans; título de muestra.","MOVIE",2027,140,0,"Acción","catalogo/rapidos-y-furiosos.jpg",false,"13+");
    add("Pelé: el nacimiento de una leyenda","De las calles de Brasil a la gloria mundial: la juventud del futbolista más famoso.","MOVIE",2016,107,0,"Biografía","catalogo/pele-pelicula.jpg",false,"ATP");
    // Clásicos y comedia
    add("La máscara","Un tímido empleado encuentra una máscara que lo convierte en un torbellino de caricatura.","MOVIE",1994,101,0,"Comedia","catalogo/la-mascara.jpg",false,"13+");
    add("Joker","Un comediante fracasado de Ciudad Gótica cae poco a poco en la locura.","MOVIE",2019,122,0,"Drama","catalogo/joker.jpg",false,"16+");
    add("Ted","Un hombre y su osito de peluche, que cobró vida, deben aprender a crecer… o no.","MOVIE",2012,106,0,"Comedia","catalogo/ted.jpg",false,"16+");
    // Terror
    add("El conjuro 2","Los Warren viajan a Londres para ayudar a una familia atormentada por un espíritu.","MOVIE",2016,134,0,"Terror","catalogo/el-conjuro-2.jpg",false,"16+");
    add("La noche del demonio","Un niño cae en un coma inexplicable y su familia descubre que algo quiere ocupar su cuerpo.","MOVIE",2010,103,0,"Terror","catalogo/la-noche-del-demonio.jpg",false,"16+");
    add("Ouija","Un grupo de amigos usa un tablero para hablar con una amiga fallecida y despierta algo más.","MOVIE",2014,89,0,"Terror","catalogo/ouija.jpg",false,"13+");
    add("Annabelle","Una pareja recibe una muñeca de colección que se convierte en la puerta de un mal antiguo.","MOVIE",2014,99,0,"Terror","catalogo/annabelle.jpg",false,"16+");
    add("El culto de Chucky","Encerrada en un psiquiátrico, Nica descubre que Chucky ha vuelto, y no está solo.","MOVIE",2017,91,0,"Terror","catalogo/el-culto-de-chucky.jpg",false,"18+");
    add("El títere","Una viuda regresa a su pueblo para descubrir la verdad detrás de la leyenda de una ventrílocua.","MOVIE",2007,89,0,"Terror","catalogo/el-titere.jpg",false,"16+");
    add("Scream","Veinticinco años después, un nuevo asesino con la máscara de Ghostface aterroriza Woodsboro.","MOVIE",2022,114,0,"Terror","catalogo/scream.jpg",false,"18+");
    add("It: Capítulo dos","El Club de los Perdedores regresa a Derry para enfrentar a Pennywise una última vez.","MOVIE",2019,169,0,"Terror","catalogo/it-capitulo-dos.jpg",false,"16+");
    // Series
    add("Grey's Anatomy","Médicos residentes del Grey Sloan Memorial equilibran cirugías imposibles y vidas complicadas.","SERIES",2005,43,21,"Drama","catalogo/greys-anatomy.jpg",false,"16+");
    add("Dr. House","Un médico brillante y huraño resuelve los diagnósticos que nadie más puede descifrar.","SERIES",2004,44,8,"Drama","catalogo/dr-house.jpg",false,"13+");
    add("The Big Bang Theory","Cuatro científicos geniales y torpes descubren que la vida social es más difícil que la física.","SERIES",2007,22,12,"Comedia","catalogo/big-bang-theory.jpg",false,"13+");
    add("Ted (serie)","Antes de la película: John y su osito parlanchín sobreviven a la secundaria en 1993.","SERIES",2024,30,1,"Comedia","catalogo/ted-serie.jpg",false,"16+");
    add("Futurama","Fry despierta mil años en el futuro y empieza a trabajar en una empresa de mensajería espacial.","SERIES",1999,22,12,"Animación","catalogo/futurama.jpg",false,"13+");
    add("Rick y Morty","Un científico alcohólico arrastra a su nieto a peligrosas aventuras por el multiverso.","SERIES",2013,22,8,"Animación","catalogo/rick-and-morty.jpg",false,"16+");
    add("Los Simpson","La familia más famosa de Springfield y sus disparatadas aventuras de cada día.","SERIES",1989,22,36,"Animación","catalogo/los-simpson.jpg",false,"7+");
    add("Chucky","Un adolescente compra un muñeco antiguo en una venta de garaje y una ola de crímenes sacude su pueblo.","SERIES",2021,45,3,"Terror","catalogo/chucky-serie.jpg",false,"18+");
  }
  private void trailer(String title,String url){
    contents.findAll().stream().filter(c->c.title.equals(title)).forEach(c->{c.trailerUrl=url;contents.save(c);});
  }
  private void episode(String series,int season,int number,String title,String description,int minutes){
    var e=new Episode();e.content=contents.search(series,"SERIES","").get(0);e.season=season;e.number=number;e.title=title;e.description=description;e.durationMinutes=minutes;episodes.save(e);
  }
  private void review(Account account,String title,int rating,String comment){
    var r=new Review();r.account=account;r.content=contents.search(title,"","").get(0);r.rating=rating;r.comment=comment;r.createdAt=java.time.Instant.now();reviews.save(r);
  }
  private void add(String title,String desc,String type,int year,int minutes,int seasons,String genre,String image,boolean featured,String rating){
    var c=new Content();c.title=title;c.description=desc;c.type=type;c.releaseYear=year;c.durationMinutes=minutes;c.seasons=seasons;c.genre=genres.findByName(genre).orElseGet(()->{var g=new Genre();g.name=genre;return genres.save(g);});c.imageUrl=image.isEmpty()?"/assets/poster-placeholder.svg":"/assets/"+image;c.featured=featured;c.ageRating=rating;contents.save(c);
  }
}
