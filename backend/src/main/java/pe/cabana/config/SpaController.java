package pe.cabana.config;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
/** Devuelve la aplicación Angular cuando el navegador abre directamente una ruta del cliente. */
@Controller
public class SpaController {
  @GetMapping({"/inicio","/peliculas","/series","/generos","/mi-lista","/buscar","/login","/registro",
    "/recuperar","/restablecer","/perfil","/historial",
    "/titulo/**","/ver/**","/admin","/admin/**"})
  public String index(){return "forward:/index.html";}
}
