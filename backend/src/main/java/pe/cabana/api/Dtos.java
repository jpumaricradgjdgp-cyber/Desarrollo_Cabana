package pe.cabana.api;
import jakarta.validation.constraints.*;
import pe.cabana.model.*;
import java.util.UUID;
public class Dtos {
  public record AdminContentView(UUID id,String title,String description,String type,int releaseYear,int durationMinutes,int seasons,String genre,String imageUrl,String videoPath,boolean featured,String ageRating) {
    public static AdminContentView of(Content c){return new AdminContentView(c.id,c.title,c.description,c.type,c.releaseYear,c.durationMinutes,c.seasons,c.genre.getName(),c.imageUrl,c.videoPath,c.featured,c.ageRating);}
  }
  public record Credentials(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password) {}
  public record Registration(@NotBlank @Email @Size(max=254) String email,@NotBlank @Size(min=8,max=72) String password,@NotBlank @Size(max=80) String name) {}
  public record Profile(UUID id,String email,String name,String role) { public static Profile of(Account a) { return new Profile(a.id,a.email,a.name,a.role); } }
  public record ContentView(UUID id,String title,String description,String type,int releaseYear,int durationMinutes,int seasons,String genre,String imageUrl,boolean featured,String ageRating) {
    public static ContentView of(Content c) { return new ContentView(c.id,c.title,c.description,c.type,c.releaseYear,c.durationMinutes,c.seasons,c.genre.getName(),c.imageUrl,c.featured,c.ageRating); }
  }
  public record ContentInput(@NotBlank @Size(max=150) String title,@NotBlank @Size(max=2000) String description,@Pattern(regexp="MOVIE|SERIES") @NotNull String type,@Min(1888) @Max(2100) int releaseYear,@Min(1) @Max(1500) int durationMinutes,@Min(0) @Max(100) int seasons,@NotBlank @Size(max=30) String genre,@NotBlank @Size(max=1000) String imageUrl,@Size(max=1000) String videoPath,boolean featured,@Pattern(regexp="ATP|7\\+|13\\+|16\\+|18\\+") @NotNull String ageRating) {}
  public record Position(@Min(0) @Max(86400) long seconds) {}
  public record ProgressView(ContentView content,long seconds) {}
  public record ReviewInput(@Min(1) @Max(5) int rating,@Size(max=500) String comment) {}
  public record ReviewView(UUID id,String author,int rating,String comment,java.time.Instant createdAt,boolean mine) {
    public static ReviewView of(Review r,UUID viewer){return new ReviewView(r.id,r.account.name,r.rating,r.comment,r.createdAt,r.account.id.equals(viewer));}
  }
  public record ReviewSummary(double average,long count,java.util.List<ReviewView> reviews) {}
  public record RatingView(UUID contentId,double average,long count) {}
  public record AdminReviewView(UUID id,UUID contentId,String contentTitle,String author,String email,int rating,String comment,java.time.Instant createdAt) {
    public static AdminReviewView of(Review r){return new AdminReviewView(r.id,r.content.id,r.content.title,r.account.name,r.account.email,r.rating,r.comment,r.createdAt);}
  }
  public record GenreCount(String genre,long count) {}
  public record TopRated(UUID contentId,String title,double average,long count) {}
  public record AdminStats(long movies,long series,long genres,long users,long reviews,long savedItems,java.util.List<GenreCount> byGenre,java.util.List<TopRated> topRated) {}
}
