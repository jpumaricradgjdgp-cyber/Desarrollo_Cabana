package pe.cabana.repository;
import pe.cabana.model.Episode;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EpisodeRepository extends JpaRepository<Episode,UUID> {
  List<Episode> findByContentIdOrderBySeasonAscNumberAsc(UUID contentId);
  /** Carga la serie junto al capítulo: las entidades usan campos públicos y un proxy perezoso no los inicializa. */
  @org.springframework.data.jpa.repository.EntityGraph(attributePaths="content") Optional<Episode> findWithContentById(UUID id);
  boolean existsByContentIdAndSeasonAndNumber(UUID contentId,int season,int number);
  void deleteByContentId(UUID contentId);
}
