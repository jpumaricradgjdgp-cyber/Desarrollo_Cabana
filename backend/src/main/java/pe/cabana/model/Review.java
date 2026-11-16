package pe.cabana.model;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
/** Reseña de un usuario: calificación de 1 a 5 y comentario opcional. Una por usuario y contenido. */
@Entity @Table(name="reviews",uniqueConstraints=@UniqueConstraint(columnNames={"user_id","content_id"}))
public class Review {
  @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
  @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) public Account account;
  @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="content_id",nullable=false) public Content content;
  @Column(nullable=false) public int rating;
  @Column(length=500) public String comment;
  @Column(name="created_at",nullable=false) public Instant createdAt;
}
