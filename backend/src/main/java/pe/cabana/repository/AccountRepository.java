package pe.cabana.repository;
import pe.cabana.model.Account;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AccountRepository extends JpaRepository<Account,UUID> { Optional<Account> findByEmail(String email); }
