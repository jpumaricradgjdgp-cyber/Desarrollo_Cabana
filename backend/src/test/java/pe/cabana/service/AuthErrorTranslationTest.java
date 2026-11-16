package pe.cabana.service;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
/** Los errores de Supabase Auth deben llegar al usuario como mensajes claros en español. */
class AuthErrorTranslationTest {
  private static String message(int status,String body){return AuthService.translate(status,body).getReason();}
  private static int status(int status,String body){return AuthService.translate(status,body).getStatusCode().value();}

  @Test void emailNotConfirmed(){
    String body="{\"code\":400,\"error_code\":\"email_not_confirmed\",\"msg\":\"Email not confirmed\"}";
    assertThat(message(400,body)).startsWith("Confirma tu correo");
    assertThat(status(400,body)).isEqualTo(403);
  }
  @Test void wrongPasswordInNewAndLegacyFormats(){
    assertThat(message(400,"{\"error_code\":\"invalid_credentials\",\"msg\":\"Invalid login credentials\"}")).isEqualTo("Correo o contraseña incorrectos.");
    assertThat(message(400,"{\"error\":\"invalid_grant\",\"error_description\":\"Invalid login credentials\"}")).isEqualTo("Correo o contraseña incorrectos.");
  }
  @Test void otherKnownErrors(){
    assertThat(message(422,"{\"error_code\":\"user_already_exists\"}")).contains("ya está registrado");
    assertThat(message(422,"{\"error_code\":\"weak_password\"}")).contains("débil");
    assertThat(message(422,"{\"error_code\":\"same_password\"}")).contains("distinta");
    assertThat(status(429,"{}")).isEqualTo(429);
    assertThat(message(400,"no es json")).contains("No se pudo completar");
  }
}
