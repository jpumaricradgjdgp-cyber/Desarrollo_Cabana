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

/**
 * Porcentaje visto. Usa la duración real de lo reproducido (tráiler o video) cuando se conoce;
 * si no, la estima con la duración del título.
 */
export function progressPercent(c: Content, seconds: number, totalSeconds?: number | null): number {
  const total = totalSeconds && totalSeconds > 0 ? totalSeconds : Math.max(60, c.durationMinutes * 60);
  return Math.min(100, Math.round((seconds / total) * 100));
}

export function clock(seconds: number): string {
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** ID de 11 caracteres de un enlace de YouTube, o null si el enlace no es válido. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.trim().match(/^https:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&].*)?$/);
  return match ? match[1]! : null;
}

/** Lee el fragmento (#access_token=…&type=recovery) que agrega Supabase al enlace del correo. */
export function recoveryFromHash(hash: string): { token: string | null; error: string | null } {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const error = params.get('error_description') ?? params.get('error');
  const token = params.get('access_token');
  return { token: token && (params.get('type') === 'recovery' || !params.get('type')) ? token : null, error: error ? error.replace(/\+/g, ' ') : null };
}

/** "hace 5 min", "ayer", "hace 3 días"… */
export function timeAgo(iso: string | undefined, now = Date.now()): string {
  if (!iso) return '';
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}
