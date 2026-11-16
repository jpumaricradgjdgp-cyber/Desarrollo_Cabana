import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lengthLabel, progressPercent } from '../core/format';
import { LibraryService } from '../core/library.service';
import { Content } from '../core/models';
import { Icon } from './icon';
import { Poster } from './poster';

/** Tarjeta de catálogo con acciones rápidas al pasar el cursor. */
@Component({
  selector: 'app-content-card',
  imports: [RouterLink, Poster, Icon],
  template: `
    <article class="card-item">
      <a class="thumb" [routerLink]="['/titulo', content().id]" [attr.aria-label]="'Ver detalle de ' + content().title">
        <app-poster [content]="content()" />
        @if (rating(); as r) {
          <span class="score"><app-icon name="star" [size]="12" />{{ r.average.toFixed(1) }}</span>
        }
        @if (content().featured) {
          <span class="tag">Destacado</span>
        }
        <span class="overlay"><span class="play"><app-icon name="play" [size]="18" /></span></span>
        @if (percent(); as p) {
          <span class="bar"><span [style.width.%]="p"></span></span>
        }
      </a>
      <button class="save" type="button" (click)="library.toggle(content())"
        [attr.aria-label]="saved() ? 'Quitar de Mi lista' : 'Agregar a Mi lista'" [attr.aria-pressed]="saved()">
        <app-icon [name]="saved() ? 'check' : 'plus'" [size]="16" />
      </button>
      <a [routerLink]="['/titulo', content().id]" class="info">
        <h3>{{ content().title }}</h3>
        <p class="meta">{{ content().releaseYear }} · {{ content().genre }} · {{ length() }}</p>
      </a>
    </article>
  `,
  styles: `
    .card-item { position: relative; }
    .thumb { display: block; position: relative; aspect-ratio: 16 / 10; border-radius: 12px; overflow: hidden; border: 1px solid var(--line); transition: transform .2s, border-color .2s, box-shadow .2s; }
    app-poster { width: 100%; height: 100%; }
    .card-item:hover .thumb { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 14px 30px #0006; }
    .overlay { position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(180deg, transparent 30%, #000a); opacity: 0; transition: opacity .2s; }
    .card-item:hover .overlay, .thumb:focus-visible .overlay { opacity: 1; }
    .play { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); box-shadow: 0 6px 20px #0007; }
    .score { position: absolute; left: 8px; top: 8px; display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 6px; background: #000b; color: var(--gold); font-weight: 700; font-size: 12px; }
    .tag { position: absolute; left: 8px; bottom: 8px; padding: 2px 8px; border-radius: 6px; background: var(--accent); color: var(--accent-ink); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
    .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: #fff3; }
    .bar span { display: block; height: 100%; background: var(--accent); }
    .save { position: absolute; right: 8px; top: 8px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: #000a; color: #fff; border: 1px solid #fff4; opacity: 0; transition: opacity .2s, background .2s; z-index: 1; }
    .save[aria-pressed='true'] { background: var(--accent); color: var(--accent-ink); border-color: transparent; opacity: 1; }
    .card-item:hover .save, .save:focus-visible { opacity: 1; }
    .info { display: block; padding-top: 10px; }
    h3 { font-family: var(--font); font-size: 14px; font-weight: 700; letter-spacing: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { font-size: 12px; margin-top: 2px; }
    @media (hover: none) { .save { opacity: 1; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCard {
  protected readonly library = inject(LibraryService);
  readonly content = input.required<Content>();
  protected readonly saved = computed(() => this.library.savedIds().has(this.content().id));
  protected readonly rating = computed(() => this.library.ratings().get(this.content().id));
  protected readonly length = computed(() => lengthLabel(this.content()));
  protected readonly percent = computed(() => {
    const seconds = this.library.progressById().get(this.content().id);
    return seconds ? Math.max(3, progressPercent(this.content(), seconds)) : 0;
  });
}
