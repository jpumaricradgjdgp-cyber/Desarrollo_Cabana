package pe.cabana.api;
import pe.cabana.api.Dtos.*;
import pe.cabana.service.*;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.beans.factory.annotation.Value;
@RestController @RequestMapping("/api")
public class CatalogController {
  private final CatalogService catalog;private final PlaybackService playback;private final boolean demo;
  public CatalogController(CatalogService c,PlaybackService p,@Value("${cabana.demo}") boolean demo){catalog=c;playback=p;this.demo=demo;}
  @GetMapping("/config") Map<String,Object> config(){var today=java.time.LocalDate.now(java.time.ZoneId.of("America/Lima"));return Map.of("demo",demo,"name","Cabaña","halloweenSeason",today.getMonthValue()==10,"seasonYear",today.getYear());}
  @GetMapping("/catalog") List<ContentView> search(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="") String type,@RequestParam(defaultValue="") String genre){return catalog.search(q.length()>150?q.substring(0,150):q,type,genre);}
  @GetMapping("/catalog/{id}") ContentView get(@PathVariable UUID id){return catalog.get(id);}
  @GetMapping("/genres") List<String> genres(){return catalog.genres();}
  private UUID user(Jwt jwt){return UUID.fromString(jwt.getSubject());}
  @GetMapping("/me/list") List<ContentView> list(@AuthenticationPrincipal Jwt j){return catalog.list(user(j));}
  @PutMapping("/me/list/{id}") void save(@AuthenticationPrincipal Jwt j,@PathVariable UUID id){catalog.save(user(j),id);}
  @DeleteMapping("/me/list/{id}") void unsave(@AuthenticationPrincipal Jwt j,@PathVariable UUID id){catalog.unsave(user(j),id);}
  @GetMapping("/me/progress") List<ProgressView> progress(@AuthenticationPrincipal Jwt j){return catalog.progress(user(j));}
  @PutMapping("/me/progress/{id}") void progress(@AuthenticationPrincipal Jwt j,@PathVariable UUID id,@Valid @RequestBody Position p){catalog.progress(user(j),id,p.seconds());}
  @GetMapping("/playback/{id}") PlaybackService.Playback play(@PathVariable UUID id){return playback.play(id);}
  @GetMapping("/admin/catalog") List<pe.cabana.model.Content> adminCatalog(){return catalog.search("","","").stream().map(c->catalog.require(c.id())).toList();}
  @PostMapping("/admin/catalog") ContentView create(@Valid @RequestBody ContentInput p){return catalog.put(null,p);}
  @PutMapping("/admin/catalog/{id}") ContentView update(@PathVariable UUID id,@Valid @RequestBody ContentInput p){return catalog.put(id,p);}
  @DeleteMapping("/admin/catalog/{id}") void delete(@PathVariable UUID id){catalog.delete(id);}
}
