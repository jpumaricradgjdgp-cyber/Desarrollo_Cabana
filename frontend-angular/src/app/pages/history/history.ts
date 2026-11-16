import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { clock, lengthLabel, progressPercent, timeAgo } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Icon } from '../../shared/icon';
import { Poster } from '../../shared/poster';

/** Historial de reproducción: lo último que viste primero, agrupado por día. */
@Component({
  selector: 'app-history',
  imports: [RouterLink, Icon, Poster],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <h1>Historial</h1>
          <p>Lo que viste en la cabaña, del más reciente al más antiguo.</p>
        </div>
      </div>
      @for (group of groups(); track group.label) {
        <h2 class="day">{{ group.label }}</h2>
        @for (p of group.items; track p.content.id) {
          <article class="item card">
            <a class="thumb" [routerLink]="['/ver', p.content.id]" [attr.aria-label]="'Seguir viendo ' + p.content.title">
              <app-poster [content]="p.content" />
              <span class="play"><app-icon name="play" [size]="16" /></span>
              <span class="bar"><span [style.width.%]="Math.max(3, percent(p.content, p.seconds, p.totalSeconds))"></span></span>
            </a>
            <div class="info">
              <a [routerLink]="['/titulo', p.content.id]"><strong>{{ p.content.title }}</strong></a>
              <small>{{ p.content.genre }} · {{ lengthLabel(p.content) }}</small>
              <small>Te quedaste en {{ clock(p.seconds) }} · {{ timeAgo(p.updatedAt) }}</small>
            </div>
            <a class="btn btn-primary btn-sm" [routerLink]="['/ver', p.content.id]">Continuar</a>
            <button class="icon-btn" type="button" aria-label="Quitar del historial" (click)="library.forget(p.content)"><app-icon name="trash" [size]="17" /></button>
          </article>
        }
      } @empty {
        <div class="empty card">
          <span class="icon-bubble"><app-icon name="clock" [size]="28" /></span>
          <h3>Aún no viste nada</h3>
          <p>Cuando reproduzcas un título aparecerá aquí para que sigas donde lo dejaste.</p>
          <a class="btn btn-primary" routerLink="/inicio">Explorar el catálogo</a>
        </div>
      }
    </section>
  `,
  styles: `
    .day { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin: 22px 0 10px; }
    .item { display: flex; align-items: center; gap: 16px; padding: 12px; margin-bottom: 10px; }
    .thumb { position: relative; width: 150px; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .thumb app-poster { width: 100%; height: 100%; }
    .play { position: absolute; left: 8px; bottom: 10px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); }
    .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: #fff3; }
    .bar span { display: block; height: 100%; background: var(--accent); }
    .info { flex: 1; min-width: 0; display: grid; gap: 2px; }
    .info small { color: var(--muted); font-size: 12px; }
    @media (max-width: 640px) { .item { flex-wrap: wrap; } .thumb { width: 100%; } .item .btn { flex: 1; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  protected readonly library = inject(LibraryService);
  protected readonly Math = Math;
  protected readonly clock = clock;
  protected readonly lengthLabel = lengthLabel;
  protected readonly percent = progressPercent;
  protected readonly timeAgo = timeAgo;

  /** Agrupa por «Hoy», «Ayer», «Esta semana» y «Antes». */
  protected readonly groups = computed(() => {
    const day = 86_400_000;
    const today = new Date().setHours(0, 0, 0, 0);
    const label = (iso?: string) => {
      const t = iso ? new Date(iso).getTime() : 0;
      if (t >= today) return 'Hoy';
      if (t >= today - day) return 'Ayer';
      if (t >= today - 6 * day) return 'Esta semana';
      return 'Antes';
    };
    const groups: { label: string; items: ReturnType<LibraryService['progress']> }[] = [];
    for (const p of this.library.progress()) {
      const name = label(p.updatedAt);
      const group = groups.find((g) => g.label === name);
      if (group) group.items.push(p);
      else groups.push({ label: name, items: [p] });
    }
    return groups;
  });

  constructor() {
    this.library.loadUserData();
  }
}
