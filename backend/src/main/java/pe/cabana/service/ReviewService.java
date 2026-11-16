package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.Review;
import pe.cabana.repository.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
@Service @Transactional(readOnly=true)
public class ReviewService {
  private final ReviewRepository reviews; private final AccountRepository accounts; private final CatalogService catalog;
  public ReviewService(ReviewRepository r,AccountRepository a,CatalogService c){reviews=r;accounts=a;catalog=c;}

  public ReviewSummary forContent(UUID contentId,UUID viewer){
    catalog.require(contentId);
    var list=reviews.findByContentIdOrderByCreatedAtDesc(contentId).stream().map(r->ReviewView.of(r,viewer)).toList();
    double avg=list.stream().mapToInt(ReviewView::rating).average().orElse(0);
    return new ReviewSummary(round(avg),list.size(),list);
  }

  public List<RatingView> ratings(){
    return reviews.ratings().stream()
      .map(row->new RatingView((UUID)row[0],round(((Number)row[1]).doubleValue()),((Number)row[2]).longValue())).toList();
  }

  @Transactional public ReviewView put(UUID user,UUID contentId,ReviewInput input){
    var content=catalog.require(contentId);
    var account=accounts.findById(user).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Vuelve a iniciar sesión para publicar tu reseña"));
    var review=reviews.findByAccountIdAndContentId(user,contentId).orElseGet(Review::new);
    review.account=account; review.content=content; review.rating=input.rating();
    review.comment=input.comment()==null||input.comment().isBlank()?null:input.comment().strip();
    review.createdAt=Instant.now();
    return ReviewView.of(reviews.save(review),user);
  }

  @Transactional public void deleteMine(UUID user,UUID contentId){reviews.findByAccountIdAndContentId(user,contentId).ifPresent(reviews::delete);}

  public List<AdminReviewView> all(){return reviews.findAllByOrderByCreatedAtDesc().stream().map(AdminReviewView::of).toList();}

  @Transactional public void delete(UUID id){
    if(!reviews.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Reseña no encontrada");
    reviews.deleteById(id);
  }

  static double round(double v){return Math.round(v*10)/10.0;}
}
