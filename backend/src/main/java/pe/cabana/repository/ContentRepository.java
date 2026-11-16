package pe.cabana.repository;
import pe.cabana.model.Content;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ContentRepository extends JpaRepository<Content,UUID> {
  @Query("select c from Content c join fetch c.genre g where (:q = '' or lower(c.title) like lower(concat('%', :q, '%'))) and (:type = '' or c.type = :type) and (:genre = '' or g.name = :genre) order by c.featured desc, c.title asc")
  List<Content> search(@Param("q") String q,@Param("type") String type,@Param("genre") String genre);
  @Query("select distinct g.name from Content c join c.genre g order by g.name") List<String> genres();
}
