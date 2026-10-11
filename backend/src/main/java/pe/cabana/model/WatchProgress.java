package pe.cabana.model;
import jakarta.persistence.*;
@Entity @Table(name="watch_progress",uniqueConstraints=@UniqueConstraint(columnNames={"user_id","content_id"}))
public class WatchProgress {
  @Id @GeneratedValue(strategy=GenerationType.UUID) public java.util.UUID id;
  @Column(name="user_id",nullable=false) public java.util.UUID userId;
  @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="content_id") public Content content;
  @Column(nullable=false) public long seconds;
}
