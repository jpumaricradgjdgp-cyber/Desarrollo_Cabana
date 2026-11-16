import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LibraryService } from '../core/library.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    @if (open()) {
      <div class="scrim" (click)="close.emit()"></div>
    }
    <aside [class.open]="open()" aria-label="Navegación principal">
      <a class="brand" routerLink="/inicio" aria-label="Cabaña, inicio"><img src="assets/logo.jpg" alt="Cabaña" /></a>
      <p class="label">EXPLORA TU CABAÑA</p>
      <nav>
        @for (item of explore; track item.link) {
          <a class="item" [routerLink]="item.link" routerLinkActive="active"><app-icon [name]="item.icon" />{{ item.label }}</a>
        }
      </nav>
      <div class="sep"></div>
      <p class="label">MI CUENTA</p>
      <nav>
        @if (auth.isLoggedIn()) {
          <a class="item" routerLink="/mi-lista" routerLinkActive="active">
            <app-icon name="bookmark" />Mi lista
            @if (savedCount()) { <span class="count">{{ savedCount() }}</span> }
          </a>
          @if (auth.isAdmin()) {
            <a class="item" routerLink="/admin" routerLinkActive="active"><app-icon name="shield" />Panel ADMIN</a>
          }
        } @else {
          <a class="item" routerLink="/login" routerLinkActive="active"><app-icon name="user" />Iniciar sesión</a>
          <a class="item" routerLink="/registro" routerLinkActive="active"><app-icon name="user-plus" />Registrarse</a>
        }
      </nav>
      <div class="bottom">
        <img src="assets/bonfire.png" alt="" />
        <p>Una buena historia.<br />Un lugar para quedarte.</p>
        <small>CABAÑA · STREAMING</small>
      </div>
    </aside>
  `,
  styles: `
    aside { width: var(--sidebar-w); position: fixed; inset: 0 auto 0 0; z-index: 40; display: flex; flex-direction: column; overflow-y: auto;
      padding: 26px 16px 20px; background: linear-gradient(180deg, #0000, #0000 60%, var(--accent-soft)), var(--sidebar); border-right: 1px solid var(--line); }
    .brand { width: 132px; margin: 0 auto 32px; }
    .brand img { width: 100%; mix-blend-mode: screen; }
    :host-context([data-theme='light']) .brand img { filter: invert(1); mix-blend-mode: multiply; }
    .label { font-size: 10px; color: var(--muted); letter-spacing: .14em; margin: 0 12px 12px; font-weight: 700; }
    nav { display: grid; gap: 4px; }
    .item { display: flex; align-items: center; gap: 14px; padding: 11px 14px; border-radius: 10px; color: var(--muted); font-weight: 600; border-left: 3px solid transparent; transition: background .15s, color .15s; }
    .item:hover { background: var(--surface-2); color: var(--text); }
    .item.active { background: var(--surface-2); color: var(--text); border-left-color: var(--accent); }
    .count { margin-left: auto; min-width: 22px; padding: 0 6px; border-radius: 99px; background: var(--accent); color: var(--accent-ink); font-size: 11px; text-align: center; }
    .sep { height: 1px; background: var(--line); margin: 20px 4px; }
    .bottom { margin-top: auto; padding: 28px 12px 0; color: var(--muted); font-size: 12px; }
    .bottom img { width: 30px; margin-bottom: 8px; }
    .bottom p { line-height: 1.7; margin-bottom: 14px; }
    .bottom small { font-size: 9px; letter-spacing: .2em; }
    .scrim { display: none; }
    @media (max-width: 900px) {
      aside { transform: translateX(-100%); transition: transform .25s; box-shadow: var(--shadow); }
      aside.open { transform: none; }
      .scrim { display: block; position: fixed; inset: 0; z-index: 39; background: #0008; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly auth = inject(AuthService);
  private readonly library = inject(LibraryService);
  readonly open = input(false);
  readonly close = output<void>();
  protected readonly savedCount = computed(() => this.library.saved().length);
  protected readonly explore = [
    { link: '/inicio', label: 'Inicio', icon: 'home' },
    { link: '/peliculas', label: 'Películas', icon: 'film' },
    { link: '/series', label: 'Series', icon: 'tv' },
    { link: '/generos', label: 'Géneros', icon: 'grid' },
  ];
}
