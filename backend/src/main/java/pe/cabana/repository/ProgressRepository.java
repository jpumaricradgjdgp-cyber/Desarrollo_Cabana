package pe.cabana.repository;
import pe.cabana.model.WatchProgress;
import java.util.*;
import org.springframework.data.jpa.repository.*;
public interface ProgressRepository extends JpaRepository<WatchProgress,UUID> {
  @EntityGraph(attributePaths="content") List<WatchProgress> findByUserId(UUID userId);
  Optional<WatchProgress> findByUserIdAndContentId(UUID userId,UUID contentId);
  void deleteByContentId(UUID contentId);
}
