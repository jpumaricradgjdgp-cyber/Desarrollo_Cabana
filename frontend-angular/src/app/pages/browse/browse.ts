import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CatalogService } from '../../core/catalog.service';
import { typeLabel } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Content, ContentType } from '../../core/models';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';

type Sort = 'featured' | 'title' | 'newest' | 'rating';

/** Listado de películas o series con filtros por género, año y orden. */
@Component({
  selector: 'app-browse',
  imports: [ContentCard, Icon],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>{{ label() }}</h1>
          <p>{{ filtered().length }} {{ filtered().length === 1 ? 'título' : 'títulos' }} para elegir esta noche.</p>
        </div>
        <label class="sort">
          <app-icon name="filter" [size]="16" />
          <span class="sr-only">Ordenar</span>
          <select class="select" [value]="sort()" (change)="sort.set($any($event.target).value)">
            <option value="featured">Destacados primero</option>
            <option value="newest">Más recientes</option>
            <option value="rating">Mejor calificados</option>
            <option value="title">Título (A–Z)</option>
          </select>
        </label>
      </div>
      <div class="chips" role="group" aria-label="Filtrar por género">
        <button class="chip" type="button" [class.active]="!genre()" (click)="genre.set('')">Todos</button>
        @for (g of genres(); track g) {
          <button class="chip" type="button" [class.active]="genre() === g" (click)="genre.set(g)">{{ g }}</button>
        }
      </div>
      @if (!catalog.loaded()) {
        <div class="grid">@for (n of [1, 2, 3, 4, 5, 6, 7, 8]; track n) { <div class="skeleton" style="aspect-ratio: 16/10"></div> }</div>
      } @else if (filtered().length) {
        <div class="grid">
          @for (item of filtered(); track item.id) { <app-content-card [content]="item" /> }
        </div>
      } @else {
        <div class="empty">
          <span class="icon-bubble"><app-icon name="film" [size]="28" /></span>
          <h3>Nada por aquí todavía</h3>
          <p>Prueba con otro género.</p>
        </div>
      }
    </section>
  `,
  styles: `
    .sort { display: flex; align-items: center; gap: 8px; color: var(--muted); }
    .sort .select { width: auto; min-height: 40px; background: var(--surface); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePage {
  protected readonly catalog = inject(CatalogService);
  private readonly library = inject(LibraryService);
  readonly type = input<ContentType>('MOVIE');
  protected readonly genre = signal('');
  protected readonly sort = signal<Sort>('featured');

  protected readonly label = computed(() => typeLabel(this.type(), true));
  private readonly ofType = computed(() => this.catalog.items().filter((c) => c.type === this.type()));
  protected readonly genres = computed(() => [...new Set(this.ofType().map((c) => c.genre))].sort());
  protected readonly filtered = computed(() => {
    const list = this.ofType().filter((c) => !this.genre() || c.genre === this.genre());
    const ratings = this.library.ratings();
    const score = (c: Content) => ratings.get(c.id)?.average ?? 0;
    switch (this.sort()) {
      case 'title':
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
        return [...list].sort((a, b) => b.releaseYear - a.releaseYear);
      case 'rating':
        return [...list].sort((a, b) => score(b) - score(a));
      default:
        return list;
    }
  });

  constructor() {
    this.catalog.ensure();
  }
}
