package pe.cabana.api;
import jakarta.validation.constraints.*;
import pe.cabana.model.*;
import java.util.UUID;
public class Dtos {
  public record Credentials(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password) {}
  public record Registration(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password,@NotBlank @Size(max=80) String name) {}
  public record Profile(UUID id,String email,String name,String role) { public static Profile of(Account a) { return new Profile(a.id,a.email,a.name,a.role); } }
  public record ContentView(UUID id,String title,String description,String type,int releaseYear,int durationMinutes,int seasons,String genre,String imageUrl,boolean featured,String ageRating) {
    public static ContentView of(Content c) { return new ContentView(c.id,c.title,c.description,c.type,c.releaseYear,c.durationMinutes,c.seasons,c.genre,c.imageUrl,c.featured,c.ageRating); }
  }
  public record ContentInput(@NotBlank @Size(max=150) String title,@NotBlank @Size(max=2000) String description,@Pattern(regexp="MOVIE|SERIES") @NotNull String type,@Min(1888) @Max(2100) int releaseYear,@Min(1) @Max(1500) int durationMinutes,@Min(0) @Max(100) int seasons,@NotBlank @Size(max=30) String genre,@NotBlank @Size(max=1000) String imageUrl,@Size(max=1000) String videoPath,boolean featured,@Pattern(regexp="ATP|7\\+|13\\+|16\\+|18\\+") @NotNull String ageRating) {}
  public record Position(@Min(0) @Max(86400) long seconds) {}
  public record ProgressView(ContentView content,long seconds) {}
}
