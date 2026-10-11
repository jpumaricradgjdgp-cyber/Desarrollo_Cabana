package pe.cabana.repository;
import pe.cabana.model.SavedItem;
import java.util.*;
import org.springframework.data.jpa.repository.*;
public interface SavedRepository extends JpaRepository<SavedItem,UUID> {
  @EntityGraph(attributePaths="content") List<SavedItem> findByUserId(UUID userId);
  Optional<SavedItem> findByUserIdAndContentId(UUID userId,UUID contentId);
  void deleteByContentId(UUID contentId);
}
