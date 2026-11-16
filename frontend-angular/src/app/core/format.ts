import { Content, PLACEHOLDER } from './models';

export function typeLabel(type: Content['type'], plural = false): string {
  if (type === 'MOVIE') return plural ? 'Películas' : 'Película';
  return plural ? 'Series' : 'Serie';
}

/** "2 h 49 min", "4 temporadas"… */
export function lengthLabel(c: Pick<Content, 'type' | 'durationMinutes' | 'seasons'>): string {
  if (c.type === 'SERIES') return `${c.seasons} ${c.seasons === 1 ? 'temporada' : 'temporadas'}`;
  const h = Math.floor(c.durationMinutes / 60);
  const m = c.durationMinutes % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}

export function hasImage(c: Pick<Content, 'imageUrl'>): boolean {
  return !!c.imageUrl && c.imageUrl !== PLACEHOLDER;
}

/** Tono estable (0–359) a partir del texto, para portadas generadas y mosaicos de géneros. */
export function hue(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

/** Porcentaje visto, estimando la duración en segundos (película o capítulo). */
export function progressPercent(c: Content, seconds: number): number {
  const total = Math.max(60, c.durationMinutes * 60);
  return Math.min(100, Math.round((seconds / total) * 100));
}

export function clock(seconds: number): string {
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
}
