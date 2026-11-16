import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'dark' | 'light' | 'halloween';
export const THEMES: { value: Theme; label: string; hint: string }[] = [
  { value: 'dark', label: 'Azul noche', hint: 'El ambiente de la cabaña' },
  { value: 'light', label: 'Claro', hint: 'Para ver de día' },
  { value: 'halloween', label: 'Halloween', hint: 'Una noche de terror' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.read());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.dataset['theme'] = theme;
      try {
        localStorage.setItem('cabana-theme', theme);
      } catch {
        /* sin almacenamiento */
      }
    });
  }

  private read(): Theme {
    const current = document.documentElement.dataset['theme'];
    return current === 'light' || current === 'halloween' ? current : 'dark';
  }
}
