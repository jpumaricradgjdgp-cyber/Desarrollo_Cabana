package pe.cabana.model;
import jakarta.persistence.*;
@Entity @Table(name="contents")
public class Content {
  @Id @GeneratedValue(strategy=GenerationType.UUID) public java.util.UUID id;
  @Column(nullable=false,length=150) public String title;
  @Column(nullable=false,length=2000) public String description;
  @Column(nullable=false,length=10) public String type;
  @Column(nullable=false) public int releaseYear;
  @Column(nullable=false) public int durationMinutes;
  @Column(nullable=false) public int seasons;
  @ManyToOne(optional=false,fetch=FetchType.LAZY)
  @JoinColumn(name="genre_id",nullable=false) public Genre genre;
  @Column(nullable=false,length=1000) public String imageUrl;
  @Column(length=1000) public String videoPath;
  @Column(nullable=false) public boolean featured;
  @Column(nullable=false,length=10) public String ageRating;
  @Column(name="trailer_url",length=300) public String trailerUrl;
}
