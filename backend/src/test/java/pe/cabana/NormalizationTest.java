package pe.cabana;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cabana.repository.*;
import pe.cabana.service.CatalogService;
import pe.cabana.api.Dtos.ContentInput;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest @ActiveProfiles("demo") @Transactional
class NormalizationTest {
 @Autowired ContentRepository contents; @Autowired GenreRepository genres; @Autowired CatalogService catalog;
 @Test void titlesShareOneGenreAndDtoKeepsPublicContract(){
  var rows=contents.search("","","Ciencia ficción");
  assertThat(rows).hasSizeGreaterThan(1);
  var id=genres.findByName("Ciencia ficción").orElseThrow().id;
  assertThat(rows).allMatch(c->c.genre.id.equals(id));
  assertThat(catalog.search("","","Ciencia ficción")).allMatch(c->c.genre().equals("Ciencia ficción"));
  assertThat(catalog.adminCatalog()).allMatch(c->c.genre()!=null);
 }
 @Test void rejectsUnknownGenreWithoutWritingContent(){
  long before=contents.count();
  var input=new ContentInput("Sin género válido","Ejemplo","MOVIE",2026,90,0,"No existe","/assets/dark.jpg",null,false,"13+");
  assertThatThrownBy(()->catalog.put(null,input)).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
  assertThat(contents.count()).isEqualTo(before);
 }
}
