import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <section class="page">
      <div class="page-head">
        <div>
          <span class="eyebrow"><app-icon name="shield" [size]="14" />PANEL DE ADMINISTRACIÓN</span>
          <h1>Hola, {{ auth.user()?.name }}</h1>
          <p>Gestiona el catálogo, revisa la actividad y modera las reseñas.</p>
        </div>
        <a class="btn btn-ghost" href="/swagger-ui.html" target="_blank" rel="noopener"><app-icon name="layers" [size]="18" />API · Swagger</a>
      </div>
      <nav class="tabs" aria-label="Secciones del panel">
        <a routerLink="/admin" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }"><app-icon name="chart" [size]="18" />Resumen</a>
        <a routerLink="/admin/contenido" routerLinkActive="on"><app-icon name="film" [size]="18" />Contenido</a>
        <a routerLink="/admin/resenas" routerLinkActive="on"><app-icon name="message" [size]="18" />Reseñas</a>
        <a routerLink="/admin/usuarios" routerLinkActive="on"><app-icon name="users" [size]="18" />Usuarios</a>
      </nav>
      <router-outlet />
    </section>
  `,
  styles: `
    .eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: .14em; color: var(--accent-hover); font-weight: 700; margin-bottom: 6px; }
    .tabs { display: flex; gap: 6px; padding: 5px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); width: fit-content; margin-bottom: 26px; overflow-x: auto; max-width: 100%; }
    .tabs a { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 10px; color: var(--muted); font-weight: 700; white-space: nowrap; }
    .tabs a:hover { color: var(--text); }
    .tabs a.on { background: var(--accent); color: var(--accent-ink); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
}
