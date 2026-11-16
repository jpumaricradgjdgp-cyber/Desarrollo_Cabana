package pe.cabana.model;
import jakarta.persistence.*;
import java.util.UUID;
/** Capítulo de una serie. La combinación serie + temporada + número es única. */
@Entity @Table(name="episodes",uniqueConstraints=@UniqueConstraint(columnNames={"content_id","season","number"}))
public class Episode {
  @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
  @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="content_id",nullable=false) public Content content;
  @Column(nullable=false) public int season;
  @Column(nullable=false) public int number;
  @Column(nullable=false,length=150) public String title;
  @Column(length=1000) public String description;
  @Column(name="duration_minutes",nullable=false) public int durationMinutes;
}
