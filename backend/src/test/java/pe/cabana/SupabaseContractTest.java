package pe.cabana;
import java.util.*;
import java.time.Instant;
import java.net.InetSocketAddress;
import com.sun.net.httpserver.HttpServer;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.gen.ECKeyGenerator;
import com.nimbusds.jwt.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import pe.cabana.repository.*;
import pe.cabana.model.Content;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:contract;MODE=PostgreSQL;DB_CLOSE_DELAY=-1","spring.datasource.username=sa","spring.datasource.password=","spring.datasource.driver-class-name=org.h2.Driver","spring.jpa.hibernate.ddl-auto=create-drop","spring.jpa.properties.hibernate.default_schema=PUBLIC","cabana.secure-cookies=false","cabana.supabase-key=test-public-key","cabana.storage-key=test-server-key"})
@AutoConfigureMockMvc @ActiveProfiles("supabase")
class SupabaseContractTest {
  static HttpServer server;
  static ECKey signingKey;
  static String base,token;
  static volatile Map<String,String> imageHeaders;
  static volatile byte[] imageBody;
  static final UUID USER=UUID.fromString("30000000-0000-0000-0000-000000000001");
  static {
    try {
      signingKey=new ECKeyGenerator(Curve.P_256).keyID("test-key").generate();
      server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
      base="http://127.0.0.1:"+server.getAddress().getPort();
      token=sign(base+"/auth/v1","authenticated");
      server.createContext("/",exchange->{
        String path=exchange.getRequestURI().getPath();
        String response=path.endsWith("jwks.json")?new JWKSet(signingKey.toPublicJWK()).toString():path.endsWith("signup")?"{\"user\":{\"id\":\""+USER+"\"}}":path.startsWith("/storage/")?"{\"signedURL\":\"/object/sign/videos/peliculas/prueba.mp4?token=test\"}":"{\"access_token\":\""+token+"\",\"refresh_token\":\"test-refresh\",\"expires_in\":3600}";
        byte[] received=exchange.getRequestBody().readAllBytes();
        if(path.startsWith("/storage/v1/object/portadas/")) {
          imageBody=received;imageHeaders=Map.of("path",path,"apikey",exchange.getRequestHeaders().getFirst("apikey"),"authorization",exchange.getRequestHeaders().getFirst("Authorization"),"type",exchange.getRequestHeaders().getFirst("Content-Type"),"upsert",exchange.getRequestHeaders().getFirst("x-upsert"));
        }
        exchange.getResponseHeaders().set("Content-Type","application/json");byte[] bytes=response.getBytes(java.nio.charset.StandardCharsets.UTF_8);exchange.sendResponseHeaders(200,bytes.length);exchange.getResponseBody().write(bytes);exchange.close();
      });server.start();
    }catch(Exception e){throw new ExceptionInInitializerError(e);}
  }
  static String sign(String issuer,String audience) throws Exception {
    var claims=new JWTClaimsSet.Builder().issuer(issuer).subject(USER.toString()).audience(audience).issueTime(Date.from(Instant.now())).expirationTime(Date.from(Instant.now().plusSeconds(3600))).claim("email","contract@example.test").claim("user_metadata",Map.of("name","Contrato","role","ADMIN")).build();
    var jwt=new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.ES256).keyID("test-key").build(),claims);jwt.sign(new ECDSASigner(signingKey));return jwt.serialize();
  }
  @DynamicPropertySource static void properties(DynamicPropertyRegistry registry){registry.add("cabana.supabase-url",()->base);}
  @Autowired MockMvc mvc;@Autowired JwtDecoder decoder;@Autowired AccountRepository accounts;@Autowired ContentRepository contents;
  @AfterAll static void stop(){server.stop(0);}
  @Test void asymmetricJwtValidatesIssuerAndAudience() throws Exception {
    assertThat(decoder.decode(token).getSubject()).isEqualTo(USER.toString());
    assertThatThrownBy(()->decoder.decode(sign(base+"/auth/v1","other"))).isInstanceOf(org.springframework.security.oauth2.jwt.JwtException.class);
    assertThatThrownBy(()->decoder.decode(sign("https://other.test/auth/v1","authenticated"))).isInstanceOf(org.springframework.security.oauth2.jwt.JwtException.class);
  }
  @Test void loginAndEmailConfirmationUseSupabaseContract() throws Exception {
    mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"contract@example.test\",\"password\":\"Password123!\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").value(token)).andExpect(header().string("Set-Cookie",org.hamcrest.Matchers.containsString("HttpOnly")));
    mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"contract@example.test\",\"password\":\"Password123!\",\"name\":\"Contrato\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isEmpty()).andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("confirmar")));
    mvc.perform(post("/api/auth/refresh").cookie(new jakarta.servlet.http.Cookie("cabana_refresh","test-refresh"))).andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").value(token));
  }
  @Test void rolesComeFromDatabaseAndStorageUrlsAreSigned() throws Exception {
    accounts.findById(USER).ifPresent(a->{a.role="USER";accounts.save(a);});
    mvc.perform(get("/api/config")).andExpect(status().isOk()).andExpect(jsonPath("$.demo").value(false));
    mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("USER"));
    mvc.perform(get("/api/admin/catalog").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
    var a=accounts.findById(USER).orElseThrow();a.role="ADMIN";accounts.save(a);
    mvc.perform(get("/api/admin/catalog").header("Authorization","Bearer "+token)).andExpect(status().isOk());
    var c=new Content();c.title="Contrato Storage";c.description="Prueba";c.type="MOVIE";c.releaseYear=2026;c.durationMinutes=90;c.seasons=0;c.genre="Drama";c.imageUrl="/assets/dark.jpg";c.videoPath="peliculas/prueba.mp4";c.ageRating="13+";contents.save(c);
    mvc.perform(get("/api/playback/"+c.id).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.demo").value(false)).andExpect(jsonPath("$.url").value(base+"/storage/v1/object/sign/videos/peliculas/prueba.mp4?token=test"));
  }
  @Test void coverUploadUsesCallerJwtAndPublicKeyRatherThanServerSecret() throws Exception {
    mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isOk());
    var a=accounts.findById(USER).orElseThrow();a.role="ADMIN";accounts.save(a);
    var file=new org.springframework.mock.web.MockMultipartFile("file","cover.png","image/png",CabanaIntegrationTest.raster("png",12,8));
    mvc.perform(multipart("/api/admin/images").file(file).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.imageUrl").value(org.hamcrest.Matchers.startsWith(base+"/storage/v1/object/public/portadas/"+USER+"/")));
    assertThat(imageHeaders.get("apikey")).isEqualTo("test-public-key");
    assertThat(imageHeaders.get("authorization")).isEqualTo("Bearer "+token);
    assertThat(imageHeaders.get("type")).isEqualTo("image/png");
    assertThat(imageHeaders.get("upsert")).isEqualTo("false");
    assertThat(imageHeaders.get("path")).startsWith("/storage/v1/object/portadas/"+USER+"/");
    assertThat(javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(imageBody)).getWidth()).isEqualTo(12);
  }
}
