package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.Account;
import pe.cabana.repository.AccountRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AuthService {
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
    var account=accounts.findByEmail(input.email().toLowerCase(Locale.ROOT)).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos"));
    if(!passwords.matches(input.password(),account.passwordHash)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos");
    return token(account.id);
  }
  @Transactional public Session register(Registration input) {
    if(!demo) return remote("/signup",Map.of("email",input.email(),"password",input.password(),"data",Map.of("name",input.name())));
    String email=input.email().toLowerCase(Locale.ROOT);
    if(accounts.findByEmail(email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT,"El correo ya está registrado");
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
      if(e.getStatusCode().value()==429) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Demasiados intentos. Intenta más tarde.");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No se pudo autenticar. Verifica el correo, la contraseña y la confirmación de tu cuenta.");
    } catch(RestClientException e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo conectar con Supabase Auth"); }
  }
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
