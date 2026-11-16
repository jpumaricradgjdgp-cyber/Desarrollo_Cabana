import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { hasImage, hue } from '../core/format';
import { Content } from '../core/models';

/** Portada del contenido; si no tiene imagen (o falla al cargar) genera una tipográfica. */
@Component({
  selector: 'app-poster',
  template: `
    @if (showImage()) {
      <img [src]="content().imageUrl" [alt]="'Portada de ' + content().title" loading="lazy" (error)="failed.set(true)" />
    } @else {
      <div class="generated" [style.--h]="tone()">
        <strong>{{ content().title }}</strong>
        <small>CABAÑA · {{ content().releaseYear }}</small>
      </div>
    }
  `,
  styles: `
    :host { display: block; position: relative; overflow: hidden; background: var(--surface-2); }
    img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; }
    .generated {
      position: absolute; inset: 0; display: grid; place-content: center; gap: 8px; padding: 14px; text-align: center;
      background: radial-gradient(circle at 30% 20%, hsl(var(--h) 55% 38% / .9), transparent 60%),
        linear-gradient(160deg, hsl(var(--h) 45% 22%), hsl(calc(var(--h) + 40) 40% 10%));
      color: #fff;
    }
    strong { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; font-size: clamp(13px, 1.4vw, 17px); line-height: 1.25; text-shadow: 0 2px 12px #0008; }
    small { font-size: 9px; letter-spacing: .25em; opacity: .7; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Poster {
  readonly content = input.required<Pick<Content, 'title' | 'imageUrl' | 'releaseYear'>>();
  protected readonly failed = signal(false);
  protected readonly showImage = computed(() => hasImage(this.content()) && !this.failed());
  protected readonly tone = computed(() => hue(this.content().title));
}
