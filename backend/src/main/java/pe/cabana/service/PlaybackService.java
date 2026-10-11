package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@Service
public class PlaybackService {
  private final CatalogService catalog; private final boolean demo; private final String url,key;
  public PlaybackService(CatalogService c,@Value("${cabana.demo}") boolean demo,@Value("${cabana.supabase-url:}") String url,@Value("${cabana.storage-key:}") String key){catalog=c;this.demo=demo;this.url=url;this.key=key;}
  public record Playback(String url,boolean demo,String message) {}
  @SuppressWarnings("unchecked") public Playback play(UUID id){
    var content=catalog.require(id);
    if(demo) return new Playback("https://media.w3.org/2010/05/bunny/trailer.mp4",true,"Video de demostración: tráiler de Big Buck Bunny (2008), Blender Foundation, CC BY 3.0 · bigbuckbunny.org. No corresponde al título seleccionado.");
    if(content.videoPath==null || content.videoPath.isBlank()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Todavía no hay un video disponible para este título");
    if(key.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Falta configurar el acceso al almacenamiento de videos");
    try {
      var result=RestClient.create().post().uri(url+"/storage/v1/object/sign/videos/"+content.videoPath).header("apikey",key).header("Authorization","Bearer "+key).body(Map.of("expiresIn",7200)).retrieve().body(Map.class);
      if(result==null || !(result.get("signedURL") instanceof String path)) throw new RestClientException("Sin URL");
      return new Playback(url+"/storage/v1"+path,false,"Enlace de reproducción válido durante 2 horas");
    }catch(RestClientException e){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo abrir el video en Supabase Storage");}
  }
}
