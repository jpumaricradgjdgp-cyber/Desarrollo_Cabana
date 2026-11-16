package pe.cabana.service;
import pe.cabana.model.*;
import pe.cabana.repository.*;
import pe.cabana.api.Dtos.*;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service @Transactional(readOnly=true)
public class CatalogService {
  private final GenreRepository genres; private final ContentRepository contents; private final SavedRepository saved;
  private final ProgressRepository progress; private final ReviewRepository reviews; private final EpisodeRepository episodes;
  public CatalogService(ContentRepository c,SavedRepository s,ProgressRepository p,GenreRepository g,ReviewRepository r,EpisodeRepository e){
    contents=c;saved=s;progress=p;genres=g;reviews=r;episodes=e;
  }
  public List<ContentView> search(String q,String type,String genre){return contents.search(q,type,genre).stream().map(ContentView::of).toList();}
  public List<AdminContentView> adminCatalog(){return contents.search("","","").stream().map(AdminContentView::of).toList();}
  public List<String> genres(){return genres.findAllByOrderByNameAsc().stream().map(Genre::getName).toList();}
  public Content require(UUID id){return contents.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contenido no encontrado"));}
  public ContentView get(UUID id){return ContentView.of(require(id));}
  public List<ContentView> list(UUID user){return saved.findByUserId(user).stream().map(s->ContentView.of(s.content)).toList();}
  @Transactional public void save(UUID user,UUID id){var c=require(id);if(saved.findByUserIdAndContentId(user,id).isEmpty()){var s=new SavedItem();s.userId=user;s.content=c;saved.save(s);}}
  @Transactional public void unsave(UUID user,UUID id){saved.findByUserIdAndContentId(user,id).ifPresent(saved::delete);}

  /** Historial: lo último que se vio primero. */
  public List<ProgressView> progress(UUID user){return progress.findByUserIdOrderByUpdatedAtDesc(user).stream().map(ProgressView::of).toList();}
  @Transactional public void progress(UUID user,UUID id,long seconds,Integer total){
    if(total!=null && seconds>total) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El progreso no puede superar la duración");
    var c=require(id);var p=progress.findByUserIdAndContentId(user,id).orElseGet(WatchProgress::new);
    p.userId=user;p.content=c;p.seconds=seconds;p.updatedAt=Instant.now();
    if(total!=null) p.totalSeconds=total;
    progress.save(p);
  }
  @Transactional public void forget(UUID user,UUID id){progress.findByUserIdAndContentId(user,id).ifPresent(progress::delete);}

  @Transactional public ContentView put(UUID id,ContentInput input){
    if(!safeImage(input.imageUrl())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La imagen debe usar HTTPS o /assets/");
    String video=input.videoPath();if(video!=null && !video.isBlank() && !video.matches("[a-zA-Z0-9_/-]+\\.[a-zA-Z0-9]+")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa una ruta del bucket videos, por ejemplo peliculas/demo.mp4");
    var c=id==null ? new Content() : require(id);c.title=input.title();c.description=input.description();c.type=input.type();c.releaseYear=input.releaseYear();c.durationMinutes=input.durationMinutes();c.seasons=input.seasons();
    c.genre=genres.findByName(input.genre().strip()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecciona un género del catálogo"));
    c.imageUrl=input.imageUrl();c.videoPath=video;c.featured=input.featured();c.ageRating=input.ageRating();
    c.trailerUrl=input.trailerUrl()==null||input.trailerUrl().isBlank()?null:input.trailerUrl().strip();
    return ContentView.of(contents.save(c));
  }
  private boolean safeImage(String value){ if(value.startsWith("/assets/") && !value.contains(".."))return true;try{var u=java.net.URI.create(value);return "https".equals(u.getScheme())&&u.getHost()!=null;}catch(Exception e){return false;}}
  @Transactional public void delete(UUID id){
    require(id);saved.deleteByContentId(id);progress.deleteByContentId(id);reviews.deleteByContentId(id);episodes.deleteByContentId(id);contents.deleteById(id);
  }
}
