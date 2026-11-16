package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.*;
import pe.cabana.repository.EpisodeRepository;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
/** Temporadas y capítulos de las series. */
@Service @Transactional(readOnly=true)
public class EpisodeService {
  private final EpisodeRepository episodes; private final CatalogService catalog;
  public EpisodeService(EpisodeRepository e,CatalogService c){episodes=e;catalog=c;}

  public List<EpisodeView> of(UUID contentId){
    catalog.require(contentId);
    return episodes.findByContentIdOrderBySeasonAscNumberAsc(contentId).stream().map(EpisodeView::of).toList();
  }

  @Transactional public EpisodeView create(UUID contentId,EpisodeInput input){
    var series=series(contentId,input);
    if(episodes.existsByContentIdAndSeasonAndNumber(contentId,input.season(),input.number()))
      throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya existe el capítulo "+input.number()+" de la temporada "+input.season());
    var e=new Episode();e.content=series;return EpisodeView.of(episodes.save(apply(e,input)));
  }

  @Transactional public EpisodeView update(UUID id,EpisodeInput input){
    var e=require(id);series(e.content.id,input);
    boolean moved=e.season!=input.season()||e.number!=input.number();
    if(moved && episodes.existsByContentIdAndSeasonAndNumber(e.content.id,input.season(),input.number()))
      throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya existe el capítulo "+input.number()+" de la temporada "+input.season());
    return EpisodeView.of(episodes.save(apply(e,input)));
  }

  @Transactional public void delete(UUID id){episodes.delete(require(id));}

  private Episode require(UUID id){return episodes.findWithContentById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Capítulo no encontrado"));}

  private Content series(UUID contentId,EpisodeInput input){
    var c=catalog.require(contentId);
    if(!"SERIES".equals(c.type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Solo las series tienen capítulos");
    if(input.season()>c.seasons) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La serie solo tiene "+c.seasons+(c.seasons==1?" temporada":" temporadas"));
    return c;
  }

  private static Episode apply(Episode e,EpisodeInput input){
    e.season=input.season();e.number=input.number();e.title=input.title().strip();
    e.description=input.description()==null||input.description().isBlank()?null:input.description().strip();
    e.durationMinutes=input.durationMinutes();return e;
  }
}
