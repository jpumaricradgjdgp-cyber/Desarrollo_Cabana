package pe.cabana.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
/** Documentación Swagger en /swagger-ui.html con autenticación Bearer JWT. */
@Configuration
public class OpenApiConfig {
  @Bean OpenAPI cabanaOpenApi(){
    return new OpenAPI()
      .info(new Info().title("Cabaña API").version("2.0.0")
        .description("API REST de la plataforma de streaming Cabaña: catálogo, autenticación JWT, Mi lista, progreso, reseñas y administración."))
      .components(new Components().addSecuritySchemes("bearer",
        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
      .addSecurityItem(new SecurityRequirement().addList("bearer"));
  }
}
