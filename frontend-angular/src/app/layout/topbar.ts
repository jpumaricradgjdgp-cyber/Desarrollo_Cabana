import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, output, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { THEMES, ThemeService } from '../core/theme.service';
import { ToastService } from '../core/toast.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, Icon],
  template: `
    <header>
      <button class="icon-btn menu" type="button" aria-label="Abrir menú" (click)="menu.emit()"><app-icon name="menu" /></button>
      <label class="search">
        <app-icon name="search" [size]="18" />
        <span class="sr-only">Buscar</span>
        <input #search type="search" placeholder="Buscar películas, series…" [value]="query()" (input)="onSearch(search.value)"
          (keydown.enter)="go(search.value)" autocomplete="off" />
        <kbd>/</kbd>
      </label>
      <div class="actions">
        <div class="pop">
          <button class="btn btn-ghost theme" type="button" aria-label="Elegir tema" [attr.aria-expanded]="themeOpen()" (click)="themeOpen.set(!themeOpen()); userOpen.set(false)">
            <app-icon [name]="theme.theme() === 'halloween' ? 'ghost' : 'palette'" /><span class="hide-sm">Temas</span>
          </button>
          @if (themeOpen()) {
            <div class="menu-panel" role="group" aria-label="Elige tu ambiente">
              <p class="title">Elige tu ambiente</p>
              @for (t of themes; track t.value) {
                <button type="button" class="option" [class.on]="theme.theme() === t.value" (click)="theme.theme.set(t.value); themeOpen.set(false)">
                  <span class="swatch" [attr.data-swatch]="t.value"></span>
                  <span><strong>{{ t.label }}</strong><small>{{ t.hint }}</small></span>
                  @if (theme.theme() === t.value) { <app-icon name="check" [size]="16" /> }
                </button>
              }
            </div>
          }
        </div>
        @if (auth.user(); as user) {
          <div class="pop">
            <button class="avatar" type="button" [attr.aria-expanded]="userOpen()" aria-label="Menú de cuenta" (click)="userOpen.set(!userOpen()); themeOpen.set(false)">
              {{ auth.initials() }}
            </button>
            @if (userOpen()) {
              <div class="menu-panel" role="menu">
                <div class="who">
                  <strong>{{ user.name }}</strong><small>{{ user.email }}</small>
                  <span class="badge">{{ user.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}</span>
                </div>
                <a class="option" routerLink="/perfil" (click)="userOpen.set(false)"><app-icon name="user" [size]="18" />Mi perfil</a>
                <a class="option" routerLink="/mi-lista" (click)="userOpen.set(false)"><app-icon name="bookmark" [size]="18" />Mi lista</a>
                <a class="option" routerLink="/historial" (click)="userOpen.set(false)"><app-icon name="clock" [size]="18" />Historial</a>
                @if (auth.isAdmin()) {
                  <a class="option" routerLink="/admin" (click)="userOpen.set(false)"><app-icon name="shield" [size]="18" />Panel ADMIN</a>
                }
                <button class="option" type="button" (click)="logout()"><app-icon name="logout" [size]="18" />Cerrar sesión</button>
              </div>
            }
          </div>
        } @else {
          <a class="btn btn-ghost hide-sm" routerLink="/login">Iniciar sesión</a>
          <a class="btn btn-primary" routerLink="/registro">Registrarse</a>
        }
      </div>
    </header>
  `,
  styles: `
    header { height: 84px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 30; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(12px); margin: 0 -32px; padding: 0 32px; }
    .menu { display: none; }
    .search { display: flex; align-items: center; gap: 10px; flex: 0 1 480px; height: 44px; padding: 0 16px; border-radius: 99px; background: var(--surface); border: 1px solid var(--line); color: var(--muted); transition: border-color .15s; }
    .search:focus-within { border-color: var(--accent); }
    .search input { flex: 1; min-width: 0; border: 0; outline: 0; background: none; color: var(--text); }
    .search input::-webkit-search-cancel-button { display: none; }
    kbd { font-size: 11px; border: 1px solid var(--line); border-radius: 5px; padding: 0 6px; }
    .actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
    .pop { position: relative; }
    .theme { padding: 0 14px; }
    .avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: var(--accent-ink); background: linear-gradient(135deg, var(--accent), var(--accent-hover)); box-shadow: 0 0 0 3px var(--accent-soft); }
    .menu-panel { position: absolute; right: 0; top: calc(100% + 10px); width: 260px; padding: 8px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow); display: grid; gap: 2px; animation: pop .15s; z-index: 50; }
    .title { font-size: 11px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; padding: 6px 10px; font-weight: 700; }
    .option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px; border-radius: 10px; text-align: left; font-weight: 600; }
    .option:hover, .option.on { background: var(--surface-2); }
    .option small { display: block; color: var(--muted); font-weight: 400; font-size: 12px; }
    .option app-icon:last-child { margin-left: auto; color: var(--accent); }
    .swatch { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line); flex-shrink: 0; }
    [data-swatch='dark'] { background: linear-gradient(135deg, #0b101b 50%, #246cff 50%); }
    [data-swatch='light'] { background: linear-gradient(135deg, #f4f6fb 50%, #175fe5 50%); }
    [data-swatch='halloween'] { background: linear-gradient(135deg, #21192b 50%, #fa974e 50%); }
    .who { display: grid; gap: 2px; padding: 10px 10px 12px; border-bottom: 1px solid var(--line); margin-bottom: 4px; }
    .who small { color: var(--muted); overflow: hidden; text-overflow: ellipsis; }
    .who .badge { justify-self: start; margin-top: 6px; color: var(--accent); }
    @media (max-width: 900px) { header { margin: 0 -16px; padding: 0 16px; height: 70px; gap: 10px; } .menu { display: grid; } kbd { display: none; } }
    @media (max-width: 640px) { .hide-sm { display: none; } .theme { padding: 0 10px; } .search { padding: 0 12px; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private timer?: ReturnType<typeof setTimeout>;

  readonly menu = output<void>();
  protected readonly themes = THEMES;
  protected readonly themeOpen = signal(false);
  protected readonly userOpen = signal(false);
  protected readonly query = signal('');

  constructor() {
    // Mantiene el texto del buscador sincronizado con /buscar?q=
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.parseUrl(this.router.url);
      this.query.set(url.root.children['primary']?.segments[0]?.path === 'buscar' ? (url.queryParams['q'] ?? '') : '');
      this.themeOpen.set(false);
      this.userOpen.set(false);
    });
  }

  protected onSearch(value: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.go(value), 280);
  }

  protected go(value: string): void {
    clearTimeout(this.timer);
    const q = value.trim();
    if (!q && !this.router.url.startsWith('/buscar')) return;
    this.router.navigate(['/buscar'], { queryParams: { q: q || null }, replaceUrl: this.router.url.startsWith('/buscar') });
  }

  protected async logout(): Promise<void> {
    this.userOpen.set(false);
    await this.auth.logout();
    this.toast.show('Cerraste sesión. ¡Vuelve pronto!', 'success');
    this.router.navigate(['/inicio']);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      event.preventDefault();
      this.input().nativeElement.focus();
    }
    if (event.key === 'Escape') {
      this.themeOpen.set(false);
      this.userOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  protected onClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.themeOpen.set(false);
      this.userOpen.set(false);
    }
  }
}
