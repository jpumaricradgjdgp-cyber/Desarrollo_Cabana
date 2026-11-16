import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmService, ToastService } from '../core/toast.service';
import { Icon } from '../shared/icon';

/** Notificaciones (toasts) y diálogo de confirmación globales. */
@Component({
  selector: 'app-overlays',
  imports: [Icon],
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.kind" role="status">
          <app-icon [name]="t.kind === 'error' ? 'info' : t.kind === 'success' ? 'check' : 'sparkles'" [size]="18" />
          <span>{{ t.text }}</span>
          <button type="button" aria-label="Cerrar" (click)="toast.dismiss(t.id)"><app-icon name="x" [size]="16" /></button>
        </div>
      }
    </div>
    @if (confirm.request(); as req) {
      <div class="backdrop" (click)="confirm.answer(false)">
        <div class="modal" role="alertdialog" aria-modal="true" [attr.aria-label]="req.title" (click)="$event.stopPropagation()">
          <div class="modal-body">
            <h2>{{ req.title }}</h2>
            <p class="muted">{{ req.text }}</p>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" type="button" (click)="confirm.answer(false)">Cancelar</button>
            <button class="btn" [class.btn-danger]="req.danger" [class.btn-primary]="!req.danger" type="button" (click)="confirm.answer(true)" autofocus>
              {{ req.confirm }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .toasts { position: fixed; right: 20px; bottom: 20px; z-index: 100; display: grid; gap: 10px; width: min(380px, calc(100vw - 40px)); }
    .toast { display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 16px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--accent); box-shadow: var(--shadow); animation: pop .2s; }
    .toast.success { border-left-color: var(--success); }
    .toast.error { border-left-color: var(--danger); }
    .toast span { flex: 1; }
    .toast button { color: var(--muted); padding: 4px; }
    .modal { width: min(440px, 100%); }
    .modal-body h2 { font-size: 20px; }
    .muted { color: var(--muted); }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overlays {
  protected readonly toast = inject(ToastService);
  protected readonly confirm = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.confirm.request()) this.confirm.answer(false);
  }
}
