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
@RestController @RequestMapping("/api") @Tag(name="Cuenta, historial y episodios",description="Perfil, contraseña, historial, recomendaciones, capítulos y usuarios")
public class AccountController {
  private final AuthService auth; private final AccountService accounts; private final CatalogService catalog;
  private final RecommendationService recommendations; private final EpisodeService episodes;
  public AccountController(AuthService a,AccountService s,CatalogService c,RecommendationService r,EpisodeService e){auth=a;accounts=s;catalog=c;recommendations=r;episodes=e;}
  private static UUID user(Jwt jwt){return UUID.fromString(jwt.getSubject());}

  // ----- Perfil -----
  @Operation(summary="Cambiar mi nombre")
  @PatchMapping("/me/profile") Profile rename(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody NameInput input){return auth.rename(jwt,input.name());}
  @Operation(summary="Cambiar mi contraseña (requiere la actual)")
  @PutMapping("/me/password") Map<String,String> password(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody PasswordChange input){auth.changePassword(jwt,input);return Map.of("message","Contraseña actualizada");}
  @Operation(summary="Mis números: guardados, vistos y reseñas")
  @GetMapping("/me/stats") ProfileStats stats(@AuthenticationPrincipal Jwt jwt){return accounts.stats(user(jwt));}
  @Operation(summary="Mis reseñas")
  @GetMapping("/me/reviews") List<MyReviewView> myReviews(@AuthenticationPrincipal Jwt jwt){return accounts.myReviews(user(jwt));}

  // ----- Historial y recomendaciones -----
  @Operation(summary="Quitar un título de mi historial")
  @DeleteMapping("/me/progress/{id}") void forget(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id){catalog.forget(user(jwt),id);}
  @Operation(summary="Recomendaciones según mis géneros favoritos")
  @GetMapping("/me/recommendations") List<Recommendation> recommendations(@AuthenticationPrincipal Jwt jwt){return recommendations.forUser(user(jwt),12);}

  // ----- Episodios -----
  @Operation(summary="Temporadas y capítulos de una serie")
  @GetMapping("/catalog/{id}/episodes") List<EpisodeView> episodes(@PathVariable UUID id){return episodes.of(id);}
  @Operation(summary="ADMIN · Agregar un capítulo")
  @PostMapping("/admin/catalog/{id}/episodes") EpisodeView addEpisode(@PathVariable UUID id,@Valid @RequestBody EpisodeInput input){return episodes.create(id,input);}
  @Operation(summary="ADMIN · Editar un capítulo")
  @PutMapping("/admin/episodes/{id}") EpisodeView editEpisode(@PathVariable UUID id,@Valid @RequestBody EpisodeInput input){return episodes.update(id,input);}
  @Operation(summary="ADMIN · Eliminar un capítulo")
  @DeleteMapping("/admin/episodes/{id}") void deleteEpisode(@PathVariable UUID id){episodes.delete(id);}

  // ----- Usuarios (ADMIN) -----
  @Operation(summary="ADMIN · Listar usuarios con su actividad")
  @GetMapping("/admin/users") List<UserAdminView> users(){return accounts.users();}
  @Operation(summary="ADMIN · Cambiar el rol de un usuario")
  @PutMapping("/admin/users/{id}/role") UserAdminView role(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID id,@Valid @RequestBody RoleInput input){return accounts.changeRole(user(jwt),id,input.role());}
}
