package pe.cabana.model;
import jakarta.persistence.*;
@Entity @Table(name="accounts")
public class Account {
  @Id public java.util.UUID id;
  @Column(nullable=false,unique=true,length=254) public String email;
  @Column(nullable=false,length=80) public String name;
  @Column(nullable=false,length=10) public String role="USER";
  @Column(length=100) public String passwordHash;
}
