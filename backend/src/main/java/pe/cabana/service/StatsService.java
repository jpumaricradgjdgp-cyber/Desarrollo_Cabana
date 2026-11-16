package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/** Indicadores del panel de administración. */
@Service @Transactional(readOnly=true)
public class StatsService {
  private final ContentRepository contents; private final GenreRepository genres; private final AccountRepository accounts;
  private final ReviewRepository reviews; private final SavedRepository saved; private final ReviewService reviewService;
  public StatsService(ContentRepository c,GenreRepository g,AccountRepository a,ReviewRepository r,SavedRepository s,ReviewService rs){
    contents=c;genres=g;accounts=a;reviews=r;saved=s;reviewService=rs;
  }
  public AdminStats stats(){
    var byGenre=contents.countByGenre().stream().map(row->new GenreCount((String)row[0],((Number)row[1]).longValue())).toList();
    var titles=new HashMap<UUID,String>();
    contents.findAll().forEach(c->titles.put(c.id,c.title));
    var top=reviewService.ratings().stream()
      .sorted(Comparator.comparingDouble(RatingView::average).reversed().thenComparing(Comparator.comparingLong(RatingView::count).reversed()))
      .limit(5).map(r->new TopRated(r.contentId(),titles.get(r.contentId()),r.average(),r.count())).toList();
    return new AdminStats(contents.countByType("MOVIE"),contents.countByType("SERIES"),genres.count(),accounts.count(),
      reviews.count(),saved.count(),byGenre,top);
  }
}
