package pe.cabana.api;
import jakarta.validation.constraints.*;
import pe.cabana.model.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
public class Dtos {
  /** Enlace de YouTube: youtube.com/watch?v=ID, youtu.be/ID o youtube.com/embed/ID (ID de 11 caracteres). */
  public static final String YOUTUBE="^$|https://(www\\.)?(youtube\\.com/(watch\\?v=|embed/)|youtu\\.be/)[A-Za-z0-9_-]{11}([?&].*)?";

  // ----- Catálogo -----
  public record AdminContentView(UUID id,String title,String description,String type,int releaseYear,int durationMinutes,int seasons,String genre,String imageUrl,String videoPath,boolean featured,String ageRating,String trailerUrl) {
    public static AdminContentView of(Content c){return new AdminContentView(c.id,c.title,c.description,c.type,c.releaseYear,c.durationMinutes,c.seasons,c.genre.getName(),c.imageUrl,c.videoPath,c.featured,c.ageRating,c.trailerUrl);}
  }
  public record ContentView(UUID id,String title,String description,String type,int releaseYear,int durationMinutes,int seasons,String genre,String imageUrl,boolean featured,String ageRating,String trailerUrl) {
    public static ContentView of(Content c) { return new ContentView(c.id,c.title,c.description,c.type,c.releaseYear,c.durationMinutes,c.seasons,c.genre.getName(),c.imageUrl,c.featured,c.ageRating,c.trailerUrl); }
  }
  public record ContentInput(@NotBlank @Size(max=150) String title,@NotBlank @Size(max=2000) String description,@Pattern(regexp="MOVIE|SERIES") @NotNull String type,@Min(1888) @Max(2100) int releaseYear,@Min(1) @Max(1500) int durationMinutes,@Min(0) @Max(100) int seasons,@NotBlank @Size(max=30) String genre,@NotBlank @Size(max=1000) String imageUrl,@Size(max=1000) String videoPath,boolean featured,@Pattern(regexp="ATP|7\\+|13\\+|16\\+|18\\+") @NotNull String ageRating,
    @Size(max=300) @Pattern(regexp=YOUTUBE,message="usa un enlace de YouTube") String trailerUrl) {}
  public record EpisodeView(UUID id,int season,int number,String title,String description,int durationMinutes) {
    public static EpisodeView of(Episode e){return new EpisodeView(e.id,e.season,e.number,e.title,e.description,e.durationMinutes);}
  }
  public record EpisodeInput(@Min(1) @Max(100) int season,@Min(1) @Max(500) int number,@NotBlank @Size(max=150) String title,@Size(max=1000) String description,@Min(1) @Max(600) int durationMinutes) {}

  // ----- Cuenta y autenticación -----
  public record Credentials(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password) {}
  public record Registration(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password,@NotBlank @Size(max=80) String name) {}
  public record ForgotInput(@NotBlank @Email @Size(max=254) String email) {}
  public record ResetInput(@NotBlank @Size(min=8,max=72) String password) {}
  public record PasswordChange(@NotBlank @Size(max=72) String currentPassword,@NotBlank @Size(min=8,max=72) String newPassword) {}
  public record NameInput(@NotBlank @Size(max=80) String name) {}
  public record Profile(UUID id,String email,String name,String role) { public static Profile of(Account a) { return new Profile(a.id,a.email,a.name,a.role); } }
  public record ProfileStats(long saved,long watched,long reviews) {}

  // ----- Usuario -----
  /** total es opcional: la duración de lo reproducido en segundos. */
  public record Position(@Min(0) @Max(86400) long seconds,@Min(1) @Max(86400) Integer total) {}
  public record ProgressView(ContentView content,long seconds,Integer totalSeconds,Instant updatedAt) {
    public static ProgressView of(WatchProgress p){return new ProgressView(ContentView.of(p.content),p.seconds,p.totalSeconds,p.updatedAt);}
  }
  public record Recommendation(ContentView content,String reason) {}

  // ----- Reseñas -----
  public record ReviewInput(@Min(1) @Max(5) int rating,@Size(max=500) String comment) {}
  public record ReviewView(UUID id,String author,int rating,String comment,Instant createdAt,boolean mine) {
    public static ReviewView of(Review r,UUID viewer){return new ReviewView(r.id,r.account.name,r.rating,r.comment,r.createdAt,r.account.id.equals(viewer));}
  }
  public record MyReviewView(UUID id,ContentView content,int rating,String comment,Instant createdAt) {
    public static MyReviewView of(Review r){return new MyReviewView(r.id,ContentView.of(r.content),r.rating,r.comment,r.createdAt);}
  }
  public record ReviewSummary(double average,long count,List<ReviewView> reviews) {}
  public record RatingView(UUID contentId,double average,long count) {}
  public record AdminReviewView(UUID id,UUID contentId,String contentTitle,String author,String email,int rating,String comment,Instant createdAt) {
    public static AdminReviewView of(Review r){return new AdminReviewView(r.id,r.content.id,r.content.title,r.account.name,r.account.email,r.rating,r.comment,r.createdAt);}
  }

  // ----- Panel ADMIN -----
  public record GenreCount(String genre,long count) {}
  public record TopRated(UUID contentId,String title,double average,long count) {}
  public record AdminStats(long movies,long series,long genres,long users,long reviews,long savedItems,List<GenreCount> byGenre,List<TopRated> topRated) {}
  public record UserAdminView(UUID id,String email,String name,String role,long saved,long watched,long reviews) {}
  public record RoleInput(@NotNull @Pattern(regexp="USER|ADMIN") String role) {}
}
