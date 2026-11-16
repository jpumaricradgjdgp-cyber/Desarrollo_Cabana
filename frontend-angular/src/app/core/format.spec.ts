import { FormControl } from '@angular/forms';
import { recoveryFromHash, timeAgo, youtubeId } from './format';
import { optionalText } from './query-param';
import { youtubeUrl } from './validators';

describe('tráileres de YouTube', () => {
  it('extrae el ID de los formatos habituales', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=abcdefghijk')).toBe('abcdefghijk');
    expect(youtubeId('https://youtu.be/abcdefghijk?t=10')).toBe('abcdefghijk');
    expect(youtubeId('https://www.youtube.com/embed/abcdefghijk')).toBe('abcdefghijk');
  });
  it('rechaza enlaces que no son de YouTube o no usan HTTPS', () => {
    expect(youtubeId('https://evil.test/watch?v=abcdefghijk')).toBeNull();
    expect(youtubeId('http://youtu.be/abcdefghijk')).toBeNull();
    expect(youtubeId(null)).toBeNull();
    expect(youtubeUrl(new FormControl('https://vimeo.com/123'))).toEqual({ youtube: true });
    expect(youtubeUrl(new FormControl(''))).toBeNull();
  });
});

describe('enlace de recuperación de Supabase', () => {
  it('lee el token de recuperación', () => {
    expect(recoveryFromHash('#access_token=abc&type=recovery&expires_in=3600')).toEqual({ token: 'abc', error: null });
  });
  it('informa el error cuando el enlace expiró', () => {
    const r = recoveryFromHash('#error=access_denied&error_description=Email+link+is+invalid+or+has+expired');
    expect(r.token).toBeNull();
    expect(r.error).toBe('Email link is invalid or has expired');
  });
  it('ignora tokens que no son de recuperación', () => {
    expect(recoveryFromHash('#access_token=abc&type=signup').token).toBeNull();
  });
});

describe('utilidades', () => {
  it('convierte query params ausentes en texto vacío', () => {
    expect(optionalText(undefined)).toBe('');
    expect(optionalText('/perfil')).toBe('/perfil');
  });
  it('describe hace cuánto se vio algo', () => {
    const now = Date.parse('2026-11-16T12:00:00Z');
    expect(timeAgo('2026-11-16T11:55:00Z', now)).toBe('hace 5 min');
    expect(timeAgo('2026-11-15T12:00:00Z', now)).toBe('ayer');
    expect(timeAgo('2026-11-12T12:00:00Z', now)).toBe('hace 4 días');
  });
});
