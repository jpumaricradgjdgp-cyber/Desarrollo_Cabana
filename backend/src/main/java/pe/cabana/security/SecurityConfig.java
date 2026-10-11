package pe.cabana.security;
import java.util.*;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.cors.*;
import pe.cabana.repository.AccountRepository;
@Configuration
public class SecurityConfig {
  @Bean SecurityFilterChain security(HttpSecurity http,AccountRepository accounts) throws Exception {
    http.csrf(c->c.disable()).cors(c->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
    http.authorizeHttpRequests(a->a
      .requestMatchers("/api/auth/login","/api/auth/register","/api/auth/refresh","/api/auth/logout","/api/config").permitAll()
      .requestMatchers(org.springframework.http.HttpMethod.GET,"/api/catalog/**","/api/genres").permitAll()
      .requestMatchers("/api/admin/**").hasRole("ADMIN")
      .requestMatchers("/api/**").authenticated()
      .requestMatchers(org.springframework.http.HttpMethod.GET,"/**").permitAll()
      .anyRequest().denyAll());
    http.oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(jwt->{
      var id=UUID.fromString(jwt.getSubject());
      String role=accounts.findById(id).map(a->a.role).orElse("USER");
      return new JwtAuthenticationToken(jwt,List.of(new SimpleGrantedAuthority("ROLE_"+role)));
    })));
    return http.build();
  }
  @Bean CorsConfigurationSource cors(@Value("${cabana.allowed-origin}") String origin) {
    var c=new CorsConfiguration(); c.setAllowedOrigins(List.of(origin)); c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS")); c.setAllowedHeaders(List.of("Authorization","Content-Type")); c.setAllowCredentials(true);
    var source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**",c); return source;
  }
  @Bean @Profile("supabase") JwtDecoder supabaseDecoder(@Value("${cabana.supabase-url}") String url) {
    var d=NimbusJwtDecoder.withJwkSetUri(url+"/auth/v1/.well-known/jwks.json").jwsAlgorithms(a->{a.add(SignatureAlgorithm.RS256);a.add(SignatureAlgorithm.ES256);}).build();
    var audience=(OAuth2TokenValidator<Jwt>) jwt->jwt.getAudience().contains("authenticated") ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token","Audiencia incorrecta",null));
    var subject=(OAuth2TokenValidator<Jwt>) jwt->{try {UUID.fromString(jwt.getSubject()); return OAuth2TokenValidatorResult.success();} catch(Exception e){return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));}};
    d.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(url+"/auth/v1"),audience,subject)); return d;
  }
}
