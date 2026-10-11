package pe.cabana.api;

import java.util.concurrent.TimeUnit;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.cabana.service.ImageService;

@RestController
public class ImageController {
  private final ImageService images;
  public ImageController(ImageService images){this.images=images;}
  @PostMapping(value="/api/admin/images",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
  ImageService.Upload upload(@RequestParam("file") MultipartFile file,@AuthenticationPrincipal Jwt jwt){return images.upload(file,jwt);}
  @GetMapping("/assets/uploads/{filename}")
  ResponseEntity<byte[]> image(@PathVariable String filename) {
    var image=images.demoImage(filename);
    return ResponseEntity.ok().contentType(MediaType.parseMediaType(image.type()))
      .header("X-Content-Type-Options","nosniff").cacheControl(CacheControl.maxAge(1,TimeUnit.DAYS)).body(image.bytes());
  }
}
