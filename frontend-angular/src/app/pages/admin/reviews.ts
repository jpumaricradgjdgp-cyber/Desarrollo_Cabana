import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { LibraryService } from '../../core/library.service';
import { AdminReview } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/toast.service';
import { Icon } from '../../shared/icon';
import { RatingStars } from '../../shared/rating-stars';

/** Moderación de reseñas: filtrar por texto o estrellas y eliminar las inapropiadas. */
@Component({
  selector: 'app-admin-reviews',
  imports: [DatePipe, RouterLink, Icon, RatingStars],
  template: `
    <div class="toolbar">
      <label class="search">
        <app-icon name="search" [size]="18" /><span class="sr-only">Filtrar</span>
        <input class="input" placeholder="Buscar por título, autor o comentario" [value]="q()" (input)="q.set($any($event.target).value)" />
      </label>
      <select class="select" [value]="stars()" (change)="stars.set(+$any($event.target).value)" aria-label="Filtrar por estrellas">
        <option value="0">Todas las estrellas</option>
        @for (n of [5, 4, 3, 2, 1]; track n) { <option [value]="n">{{ n }} {{ n === 1 ? 'estrella' : 'estrellas' }}</option> }
      </select>
    </div>
    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>Título</th><th>Autor</th><th>Calificación</th><th>Comentario</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          @for (r of filtered(); track r.id) {
            <tr>
              <td><a class="link" [routerLink]="['/titulo', r.contentId]">{{ r.contentTitle }}</a></td>
              <td><strong>{{ r.author }}</strong><br /><small class="hint">{{ r.email }}</small></td>
              <td><app-rating-stars [value]="r.rating" [size]="13" /></td>
              <td class="comment">{{ r.comment || '—' }}</td>
              <td class="nowrap">{{ r.createdAt | date: 'd MMM y, HH:mm' }}</td>
              <td><button class="icon-btn" type="button" aria-label="Eliminar reseña" (click)="remove(r)"><app-icon name="trash" [size]="17" /></button></td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty-row">{{ loading() ? 'Cargando…' : 'No hay reseñas con esos filtros.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
    .search { position: relative; flex: 1 1 280px; }
    .search app-icon { position: absolute; left: 12px; top: 12px; color: var(--muted); }
    .search .input { padding-left: 40px; background: var(--surface); }
    .toolbar .select { width: auto; background: var(--surface); }
    .comment { max-width: 340px; color: var(--muted); }
    .nowrap { white-space: nowrap; color: var(--muted); }
    .link { color: var(--accent-hover); font-weight: 600; }
    .empty-row { text-align: center; color: var(--muted); padding: 40px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsPage {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly library = inject(LibraryService);
  protected readonly items = signal<AdminReview[]>([]);
  protected readonly loading = signal(true);
  protected readonly q = signal('');
  protected readonly stars = signal(0);
  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.items().filter(
      (r) =>
        (!this.stars() || r.rating === this.stars()) &&
        (!q || [r.contentTitle, r.author, r.email, r.comment ?? ''].some((t) => t.toLowerCase().includes(q))),
    );
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      this.items.set(await firstValueFrom(this.api.adminReviews()));
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(r: AdminReview): Promise<void> {
    const ok = await this.confirm.ask('¿Eliminar esta reseña?', `La reseña de ${r.author} sobre «${r.contentTitle}» se borrará de forma permanente.`, 'Eliminar');
    if (!ok) return;
    try {
      await firstValueFrom(this.api.deleteReview(r.id));
      this.items.update((list) => list.filter((x) => x.id !== r.id));
      this.library.loadRatings();
      this.toast.show('Reseña eliminada', 'success');
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }
}
