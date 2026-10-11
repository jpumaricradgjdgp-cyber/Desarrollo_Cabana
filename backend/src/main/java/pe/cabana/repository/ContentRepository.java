package pe.cabana.repository;
import pe.cabana.model.Content;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface ContentRepository extends JpaRepository<Content,UUID> {
  @Query("select c from Content c where (:q = '' or lower(c.title) like lower(concat('%', :q, '%'))) and (:type = '' or c.type = :type) and (:genre = '' or c.genre = :genre) order by c.featured desc, c.title asc")
  List<Content> search(@Param("q") String q,@Param("type") String type,@Param("genre") String genre);
  @Query("select distinct c.genre from Content c order by c.genre") List<String> genres();
}
