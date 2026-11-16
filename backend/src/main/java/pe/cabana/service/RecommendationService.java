package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.Content;
import pe.cabana.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/**
 * Recomendaciones según el gusto del usuario por género.
 * Puntaje por género: +2 por título guardado, +1 por título visto, +3/-3 por reseña buena/mala (consultas JPQL agregadas).
 * Cada candidato (no guardado, no visto, no reseñado) suma el puntaje de su género y medio punto por estrella de promedio.
 */
@Service @Transactional(readOnly=true)
public class RecommendationService {
  private final ContentRepository contents; private final SavedRepository saved; private final ProgressRepository progress;
  private final ReviewRepository reviews; private final ReviewService reviewService;
  public RecommendationService(ContentRepository c,SavedRepository s,ProgressRepository p,ReviewRepository r,ReviewService rs){contents=c;saved=s;progress=p;reviews=r;reviewService=rs;}

  public List<Recommendation> forUser(UUID user,int limit){
    var taste=new HashMap<String,Double>();
    add(taste,saved.genresSaved(user),2);
    add(taste,progress.genresWatched(user),1);
    add(taste,reviews.genreTaste(user),3);

    var seen=new HashSet<UUID>();
    saved.findByUserId(user).forEach(s->seen.add(s.content.id));
    progress.findByUserIdOrderByUpdatedAtDesc(user).forEach(p->seen.add(p.content.id));
    reviews.findByAccountIdOrderByCreatedAtDesc(user).forEach(r->seen.add(r.content.id));

    var ratings=new HashMap<UUID,Double>();
    reviewService.ratings().forEach(r->ratings.put(r.contentId(),r.average()));
    boolean noSignals=taste.values().stream().noneMatch(v->v>0);

    record Scored(Content c,double score,String reason){}
    return contents.search("","","").stream()
      .filter(c->!seen.contains(c.id))
      .map(c->{
        double genre=taste.getOrDefault(c.genre.getName(),0.0);
        double rating=ratings.getOrDefault(c.id,0.0);
        double score=genre+rating*0.5+(c.featured?0.5:0);
        String reason=genre>0?"Porque te gusta "+c.genre.getName()
          :rating>=4?"Muy bien calificada por la comunidad"
          :noSignals&&c.featured?"Destacada en Cabaña":"Para descubrir algo nuevo";
        return new Scored(c,score,reason);
      })
      .filter(s->noSignals||s.score()>0)
      .sorted(Comparator.comparingDouble(Scored::score).reversed().thenComparing(s->s.c().title))
      .limit(limit)
      .map(s->new Recommendation(ContentView.of(s.c()),s.reason()))
      .toList();
  }

  private static void add(Map<String,Double> taste,List<Object[]> rows,double weight){
    for(var row:rows) taste.merge((String)row[0],((Number)row[1]).doubleValue()*weight,Double::sum);
  }
}
