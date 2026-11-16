package pe.cabana.repository;
import pe.cabana.model.Review;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ReviewRepository extends JpaRepository<Review,UUID> {
  @EntityGraph(attributePaths="account") List<Review> findByContentIdOrderByCreatedAtDesc(UUID contentId);
  @EntityGraph(attributePaths={"account","content"}) List<Review> findAllByOrderByCreatedAtDesc();
  @EntityGraph(attributePaths={"account","content"}) List<Review> findByAccountIdOrderByCreatedAtDesc(UUID accountId);
  Optional<Review> findByAccountIdAndContentId(UUID accountId,UUID contentId);
  void deleteByContentId(UUID contentId);
  long countByAccountId(UUID accountId);
  /** Promedio y cantidad de reseñas agrupados por contenido (JPQL con agregación). */
  @Query("select r.content.id, avg(r.rating), count(r) from Review r group by r.content.id")
  List<Object[]> ratings();
  /** Gusto del usuario por género: suma +1 por reseña buena (4-5) y -1 por mala (1-2). */
  @Query("select g.name, sum(case when r.rating >= 4 then 1 when r.rating <= 2 then -1 else 0 end) from Review r join r.content c join c.genre g where r.account.id = :user group by g.name")
  List<Object[]> genreTaste(@Param("user") UUID user);
}
