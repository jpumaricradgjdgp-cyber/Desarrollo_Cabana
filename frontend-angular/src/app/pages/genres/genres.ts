import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { hue } from '../../core/format';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';

/** Mosaico de géneros; al elegir uno (?g=) muestra sus películas y series. */
@Component({
  selector: 'app-genres',
  imports: [RouterLink, ContentCard, Icon],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>{{ g() || 'Géneros' }}</h1>
          <p>{{ g() ? selected().length + ' títulos de ' + g() : 'Encuentra historias según tu ánimo.' }}</p>
        </div>
        @if (g()) {
          <a class="btn btn-ghost" routerLink="/generos"><app-icon name="arrow-left" [size]="18" />Todos los géneros</a>
        }
      </div>
      <div class="tiles" [class.compact]="g()">
        @for (item of catalog.genres(); track item.name) {
          <a class="tile" [class.on]="item.name === g()" [routerLink]="['/generos']" [queryParams]="{ g: item.name }" [style.--h]="hue(item.name)">
            <strong>{{ item.name }}</strong>
            <small>{{ item.count }} {{ item.count === 1 ? 'título' : 'títulos' }}</small>
          </a>
        }
      </div>
      @if (g()) {
        <div class="grid results">
          @for (item of selected(); track item.id) { <app-content-card [content]="item" /> }
        </div>
      }
    </section>
  `,
  styles: `
    .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
    .tile { display: grid; align-content: end; gap: 4px; height: 130px; padding: 18px; border-radius: 16px; color: #fff; border: 2px solid transparent;
      background: radial-gradient(circle at 85% 0%, hsl(var(--h) 70% 55% / .55), transparent 60%), linear-gradient(140deg, hsl(var(--h) 45% 28%), hsl(var(--h) 40% 12%));
      transition: transform .15s, box-shadow .15s; }
    .tile:hover { transform: translateY(-3px); box-shadow: 0 12px 28px #0006; }
    .tile.on { border-color: var(--accent); }
    .tile strong { font-family: var(--display); font-size: 19px; }
    .tile small { opacity: .75; }
    .compact { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
    .compact .tile { height: 64px; padding: 10px 14px; }
    .compact .tile strong { font-size: 14px; }
    .compact .tile small { display: none; }
    .results { margin-top: 32px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenresPage {
  protected readonly catalog = inject(CatalogService);
  /** Query param ?g= enlazado como input gracias a withComponentInputBinding. */
  readonly g = input<string>('');
  protected readonly hue = hue;
  protected readonly selected = computed(() => this.catalog.items().filter((c) => c.genre === this.g()));

  constructor() {
    this.catalog.ensure();
  }
}
