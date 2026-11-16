import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/library.service';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-my-list',
  imports: [ContentCard, Icon, RouterLink],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Mi lista</h1>
          <p>Tus películas y series guardadas para la próxima noche en la cabaña.</p>
        </div>
        @if (library.saved().length) {
          <div class="stats">
            <span class="pill"><app-icon name="film" [size]="14" />{{ movies() }} películas</span>
            <span class="pill"><app-icon name="tv" [size]="14" />{{ series() }} series</span>
          </div>
        }
      </div>
      @if (library.saved().length) {
        <div class="grid">
          @for (item of library.saved(); track item.id) { <app-content-card [content]="item" /> }
        </div>
      } @else {
        <div class="empty card">
          <span class="icon-bubble"><app-icon name="bookmark" [size]="28" /></span>
          <h3>Tu lista está vacía</h3>
          <p>Toca el botón <strong>+</strong> en cualquier título para guardarlo aquí.</p>
          <a class="btn btn-primary" routerLink="/inicio">Explorar el catálogo</a>
        </div>
      }
    </section>
  `,
  styles: `.stats { display: flex; gap: 8px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyListPage {
  protected readonly library = inject(LibraryService);
  protected readonly movies = computed(() => this.library.saved().filter((c) => c.type === 'MOVIE').length);
  protected readonly series = computed(() => this.library.saved().filter((c) => c.type === 'SERIES').length);

  constructor() {
    this.library.loadUserData();
  }
}
