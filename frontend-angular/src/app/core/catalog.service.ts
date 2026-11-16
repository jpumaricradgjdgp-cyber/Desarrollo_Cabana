import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from './api.service';
import { Content } from './models';

/** Catálogo público en memoria: se carga una vez y se reutiliza en todas las vistas. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);
  private loading: Promise<void> | null = null;

  readonly items = signal<Content[]>([]);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  readonly movies = computed(() => this.items().filter((c) => c.type === 'MOVIE'));
  readonly series = computed(() => this.items().filter((c) => c.type === 'SERIES'));
  readonly featured = computed(() => {
    const list = this.items().filter((c) => c.featured);
    return list.length ? list : this.items().slice(0, 3);
  });
  readonly recent = computed(() => [...this.items()].sort((a, b) => b.releaseYear - a.releaseYear || a.title.localeCompare(b.title)));
  readonly genres = computed(() => {
    const counts = new Map<string, number>();
    for (const c of this.items()) counts.set(c.genre, (counts.get(c.genre) ?? 0) + 1);
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  });

  ensure(): Promise<void> {
    if (this.loaded()) return Promise.resolve();
    return (this.loading ??= this.reload());
  }

  async reload(): Promise<void> {
    this.error.set(null);
    try {
      this.items.set(await firstValueFrom(this.api.catalog()));
      this.loaded.set(true);
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo cargar el catálogo.'));
    } finally {
      this.loading = null;
    }
  }

  byId(id: string): Content | undefined {
    return this.items().find((c) => c.id === id);
  }
}
