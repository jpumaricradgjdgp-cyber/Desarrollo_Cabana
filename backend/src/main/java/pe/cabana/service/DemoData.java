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
  private final AccountRepository accounts;private final ContentRepository contents;
  public DemoData(AccountRepository a,ContentRepository c){accounts=a;contents=c;}
  public void run(String...args){
    var a=new Account();a.id=UUID.fromString("10000000-0000-0000-0000-000000000001");a.email="admin@cabana.demo";a.name="Administrador";a.role="ADMIN";a.passwordHash=new BCryptPasswordEncoder().encode("Cabana2026!");accounts.save(a);
    add("Stranger Things","Un grupo de amigos descubre un mundo paralelo y secretos que cambiarán sus vidas para siempre.","SERIES",2016,50,4,"Ciencia ficción","stranger.jpg",true,"16+");
    add("Dark","La desaparición de un niño revela los misterios de cuatro familias y una historia que atraviesa el tiempo.","SERIES",2017,55,3,"Misterio","dark.jpg",true,"16+");
    add("WandaVision","Wanda y Visión intentan llevar una vida perfecta, pero nada en su nuevo hogar es lo que parece.","SERIES",2021,35,1,"Ciencia ficción","wandavision.png",true,"13+");
    add("Interstellar","Un viaje más allá de nuestra galaxia en busca de un futuro para la humanidad.","MOVIE",2014,169,0,"Ciencia ficción","",false,"13+");
    add("La La Land","Una actriz y un músico persiguen sus sueños entre las luces de Los Ángeles.","MOVIE",2016,128,0,"Romance","",false,"13+");
    add("El origen","Un equipo se adentra en los sueños para realizar una misión imposible.","MOVIE",2010,148,0,"Acción","",false,"13+");
    add("El viaje de Chihiro","Una niña atraviesa un mundo fantástico para rescatar a sus padres.","MOVIE",2001,125,0,"Fantasía","",false,"ATP");
    add("El refugio","Una expedición descubre un lugar que no figura en ningún mapa. Título ficticio de muestra.","MOVIE",2026,105,0,"Aventura","",false,"13+");
    add("Una noche más","Una reunión inesperada cambia los planes de cinco amigos. Título ficticio de muestra.","MOVIE",2026,95,0,"Comedia","",false,"13+");
    add("Breaking Bad","Un profesor de química toma una decisión que transforma su vida.","SERIES",2008,47,5,"Drama","",false,"18+");
    add("The Last of Us","Dos sobrevivientes cruzan un país transformado por una pandemia.","SERIES",2023,55,1,"Drama","",false,"18+");
    add("Game of Thrones","Varias familias disputan el poder en los Siete Reinos.","SERIES",2011,57,8,"Fantasía","",false,"18+");
    add("Viernes 13, parte 2","Una nueva generación vuelve a Crystal Lake. La leyenda de Jason convierte una escapada al bosque en una noche de terror.","MOVIE",1981,86,0,"Terror","jason-movie.png",false,"18+");
  }
  private void add(String title,String desc,String type,int year,int minutes,int seasons,String genre,String image,boolean featured,String rating){
    var c=new Content();c.title=title;c.description=desc;c.type=type;c.releaseYear=year;c.durationMinutes=minutes;c.seasons=seasons;c.genre=genre;c.imageUrl=image.isEmpty()?"/assets/poster-placeholder.svg":"/assets/"+image;c.featured=featured;c.ageRating=rating;contents.save(c);
  }
}
