package pe.cabana.service;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import javax.imageio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageService {
  public static final long MAX_BYTES=5*1024*1024;
  public record Image(byte[] bytes,String type,String extension) {}
  public record Upload(String imageUrl) {}
  private final boolean demo;
  private final String url,key;
  private final RestClient client;
  private final Map<String,Image> demoImages=new ConcurrentHashMap<>();

  public ImageService(@Value("${cabana.demo}") boolean demo,@Value("${cabana.supabase-url:}") String url,@Value("${cabana.supabase-key:}") String key) {
    this.demo=demo;this.url=url;this.key=key;
    var factory=new SimpleClientHttpRequestFactory();factory.setConnectTimeout(10000);factory.setReadTimeout(30000);
    client=RestClient.builder().requestFactory(factory).build();
  }

  public Upload upload(MultipartFile file,Jwt jwt) {
    Image image=validate(file);
    String filename=UUID.randomUUID()+"."+image.extension();
    if(demo) {
      if(demoImages.size()>=100)throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"La demostración llegó al límite de portadas. Reinicia para continuar.");
      demoImages.put(filename,image);
      return new Upload("/assets/uploads/"+filename);
    }
    String path=jwt.getSubject()+"/"+filename;
    try {
      client.post().uri(url+"/storage/v1/object/portadas/"+path)
        .header("apikey",key).header("Authorization","Bearer "+jwt.getTokenValue())
        .header("x-upsert","false").contentType(MediaType.parseMediaType(image.type()))
        .body(image.bytes()).retrieve().toBodilessEntity();
      return new Upload(url+"/storage/v1/object/public/portadas/"+path);
    } catch(RestClientResponseException e) {
      if(e.getStatusCode().value()==401)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Tu sesión expiró. Vuelve a iniciar sesión.");
      if(e.getStatusCode().value()==429)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Espera un momento antes de volver a subir la portada.");
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo guardar la portada en Supabase. Inténtalo de nuevo.");
    } catch(RestClientException e) {throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"No se pudo conectar para subir la portada. Inténtalo de nuevo.");}
  }

  public Image demoImage(String filename) {
    Image image=demoImages.get(filename);
    if(!demo || image==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Portada no encontrada");
    return image;
  }

  // Decode and encode the raster image, rather than trusting its filename or MIME header.
  private Image validate(MultipartFile file) {
    if(file.isEmpty())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecciona una imagen JPG o PNG.");
    if(file.getSize()>MAX_BYTES)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"La portada debe pesar como máximo 5 MB.");
    try(var stream=ImageIO.createImageInputStream(new ByteArrayInputStream(file.getBytes()))) {
      var readers=ImageIO.getImageReaders(stream);
      if(!readers.hasNext())throw unsupported();
      var reader=readers.next();
      try {
        reader.setInput(stream,true,true);
        String format=reader.getFormatName().toLowerCase(Locale.ROOT);
        if(!Set.of("png","jpeg","jpg").contains(format))throw unsupported();
        int w=reader.getWidth(0),h=reader.getHeight(0);
        if(w<=0 || h<=0 || w>6000 || h>6000 || (long)w*h>24000000)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La imagen es demasiado grande. Usa una portada de hasta 6000 px y 24 megapíxeles.");
        BufferedImage source=reader.read(0);
        double scale=Math.min(1,1920.0/Math.max(w,h));
        boolean png=format.equals("png");
        var clean=new BufferedImage(Math.max(1,(int)(w*scale)),Math.max(1,(int)(h*scale)),png?BufferedImage.TYPE_INT_ARGB:BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics=clean.createGraphics();
        try {graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BICUBIC);graphics.drawImage(source,0,0,clean.getWidth(),clean.getHeight(),null);}finally{graphics.dispose();}
        var output=new ByteArrayOutputStream();
        ImageIO.write(clean,png?"png":"jpeg",output);
        if(output.size()>MAX_BYTES)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"La portada debe pesar como máximo 5 MB.");
        return new Image(output.toByteArray(),png?"image/png":"image/jpeg",png?"png":"jpg");
      } finally {reader.dispose();}
    } catch(IOException|IllegalArgumentException e) {throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No se pudo leer la imagen. Prueba con otro archivo JPG o PNG.");}
  }
  private ResponseStatusException unsupported(){return new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Solo se permiten imágenes JPG o PNG.");}
}
