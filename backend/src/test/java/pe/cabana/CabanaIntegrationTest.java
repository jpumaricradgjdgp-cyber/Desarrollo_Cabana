package pe.cabana;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import jakarta.servlet.http.Cookie;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("demo")
class CabanaIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  private String register(String name) throws Exception {
    return json.readTree(mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\""+name+"@example.test\",\"password\":\"Password123!\",\"name\":\""+name+"\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText();
  }
  private String admin() throws Exception {return json.readTree(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@cabana.demo\",\"password\":\"Cabana2026!\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText();}
  private String contentId() throws Exception {return json.readTree(mvc.perform(get("/api/catalog")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get(0).get("id").asText();}
  @Test void publicCatalogUsesJpqlFiltersAndHidesVideoPaths() throws Exception {
    mvc.perform(get("/api/catalog").param("q","dark").param("type","SERIES")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].title").value("Dark")).andExpect(jsonPath("$[0].videoPath").doesNotExist());
    mvc.perform(get("/api/catalog").param("genre","Romance")).andExpect(status().isOk()).andExpect(jsonPath("$[0].title").value("La La Land"));
    mvc.perform(get("/api/genres")).andExpect(status().isOk());
  }
  @Test void anonymousAndForgedTokensCannotAccessPrivateEndpoints() throws Exception {
    mvc.perform(get("/api/me/list")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/admin/catalog")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/me/list").header("Authorization","Bearer forged.token.here")).andExpect(status().isUnauthorized());
  }
  @Test void registeredUsersCannotBecomeAdministrators() throws Exception {
    String token=register("viewer");
    mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("USER"));
    mvc.perform(get("/api/admin/catalog").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
  }
  @Test void savedListAndProgressAreIsolatedByUser() throws Exception {
    String first=register("first"),second=register("second"),id=contentId();
    mvc.perform(put("/api/me/list/"+id).header("Authorization","Bearer "+first)).andExpect(status().isOk());
    mvc.perform(put("/api/me/list/"+id).header("Authorization","Bearer "+first)).andExpect(status().isOk());
    mvc.perform(get("/api/me/list").header("Authorization","Bearer "+first)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    mvc.perform(get("/api/me/list").header("Authorization","Bearer "+second)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    mvc.perform(put("/api/me/progress/"+id).header("Authorization","Bearer "+first).contentType(MediaType.APPLICATION_JSON).content("{\"seconds\":42}")).andExpect(status().isOk());
    mvc.perform(get("/api/me/progress").header("Authorization","Bearer "+first)).andExpect(status().isOk()).andExpect(jsonPath("$[0].seconds").value(42));
    mvc.perform(get("/api/me/progress").header("Authorization","Bearer "+second)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    mvc.perform(delete("/api/me/list/"+id).header("Authorization","Bearer "+first)).andExpect(status().isOk());
    mvc.perform(get("/api/me/list").header("Authorization","Bearer "+first)).andExpect(jsonPath("$.length()").value(0));
  }
  @Test void adminCrudIsTransactionalAndValidatesUrls() throws Exception {
    String token=admin();
    String input="{\"title\":\"Prueba CRUD\",\"description\":\"Contenido de prueba\",\"type\":\"MOVIE\",\"releaseYear\":2026,\"durationMinutes\":90,\"seasons\":0,\"genre\":\"Drama\",\"imageUrl\":\"/assets/dark.jpg\",\"videoPath\":\"peliculas/test.mp4\",\"featured\":false,\"ageRating\":\"13+\"}";
    var created=mvc.perform(post("/api/admin/catalog").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(input)).andExpect(status().isOk()).andReturn();
    String id=json.readTree(created.getResponse().getContentAsString()).get("id").asText();
    mvc.perform(put("/api/admin/catalog/"+id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(input.replace("Prueba CRUD","Actualizado"))).andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Actualizado"));
    mvc.perform(put("/api/admin/catalog/"+id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(input.replace("/assets/dark.jpg","javascript:alert(1)"))).andExpect(status().isBadRequest());
    mvc.perform(put("/api/me/list/"+id).header("Authorization","Bearer "+token)).andExpect(status().isOk());
    mvc.perform(put("/api/me/progress/"+id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content("{\"seconds\":5}")).andExpect(status().isOk());
    mvc.perform(delete("/api/admin/catalog/"+id).header("Authorization","Bearer "+token)).andExpect(status().isOk());
    mvc.perform(get("/api/catalog/"+id)).andExpect(status().isNotFound());
    mvc.perform(get("/api/me/list").header("Authorization","Bearer "+token)).andExpect(jsonPath("$.length()").value(0));
  }
  @Test void refreshCookieIsHttpOnlyAndRejectsOtherOrigins() throws Exception {
    var response=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@cabana.demo\",\"password\":\"Cabana2026!\"}")).andExpect(status().isOk()).andReturn().getResponse();
    assertThat(response.getHeader("Set-Cookie")).contains("HttpOnly","SameSite=Lax");
    String token=json.readTree(response.getContentAsString()).get("accessToken").asText();
    mvc.perform(post("/api/auth/refresh").cookie(new Cookie("cabana_refresh",token))).andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty());
    mvc.perform(post("/api/auth/refresh").header("Origin","https://attacker.test").cookie(new Cookie("cabana_refresh",token))).andExpect(status().isForbidden());
    mvc.perform(post("/api/auth/logout")).andExpect(status().isOk()).andExpect(header().string("Set-Cookie",org.hamcrest.Matchers.containsString("Max-Age=0")));
  }
  @Test void validatesRegistrationAndProgressAndLabelsDemoPlayback() throws Exception {
    mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"invalid\",\"password\":\"x\",\"name\":\"\"}")).andExpect(status().isBadRequest());
    String token=register("player"),id=contentId();
    mvc.perform(put("/api/me/progress/"+id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content("{\"seconds\":-1}")).andExpect(status().isBadRequest());
    mvc.perform(get("/api/playback/"+id).header("Authorization","Bearer "+token)).andExpect(status().isOk()).andExpect(jsonPath("$.demo").value(true));
  }
}
