package pe.cabana.repository;
import pe.cabana.model.Review;
import java.util.*;
import org.springframework.data.jpa.repository.*;
public interface ReviewRepository extends JpaRepository<Review,UUID> {
  @EntityGraph(attributePaths="account") List<Review> findByContentIdOrderByCreatedAtDesc(UUID contentId);
  @EntityGraph(attributePaths={"account","content"}) List<Review> findAllByOrderByCreatedAtDesc();
  Optional<Review> findByAccountIdAndContentId(UUID accountId,UUID contentId);
  void deleteByContentId(UUID contentId);
  /** Promedio y cantidad de reseñas agrupados por contenido (JPQL con agregación). */
  @Query("select r.content.id, avg(r.rating), count(r) from Review r group by r.content.id")
  List<Object[]> ratings();
}
