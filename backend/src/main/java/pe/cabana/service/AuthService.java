package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.Account;
import pe.cabana.repository.AccountRepository;
import java.time.Instant;
import java.util.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AuthService {
  private static final ObjectMapper JSON=new ObjectMapper();
  private final AccountRepository accounts;
  private final boolean demo;
  private final RestClient client;
  private final JwtEncoder encoder;
  private final JwtDecoder decoder;
  private final BCryptPasswordEncoder passwords=new BCryptPasswordEncoder();
  public AuthService(AccountRepository accounts,@Value("${cabana.demo}") boolean demo,@Value("${cabana.supabase-url:http://localhost}") String url,@Value("${cabana.supabase-key:demo}") String key,org.springframework.beans.factory.ObjectProvider<JwtEncoder> encoder,JwtDecoder decoder) {
    this.accounts=accounts; this.demo=demo; this.encoder=encoder.getIfAvailable(); this.decoder=decoder;
    this.client=RestClient.builder().baseUrl(url+"/auth/v1").defaultHeader("apikey",key).build();
  }
  public record Session(String accessToken,String refreshToken,long expiresIn,String message) {}

  public Session login(Credentials input) {
    if(!demo) return remote("/token?grant_type=password",Map.of("email",input.email(),"password",input.password()));
    var account=accounts.findByEmail(input.email().toLowerCase(Locale.ROOT)).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos."));
    if(account.passwordHash==null || !passwords.matches(input.password(),account.passwordHash)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos.");
    return token(account.id);
  }
  @Transactional public Session register(Registration input) {
    if(!demo) return remote("/signup",Map.of("email",input.email(),"password",input.password(),"data",Map.of("name",input.name())));
    String email=input.email().toLowerCase(Locale.ROOT);
    if(accounts.findByEmail(email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT,"El correo ya está registrado. Inicia sesión o recupera tu contraseña.");
    var a=new Account(); a.id=UUID.randomUUID();a.email=email;a.name=input.name();a.passwordHash=passwords.encode(input.password());accounts.save(a);return token(a.id);
  }
  public Session refresh(String refresh) {
    if(refresh==null || refresh.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Inicia sesión para continuar");
    if(!demo) return remote("/token?grant_type=refresh_token",Map.of("refresh_token",refresh));
    try { return token(UUID.fromString(decoder.decode(refresh).getSubject())); } catch(Exception e){ throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"La sesión expiró"); }
  }
  public void logout(String bearer) {
    if(!demo && bearer!=null && bearer.startsWith("Bearer ")) {
      try { client.post().uri("/logout?scope=local").header("Authorization",bearer).retrieve().toBodilessEntity(); } catch(RestClientException ignored) {}
    }
  }

  /** Envía el correo de recuperación. La respuesta no revela si el correo existe. */
  public String forgot(String email,String redirectTo) {
    if(demo) return "En el modo demostración no se envían correos. Usa las cuentas de prueba o cambia tu contraseña desde Mi perfil.";
    String uri=UriComponentsBuilder.fromPath("/recover").queryParam("redirect_to",redirectTo).build().toUriString();
    try { client.post().uri(uri).body(Map.of("email",email)).retrieve().toBodilessEntity(); }
    catch(RestClientResponseException e) { if(e.getStatusCode().value()==429) throw translate(e.getStatusCode().value(),e.getResponseBodyAsString()); }
    catch(RestClientException e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo conectar con Supabase Auth"); }
    return "Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de Spam.";
  }

  /** Nueva contraseña con el token del enlace de recuperación (o de la sesión actual). */
  @Transactional public void reset(Jwt jwt,String password) {
    if(demo) { var a=account(jwt); a.passwordHash=passwords.encode(password); accounts.save(a); return; }
    updateRemoteUser(jwt.getTokenValue(),Map.of("password",password));
  }

  /** Cambio de contraseña desde Mi perfil: exige la contraseña actual. */
  @Transactional public void changePassword(Jwt jwt,PasswordChange input) {
    var a=account(jwt);
    if(input.currentPassword().equals(input.newPassword())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La nueva contraseña debe ser distinta de la actual.");
    if(demo) {
      if(a.passwordHash==null || !passwords.matches(input.currentPassword(),a.passwordHash)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contraseña actual no es correcta.");
      a.passwordHash=passwords.encode(input.newPassword()); accounts.save(a); return;
    }
    try { remote("/token?grant_type=password",Map.of("email",a.email,"password",input.currentPassword())); }
    catch(ResponseStatusException e) { if(e.getStatusCode().value()==401) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contraseña actual no es correcta."); throw e; }
    updateRemoteUser(jwt.getTokenValue(),Map.of("password",input.newPassword()));
  }

  @Transactional public Profile rename(Jwt jwt,String name) {
    var a=account(jwt); a.name=name.strip(); accounts.save(a);
    if(!demo) { try { updateRemoteUser(jwt.getTokenValue(),Map.of("data",Map.of("name",a.name))); } catch(ResponseStatusException ignored) { /* el nombre de Cabaña ya se guardó */ } }
    return Profile.of(a);
  }

  private Account account(Jwt jwt) {
    return accounts.findById(UUID.fromString(jwt.getSubject())).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Vuelve a iniciar sesión"));
  }

  private void updateRemoteUser(String accessToken,Map<String,Object> body) {
    try { client.put().uri("/user").header("Authorization","Bearer "+accessToken).body(body).retrieve().toBodilessEntity(); }
    catch(RestClientResponseException e) { throw translate(e.getStatusCode().value(),e.getResponseBodyAsString()); }
    catch(RestClientException e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo conectar con Supabase Auth"); }
  }

  private Session token(UUID id) {
    Instant now=Instant.now(); var claims=JwtClaimsSet.builder().issuer("cabana-demo").subject(id.toString()).audience(List.of("authenticated")).issuedAt(now).expiresAt(now.plusSeconds(3600)).build();
    String token=encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue(); return new Session(token,token,3600,"Sesión iniciada");
  }
  @SuppressWarnings("unchecked") private Session remote(String path,Map<String,Object> body) {
    try {
      Map<String,Object> result=client.post().uri(path).body(body).retrieve().body(Map.class);
      if(result==null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se recibió respuesta de autenticación");
      return new Session((String)result.get("access_token"),(String)result.get("refresh_token"),((Number)result.getOrDefault("expires_in",3600)).longValue(), result.get("access_token")==null ? "Revisa tu correo para confirmar tu cuenta y luego inicia sesión." : "Sesión iniciada");
    } catch(RestClientResponseException e) {
      throw translate(e.getStatusCode().value(),e.getResponseBodyAsString());
    } catch(RestClientException e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo conectar con Supabase Auth"); }
  }

  /** Traduce los errores de Supabase Auth (error_code / msg / error_description) a mensajes claros en español. */
  static ResponseStatusException translate(int status,String body) {
    String code="",text="";
    try {
      JsonNode n=JSON.readTree(body==null?"":body);
      code=first(n,"error_code","error");
      text=first(n,"msg","error_description","message").toLowerCase(Locale.ROOT);
    } catch(Exception ignored) {}
    if(status==429 || code.startsWith("over_") || text.contains("rate limit"))
      return new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
    if(code.equals("email_not_confirmed") || text.contains("email not confirmed"))
      return new ResponseStatusException(HttpStatus.FORBIDDEN,"Confirma tu correo antes de iniciar sesión. Busca el mensaje de Supabase en tu bandeja de entrada o en Spam.");
    if(code.equals("invalid_credentials") || code.equals("invalid_grant") && text.contains("credentials") || text.contains("invalid login credentials"))
      return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos.");
    if(code.equals("user_already_exists") || code.equals("email_exists") || text.contains("already registered"))
      return new ResponseStatusException(HttpStatus.CONFLICT,"El correo ya está registrado. Inicia sesión o recupera tu contraseña.");
    if(code.equals("weak_password") || text.contains("password should"))
      return new ResponseStatusException(HttpStatus.BAD_REQUEST,"La contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.");
    if(code.equals("same_password") || text.contains("different from the old"))
      return new ResponseStatusException(HttpStatus.BAD_REQUEST,"La nueva contraseña debe ser distinta de la actual.");
    if(code.equals("refresh_token_not_found") || code.equals("refresh_token_already_used") || code.equals("session_not_found") || code.equals("bad_jwt") || status==401 || status==403)
      return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Tu sesión o el enlace expiró. Vuelve a iniciar sesión o pide un nuevo enlace.");
    if(code.equals("signup_disabled"))
      return new ResponseStatusException(HttpStatus.FORBIDDEN,"El registro de cuentas nuevas está desactivado en Supabase.");
    return new ResponseStatusException(HttpStatus.BAD_REQUEST,"No se pudo completar la autenticación. Inténtalo de nuevo.");
  }
  private static String first(JsonNode n,String... fields){for(var f:fields){var v=n.path(f);if(v.isTextual()&&!v.asText().isBlank())return v.asText();}return "";}

  @Transactional public Profile profile(Jwt jwt) {
    UUID id=UUID.fromString(jwt.getSubject());
    var a=accounts.findById(id).orElseGet(()->{
      var n=new Account();n.id=id;n.email=jwt.getClaimAsString("email");
      if(n.email==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La cuenta requiere correo electrónico");
      Map<String,Object> metadata=jwt.getClaim("user_metadata"); n.name=metadata!=null && metadata.get("name") instanceof String name && !name.isBlank() ? name.substring(0,Math.min(80,name.length())) : n.email.split("@")[0];
      return accounts.save(n);
    }); return Profile.of(a);
  }
}
