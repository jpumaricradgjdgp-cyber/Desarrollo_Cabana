import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Exige que dos campos del grupo coincidan (contraseña y confirmación). */
export function matchFields(field: string, confirm: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = group.get(field)?.value;
    const b = group.get(confirm)?.value;
    return a && b && a !== b ? { mismatch: true } : null;
  };
}

/** Contraseña con al menos una letra y un número (además de minLength 8 del backend). */
export const passwordStrength: ValidatorFn = (control) => {
  const v: string = control.value ?? '';
  if (!v) return null;
  return /[A-Za-zÀ-ÿ]/.test(v) && /\d/.test(v) ? null : { weak: true };
};

/** Imagen local (/assets/…) o URL HTTPS, igual que la regla del backend. */
export const imageUrl: ValidatorFn = (control) => {
  const v: string = (control.value ?? '').trim();
  if (!v) return null;
  if (v.startsWith('/assets/') && !v.includes('..')) return null;
  try {
    const url = new URL(v);
    return url.protocol === 'https:' ? null : { imageUrl: true };
  } catch {
    return { imageUrl: true };
  }
};

/** Ruta en el bucket de videos: letras, números, guiones, barras y extensión. */
export const videoPath: ValidatorFn = (control) => {
  const v: string = (control.value ?? '').trim();
  return !v || /^[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+$/.test(v) ? null : { videoPath: true };
};

/** Puntaje 0–4 para el medidor de seguridad de contraseña. */
export function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

/** Primer mensaje de error legible para un control. */
export function fieldError(control: AbstractControl | null, label = 'Este campo'): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['required']) return `Completa este campo (${label.replace(/^(El|La|Las|Los) /, '').toLowerCase()}).`;
  if (e['email']) return 'Escribe un correo válido.';
  if (e['minlength']) return `Usa al menos ${e['minlength'].requiredLength} caracteres.`;
  if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
  if (e['min']) return `El mínimo es ${e['min'].min}.`;
  if (e['max']) return `El máximo es ${e['max'].max}.`;
  if (e['weak']) return 'Incluye al menos una letra y un número.';
  if (e['imageUrl']) return 'Usa una URL HTTPS o una ruta /assets/…';
  if (e['videoPath']) return 'Ejemplo válido: peliculas/mi-video.mp4';
  if (e['pattern']) return 'El formato no es válido.';
  return 'Revisa este campo.';
}
