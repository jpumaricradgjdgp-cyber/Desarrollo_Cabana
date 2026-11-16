package pe.cabana.api;
import pe.cabana.api.Dtos.*;
import pe.cabana.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api") @Tag(name="Reseñas y panel",description="Calificaciones, comentarios e indicadores de administración")
public class ReviewController {
  private final ReviewService reviews; private final StatsService stats;
  public ReviewController(ReviewService r,StatsService s){reviews=r;stats=s;}
  private static UUID user(Jwt jwt){return jwt==null?null:UUID.fromString(jwt.getSubject());}

  @Operation(summary="Reseñas de un contenido con su promedio")
  @GetMapping("/catalog/{id}/reviews") ReviewSummary forContent(@PathVariable UUID id,@AuthenticationPrincipal Jwt jwt){return reviews.forContent(id,user(jwt));}

  @Operation(summary="Promedio y cantidad de reseñas de todo el catálogo")
  @GetMapping("/ratings") List<RatingView> ratings(){return reviews.ratings();}

  @Operation(summary="Crear o actualizar mi reseña")
  @PutMapping("/me/reviews/{id}") ReviewView put(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody ReviewInput input){return reviews.put(user(jwt),id,input);}

  @Operation(summary="Eliminar mi reseña")
  @DeleteMapping("/me/reviews/{id}") void deleteMine(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){reviews.deleteMine(user(jwt),id);}

  @Operation(summary="ADMIN · Listar todas las reseñas")
  @GetMapping("/admin/reviews") List<AdminReviewView> all(){return reviews.all();}

  @Operation(summary="ADMIN · Moderar (eliminar) una reseña")
  @DeleteMapping("/admin/reviews/{id}") void delete(@PathVariable UUID id){reviews.delete(id);}

  @Operation(summary="ADMIN · Indicadores del panel")
  @GetMapping("/admin/stats") AdminStats stats(){return stats.stats();}
}
