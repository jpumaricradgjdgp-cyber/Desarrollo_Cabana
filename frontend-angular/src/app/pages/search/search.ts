import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Búsqueda instantánea por título, género o descripción (sin tildes ni mayúsculas). */
@Component({
  selector: 'app-search',
  imports: [ContentCard, Icon, RouterLink],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>{{ q() ? 'Resultados para «' + q() + '»' : 'Buscar' }}</h1>
          <p>{{ q() ? results().length + ' coincidencias' : 'Escribe en el buscador superior. Atajo: tecla /' }}</p>
        </div>
      </div>
      @if (q() && !results().length && catalog.loaded()) {
        <div class="empty">
          <span class="icon-bubble"><app-icon name="search" [size]="28" /></span>
          <h3>No encontramos «{{ q() }}»</h3>
          <p>Revisa la ortografía o explora por géneros.</p>
          <a class="btn btn-primary" routerLink="/generos">Ver géneros</a>
        </div>
      } @else {
        <div class="grid">
          @for (item of results(); track item.id) { <app-content-card [content]="item" /> }
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  protected readonly catalog = inject(CatalogService);
  readonly q = input<string>('');
  protected readonly results = computed(() => {
    const term = normalize(this.q().trim());
    if (!term) return this.catalog.items();
    const score = (text: string, weight: number) => (normalize(text).includes(term) ? weight : 0);
    return this.catalog
      .items()
      .map((c) => ({ c, s: score(c.title, 3) + score(c.genre, 2) + score(c.description, 1) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c);
  });

  constructor() {
    this.catalog.ensure();
  }
}
