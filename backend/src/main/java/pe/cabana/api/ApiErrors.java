package pe.cabana.api;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import org.springframework.dao.DataIntegrityViolationException;
@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class) ResponseEntity<?> uploadSize(){return ResponseEntity.status(413).body(Map.of("message","La portada debe pesar como máximo 5 MB."));}
  @ExceptionHandler(org.springframework.web.multipart.support.MissingServletRequestPartException.class) ResponseEntity<?> missingFile(){return ResponseEntity.badRequest().body(Map.of("message","Selecciona una imagen para subir."));}
  @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> response(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"No se pudo completar la operación":e.getReason()));}
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("message","Revisa los datos del formulario","fields",e.getBindingResult().getFieldErrors().stream().map(f->f.getField()+": "+f.getDefaultMessage()).toList()));}
  @ExceptionHandler({org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,org.springframework.http.converter.HttpMessageNotReadableException.class}) ResponseEntity<?> invalid(){return ResponseEntity.badRequest().body(Map.of("message","La solicitud contiene datos no válidos"));}
  @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict(){return ResponseEntity.status(409).body(Map.of("message","El registro ya existe o tiene datos relacionados"));}
}
