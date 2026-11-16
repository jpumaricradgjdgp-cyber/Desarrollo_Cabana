import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Sidebar } from './layout/sidebar';
import { Topbar } from './layout/topbar';
import { Overlays } from './layout/overlays';
import { ConfigService } from './core/config.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Topbar, Overlays],
  template: `
    <a class="skip" href="#contenido">Saltar al contenido</a>
    <app-sidebar [open]="menuOpen()" (close)="menuOpen.set(false)" />
    <div class="shell">
      <app-topbar (menu)="menuOpen.set(!menuOpen())" />
      @if (!config.online()) {
        <div class="alert error offline">
          No hay conexión con el servidor de Cabaña. Inicia el backend (<code>Iniciar_Cabana.cmd</code>) y recarga la página.
        </div>
      }
      <main id="contenido"><router-outlet /></main>
      <footer>
        <strong>Cabaña</strong>
        <span>Las mejores historias empiezan aquí.</span>
        <span>Angular · Spring Boot · {{ year }}</span>
      </footer>
    </div>
    <app-overlays />
  `,
  styles: `
    .skip { position: absolute; left: -999px; top: 8px; z-index: 100; background: var(--accent); color: var(--accent-ink); padding: 8px 14px; border-radius: 8px; }
    .skip:focus { left: 8px; }
    .shell { margin-left: var(--sidebar-w); padding: 0 32px; min-height: 100vh; display: flex; flex-direction: column; }
    main { flex: 1; }
    .offline { margin-bottom: 16px; }
    footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding: 24px 0 28px; margin-top: 32px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    footer strong { font-family: Georgia, serif; font-style: italic; color: var(--text); font-size: 15px; }
    @media (max-width: 900px) { .shell { margin-left: 0; padding: 0 16px; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly config = inject(ConfigService);
  protected readonly menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();

  constructor() {
    // Cierra el menú móvil al navegar.
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }
}
