import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from './api.service';
import { AuthService } from './auth.service';
import { Content, Progress, Rating } from './models';
import { ToastService } from './toast.service';

/**
 * Estado compartido del usuario: Mi lista, progreso de reproducción y calificaciones del catálogo.
 * Se recarga automáticamente cuando cambia la sesión.
 */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly saved = signal<Content[]>([]);
  readonly progress = signal<Progress[]>([]);
  readonly ratings = signal<Map<string, Rating>>(new Map());
  readonly savedIds = computed(() => new Set(this.saved().map((c) => c.id)));
  readonly progressById = computed(() => new Map(this.progress().map((p) => [p.content.id, p.seconds])));

  constructor() {
    effect(() => {
      const user = this.auth.user();
      untracked(() => (user ? this.loadUserData() : (this.saved.set([]), this.progress.set([]))));
    });
    this.loadRatings();
  }

  async loadUserData(): Promise<void> {
    try {
      const [saved, progress] = await Promise.all([
        firstValueFrom(this.api.myList()),
        firstValueFrom(this.api.progress()),
      ]);
      this.saved.set(saved);
      this.progress.set(progress.filter((p) => p.seconds > 0));
    } catch {
      /* la sesión pudo expirar; el interceptor ya intentó renovarla */
    }
  }

  async loadRatings(): Promise<void> {
    try {
      const list = await firstValueFrom(this.api.ratings());
      this.ratings.set(new Map(list.map((r) => [r.contentId, r])));
    } catch {
      /* sin calificaciones */
    }
  }

  isSaved(id: string): boolean {
    return this.savedIds().has(id);
  }

  /** Agrega o quita de Mi lista con actualización optimista. */
  async toggle(content: Content): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Inicia sesión para guardar títulos en Mi lista.');
      return;
    }
    const wasSaved = this.isSaved(content.id);
    this.saved.update((list) => (wasSaved ? list.filter((c) => c.id !== content.id) : [content, ...list]));
    try {
      await firstValueFrom(wasSaved ? this.api.unsave(content.id) : this.api.save(content.id));
      this.toast.show(wasSaved ? `Quitaste «${content.title}» de Mi lista` : `«${content.title}» está en Mi lista`, 'success');
    } catch (e) {
      this.saved.update((list) => (wasSaved ? [content, ...list] : list.filter((c) => c.id !== content.id)));
      this.toast.show(errorMessage(e), 'error');
    }
  }

  updateProgress(content: Content, seconds: number): void {
    this.progress.update((list) => [{ content, seconds }, ...list.filter((p) => p.content.id !== content.id)]);
  }
}
