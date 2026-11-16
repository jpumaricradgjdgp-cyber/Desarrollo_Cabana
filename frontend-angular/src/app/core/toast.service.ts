import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private next = 1;
  readonly toasts = signal<Toast[]>([]);

  show(text: string, kind: Toast['kind'] = 'info', ms = 3800): void {
    const toast = { id: this.next++, text, kind };
    this.toasts.update((list) => [...list.slice(-3), toast]);
    setTimeout(() => this.dismiss(toast.id), ms);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

export interface ConfirmRequest {
  title: string;
  text: string;
  confirm: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

/** Diálogo de confirmación accesible que reemplaza a window.confirm. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  ask(title: string, text: string, confirm = 'Confirmar', danger = true): Promise<boolean> {
    return new Promise((resolve) => this.request.set({ title, text, confirm, danger, resolve }));
  }

  answer(ok: boolean): void {
    this.request()?.resolve(ok);
    this.request.set(null);
  }
}
