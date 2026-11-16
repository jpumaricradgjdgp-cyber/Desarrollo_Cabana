package pe.cabana.repository;
import pe.cabana.model.Genre;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GenreRepository extends JpaRepository<Genre,UUID> {
 Optional<Genre> findByName(String name);
 List<Genre> findAllByOrderByNameAsc();
}
