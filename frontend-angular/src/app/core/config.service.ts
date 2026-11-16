import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { AppConfig } from './models';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly api = inject(ApiService);
  readonly config = signal<AppConfig>({ demo: false, name: 'Cabaña', halloweenSeason: false, seasonYear: new Date().getFullYear() });
  /** Falso cuando el backend no respondió: la interfaz muestra un aviso en lugar de fallar en silencio. */
  readonly online = signal(true);

  async load(): Promise<void> {
    try {
      this.config.set(await firstValueFrom(this.api.config()));
    } catch {
      this.online.set(false);
    }
  }
}
