package pe.cabana.service;
import pe.cabana.model.*;
import pe.cabana.repository.*;
import pe.cabana.api.Dtos.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service @Transactional(readOnly=true)
public class CatalogService {
  private final ContentRepository contents; private final SavedRepository saved; private final ProgressRepository progress;
  public CatalogService(ContentRepository c,SavedRepository s,ProgressRepository p){contents=c;saved=s;progress=p;}
  public List<ContentView> search(String q,String type,String genre){return contents.search(q,type,genre).stream().map(ContentView::of).toList();}
  public List<String> genres(){return contents.genres();}
  public Content require(UUID id){return contents.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Contenido no encontrado"));}
  public ContentView get(UUID id){return ContentView.of(require(id));}
  public List<ContentView> list(UUID user){return saved.findByUserId(user).stream().map(s->ContentView.of(s.content)).toList();}
  @Transactional public void save(UUID user,UUID id){var c=require(id);if(saved.findByUserIdAndContentId(user,id).isEmpty()){var s=new SavedItem();s.userId=user;s.content=c;saved.save(s);}}
  @Transactional public void unsave(UUID user,UUID id){saved.findByUserIdAndContentId(user,id).ifPresent(saved::delete);}
  public List<ProgressView> progress(UUID user){return progress.findByUserId(user).stream().map(p->new ProgressView(ContentView.of(p.content),p.seconds)).toList();}
  @Transactional public void progress(UUID user,UUID id,long seconds){var c=require(id);var p=progress.findByUserIdAndContentId(user,id).orElseGet(WatchProgress::new);p.userId=user;p.content=c;p.seconds=seconds;progress.save(p);}
  @Transactional public ContentView put(UUID id,ContentInput input){
    if(!safeImage(input.imageUrl())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La imagen debe usar HTTPS o /assets/");
    String video=input.videoPath();if(video!=null && !video.isBlank() && !video.matches("[a-zA-Z0-9_/-]+\\.[a-zA-Z0-9]+")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa una ruta del bucket videos, por ejemplo peliculas/demo.mp4");
    var c=id==null ? new Content() : require(id);c.title=input.title();c.description=input.description();c.type=input.type();c.releaseYear=input.releaseYear();c.durationMinutes=input.durationMinutes();c.seasons=input.seasons();c.genre=input.genre();c.imageUrl=input.imageUrl();c.videoPath=video;c.featured=input.featured();c.ageRating=input.ageRating();return ContentView.of(contents.save(c));
  }
  private boolean safeImage(String value){ if(value.startsWith("/assets/") && !value.contains(".."))return true;try{var u=java.net.URI.create(value);return "https".equals(u.getScheme())&&u.getHost()!=null;}catch(Exception e){return false;}}
  @Transactional public void delete(UUID id){require(id);saved.deleteByContentId(id);progress.deleteByContentId(id);contents.deleteById(id);}
}
