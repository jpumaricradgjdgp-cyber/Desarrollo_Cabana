package pe.cabana.api;
import pe.cabana.api.Dtos.*;
import pe.cabana.service.AuthService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final AuthService auth; private final boolean secure; private final String origin;
  public AuthController(AuthService auth,@Value("${cabana.secure-cookies}") boolean secure,@Value("${cabana.allowed-origin}") String origin){this.auth=auth;this.secure=secure;this.origin=origin;}
  // Refresh cookies are HttpOnly. Origin checks protect cookie-based mutations from CSRF.
  private void checkOrigin(String supplied){ if(supplied!=null && !origin.equals(supplied)) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Origen no permitido"); }
  @PostMapping("/login") ResponseEntity<?> login(@Valid @RequestBody Credentials body,@RequestHeader(value="Origin",required=false) String o){checkOrigin(o);return response(auth.login(body));}
  @PostMapping("/register") ResponseEntity<?> register(@Valid @RequestBody Registration body,@RequestHeader(value="Origin",required=false) String o){checkOrigin(o);return response(auth.register(body));}
  @PostMapping("/refresh") ResponseEntity<?> refresh(@CookieValue(value="cabana_refresh",required=false) String cookie,@RequestHeader(value="Origin",required=false) String o){checkOrigin(o);return response(auth.refresh(cookie));}
  @PostMapping("/logout") ResponseEntity<?> logout(@RequestHeader(value="Authorization",required=false) String bearer,@RequestHeader(value="Origin",required=false) String o){checkOrigin(o);auth.logout(bearer);return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie("",0)).body(Map.of("message","Sesión cerrada"));}
  @GetMapping("/me") Profile me(@AuthenticationPrincipal Jwt jwt){return auth.profile(jwt);}
  private ResponseEntity<?> response(AuthService.Session s){
    var body=new LinkedHashMap<String,Object>();body.put("accessToken",s.accessToken());body.put("expiresIn",s.expiresIn());body.put("message",s.message());
    var response=ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL,"no-store");
    if(s.refreshToken()!=null) response.header(HttpHeaders.SET_COOKIE,cookie(s.refreshToken(),86400)); return response.body(body);
  }
  private String cookie(String value,long age){return ResponseCookie.from("cabana_refresh",value).httpOnly(true).secure(secure).sameSite("Lax").path("/api/auth").maxAge(age).build().toString();}
}
