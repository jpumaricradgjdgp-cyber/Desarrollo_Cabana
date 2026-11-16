package pe.cabana.service;
import pe.cabana.api.Dtos.*;
import pe.cabana.model.Account;
import pe.cabana.repository.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
/** Datos de la cuenta del usuario y gestión de roles para el ADMIN. */
@Service @Transactional(readOnly=true)
public class AccountService {
  private final AccountRepository accounts; private final SavedRepository saved; private final ProgressRepository progress; private final ReviewRepository reviews;
  public AccountService(AccountRepository a,SavedRepository s,ProgressRepository p,ReviewRepository r){accounts=a;saved=s;progress=p;reviews=r;}

  public ProfileStats stats(UUID user){return new ProfileStats(saved.countByUserId(user),progress.countByUserId(user),reviews.countByAccountId(user));}

  public List<MyReviewView> myReviews(UUID user){return reviews.findByAccountIdOrderByCreatedAtDesc(user).stream().map(MyReviewView::of).toList();}

  public List<UserAdminView> users(){
    return accounts.findAll().stream()
      .sorted(Comparator.comparing((Account a)->!"ADMIN".equals(a.role)).thenComparing(a->a.name.toLowerCase(Locale.ROOT)))
      .map(a->new UserAdminView(a.id,a.email,a.name,a.role,saved.countByUserId(a.id),progress.countByUserId(a.id),reviews.countByAccountId(a.id)))
      .toList();
  }

  /** Cambia el rol USER ↔ ADMIN. Un administrador no puede quitarse su propio rol (evita quedarse sin acceso). */
  @Transactional public UserAdminView changeRole(UUID actor,UUID target,String role){
    if(actor.equals(target)) throw new ResponseStatusException(HttpStatus.CONFLICT,"No puedes cambiar tu propio rol. Pídeselo a otro administrador.");
    var a=accounts.findById(target).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado"));
    a.role=role; accounts.save(a);
    return new UserAdminView(a.id,a.email,a.name,a.role,saved.countByUserId(a.id),progress.countByUserId(a.id),reviews.countByAccountId(a.id));
  }
}
