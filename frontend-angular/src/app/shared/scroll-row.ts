import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { Icon } from './icon';

/** Fila horizontal desplazable con flechas, para los carruseles de la portada. */
@Component({
  selector: 'app-scroll-row',
  imports: [Icon],
  template: `
    <div class="wrap">
      <button class="nav prev icon-btn round" type="button" aria-label="Anteriores" [hidden]="atStart()" (click)="move(-1)">
        <app-icon name="chevron-left" />
      </button>
      <div class="track" #track (scroll)="update()"><ng-content /></div>
      <button class="nav next icon-btn round" type="button" aria-label="Siguientes" [hidden]="atEnd()" (click)="move(1)">
        <app-icon name="chevron-right" />
      </button>
    </div>
  `,
  styles: `
    .wrap { position: relative; }
    .track { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(200px, calc((100% - 18px * 5) / 6)); gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding: 4px 2px 8px; }
    .track::-webkit-scrollbar { display: none; }
    .track > ::ng-deep * { scroll-snap-align: start; }
    .nav { position: absolute; top: calc(50% - 40px); z-index: 2; box-shadow: var(--shadow); }
    .prev { left: -16px; } .next { right: -16px; }
    .nav[hidden] { display: none; }
    @media (max-width: 1100px) { .track { grid-auto-columns: minmax(180px, calc((100% - 18px * 3) / 4)); } }
    @media (max-width: 640px) { .track { grid-auto-columns: 44%; gap: 12px; } .nav { display: none; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollRow {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  protected move(direction: number): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  protected update(): void {
    const el = this.track().nativeElement;
    this.atStart.set(el.scrollLeft < 8);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.update(), 50);
  }
}
