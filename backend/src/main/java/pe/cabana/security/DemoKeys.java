package pe.cabana.security;
import java.security.*;
import java.security.interfaces.RSAPublicKey;
import java.security.interfaces.RSAPrivateKey;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.jwt.*;
@Configuration @Profile("demo")
public class DemoKeys {
  @Bean RSAKey demoKey() throws Exception { var generator=KeyPairGenerator.getInstance("RSA"); generator.initialize(2048); var pair=generator.generateKeyPair(); return new RSAKey.Builder((RSAPublicKey)pair.getPublic()).privateKey((RSAPrivateKey)pair.getPrivate()).keyID("demo").build(); }
  @Bean JwtEncoder demoEncoder(RSAKey key) { return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(key))); }
  @Bean JwtDecoder demoDecoder(RSAKey key) throws Exception { var d=NimbusJwtDecoder.withPublicKey(key.toRSAPublicKey()).build(); d.setJwtValidator(JwtValidators.createDefaultWithIssuer("cabana-demo")); return d; }
}
