import { ChangeDetectionStrategy, Component, HostListener, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { youtubeId } from '../core/format';
import { Icon } from './icon';

/** Tráiler de YouTube en modo de privacidad mejorada (youtube-nocookie). */
@Component({
  selector: 'app-trailer-modal',
  imports: [Icon],
  template: `
    <div class="backdrop" (click)="close.emit()">
      <div class="frame" role="dialog" aria-modal="true" [attr.aria-label]="'Tráiler de ' + title()" (click)="$event.stopPropagation()">
        <div class="head">
          <strong>Tráiler · {{ title() }}</strong>
          <button class="icon-btn round" type="button" aria-label="Cerrar tráiler" (click)="close.emit()"><app-icon name="x" /></button>
        </div>
        @if (src(); as url) {
          <iframe [src]="url" title="Tráiler" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
        }
      </div>
    </div>
  `,
  styles: `
    .frame { width: min(960px, 100%); display: grid; gap: 10px; animation: pop .2s; }
    .head { display: flex; align-items: center; justify-content: space-between; color: #fff; }
    .head .icon-btn { background: #0008; color: #fff; border-color: #fff3; }
    iframe { width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 14px; background: #000; box-shadow: var(--shadow); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrailerModal {
  private readonly sanitizer = inject(DomSanitizer);
  readonly url = input.required<string>();
  readonly title = input('');
  readonly close = output<void>();
  /** Solo se confía en la URL si pasó la validación del ID de YouTube. */
  protected readonly src = computed(() => {
    const id = youtubeId(this.url());
    return id ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`) : null;
  });

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }
}
