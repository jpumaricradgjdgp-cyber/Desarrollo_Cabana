package pe.cabana.repository;
import pe.cabana.model.SavedItem;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface SavedRepository extends JpaRepository<SavedItem,UUID> {
  @EntityGraph(attributePaths={"content","content.genre"}) List<SavedItem> findByUserId(UUID userId);
  Optional<SavedItem> findByUserIdAndContentId(UUID userId,UUID contentId);
  void deleteByContentId(UUID contentId);
  long countByUserId(UUID userId);
  @Query("select g.name, count(s) from SavedItem s join s.content c join c.genre g where s.userId = :user group by g.name")
  List<Object[]> genresSaved(@Param("user") UUID user);
}
