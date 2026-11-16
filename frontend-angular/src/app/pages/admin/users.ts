import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { UserAdmin } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/toast.service';
import { Icon } from '../../shared/icon';

/** Gestión de usuarios y roles (RF05). */
@Component({
  selector: 'app-admin-users',
  imports: [Icon],
  template: `
    <div class="toolbar">
      <label class="search">
        <app-icon name="search" [size]="18" /><span class="sr-only">Buscar</span>
        <input class="input" placeholder="Buscar por nombre o correo" [value]="q()" (input)="q.set($any($event.target).value)" />
      </label>
      <div class="seg" role="group" aria-label="Rol">
        <button type="button" [class.on]="role() === ''" (click)="role.set('')">Todos ({{ items().length }})</button>
        <button type="button" [class.on]="role() === 'ADMIN'" (click)="role.set('ADMIN')">Administradores ({{ admins() }})</button>
        <button type="button" [class.on]="role() === 'USER'" (click)="role.set('USER')">Usuarios ({{ items().length - admins() }})</button>
      </div>
    </div>
    <div class="card table-wrap">
      <table class="table">
        <thead><tr><th>Usuario</th><th>Rol</th><th class="num">Mi lista</th><th class="num">Vistos</th><th class="num">Reseñas</th><th class="right">Acción</th></tr></thead>
        <tbody>
          @for (u of filtered(); track u.id) {
            <tr>
              <td>
                <div class="who">
                  <span class="avatar" [class.admin]="u.role === 'ADMIN'">{{ initials(u.name) }}</span>
                  <span><strong>{{ u.name }}</strong>@if (u.id === auth.user()?.id) { <small class="you">tú</small> }<br /><small class="hint">{{ u.email }}</small></span>
                </div>
              </td>
              <td><span class="badge" [class.admin]="u.role === 'ADMIN'">{{ u.role === 'ADMIN' ? 'Administrador' : 'Usuario' }}</span></td>
              <td class="num">{{ u.saved }}</td>
              <td class="num">{{ u.watched }}</td>
              <td class="num">{{ u.reviews }}</td>
              <td class="right">
                @if (u.id !== auth.user()?.id) {
                  <button class="btn btn-ghost btn-sm" type="button" [disabled]="busy() === u.id" (click)="toggle(u)">
                    <app-icon [name]="u.role === 'ADMIN' ? 'user' : 'shield'" [size]="15" />{{ u.role === 'ADMIN' ? 'Quitar admin' : 'Hacer admin' }}
                  </button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty-row">{{ loading() ? 'Cargando usuarios…' : 'Sin resultados.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
    <p class="hint note">Los usuarios aparecen aquí después de su primer inicio de sesión. Por seguridad no puedes cambiar tu propio rol.</p>
  `,
  styles: `
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
    .search { position: relative; flex: 1 1 260px; }
    .search app-icon { position: absolute; left: 12px; top: 12px; color: var(--muted); }
    .search .input { padding-left: 40px; background: var(--surface); }
    .seg { display: inline-flex; padding: 4px; gap: 4px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); flex-wrap: wrap; }
    .seg button { padding: 7px 12px; border-radius: 9px; color: var(--muted); font-weight: 700; font-size: 13px; }
    .seg button.on { background: var(--accent); color: var(--accent-ink); }
    .who { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 13px; background: var(--surface-3); flex-shrink: 0; }
    .avatar.admin { background: var(--accent); color: var(--accent-ink); }
    .you { margin-left: 6px; padding: 1px 6px; border-radius: 6px; background: var(--accent-soft); color: var(--accent-hover); font-weight: 700; }
    .badge { color: var(--muted); }
    .badge.admin { color: var(--accent-hover); }
    .num { text-align: center; }
    .right { text-align: right; white-space: nowrap; }
    .empty-row { text-align: center; color: var(--muted); padding: 40px; }
    .note { margin-top: 12px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPage {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly auth = inject(AuthService);
  protected readonly items = signal<UserAdmin[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal<string | null>(null);
  protected readonly q = signal('');
  protected readonly role = signal<'' | 'USER' | 'ADMIN'>('');
  protected readonly admins = computed(() => this.items().filter((u) => u.role === 'ADMIN').length);
  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.items().filter((u) => (!this.role() || u.role === this.role()) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)));
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      this.items.set(await firstValueFrom(this.api.users()));
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  protected initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  }

  protected async toggle(u: UserAdmin): Promise<void> {
    const next = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const ok = await this.confirm.ask(
      next === 'ADMIN' ? `¿Hacer administrador a ${u.name}?` : `¿Quitar el rol de administrador a ${u.name}?`,
      next === 'ADMIN' ? 'Podrá editar el catálogo, moderar reseñas y cambiar roles.' : 'Dejará de ver el panel de administración.',
      next === 'ADMIN' ? 'Hacer administrador' : 'Quitar rol',
      next === 'USER',
    );
    if (!ok) return;
    this.busy.set(u.id);
    try {
      const updated = await firstValueFrom(this.api.changeRole(u.id, next));
      this.items.update((list) => list.map((x) => (x.id === u.id ? updated : x)));
      this.toast.show(`${u.name} ahora es ${next === 'ADMIN' ? 'administrador' : 'usuario'}`, 'success');
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.busy.set(null);
    }
  }
}
