package pe.cabana.model;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="genres")
public class Genre {
 @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
 @Column(nullable=false,unique=true,length=30) public String name;
 public String getName(){return name;}
}
