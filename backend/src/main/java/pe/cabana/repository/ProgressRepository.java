package pe.cabana.repository;
import pe.cabana.model.WatchProgress;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ProgressRepository extends JpaRepository<WatchProgress,UUID> {
  @EntityGraph(attributePaths={"content","content.genre"}) List<WatchProgress> findByUserIdOrderByUpdatedAtDesc(UUID userId);
  Optional<WatchProgress> findByUserIdAndContentId(UUID userId,UUID contentId);
  void deleteByContentId(UUID contentId);
  long countByUserId(UUID userId);
  /** Géneros vistos por el usuario: alimenta las recomendaciones. */
  @Query("select g.name, count(p) from WatchProgress p join p.content c join c.genre g where p.userId = :user group by g.name")
  List<Object[]> genresWatched(@Param("user") UUID user);
}
