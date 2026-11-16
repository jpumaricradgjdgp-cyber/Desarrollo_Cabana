import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fieldError, imageUrl, matchFields, passwordScore, passwordStrength, videoPath } from './validators';
import { clock, lengthLabel, progressPercent } from './format';
import { Content } from './models';

describe('validadores de formularios', () => {
  it('exige que la contraseña y su confirmación coincidan', () => {
    const group = new FormGroup(
      { password: new FormControl('Clave1234'), confirm: new FormControl('Otra1234') },
      { validators: matchFields('password', 'confirm') },
    );
    expect(group.hasError('mismatch')).toBe(true);
    group.controls.confirm.setValue('Clave1234');
    expect(group.hasError('mismatch')).toBe(false);
  });

  it('pide letras y números en la contraseña', () => {
    expect(passwordStrength(new FormControl('solamenteletras'))).toEqual({ weak: true });
    expect(passwordStrength(new FormControl('12345678'))).toEqual({ weak: true });
    expect(passwordStrength(new FormControl('Cabana2026'))).toBeNull();
    expect(passwordScore('Cabana2026!xyz')).toBe(4);
  });

  it('acepta portadas HTTPS o /assets/ y rechaza otras', () => {
    expect(imageUrl(new FormControl('/assets/dark.jpg'))).toBeNull();
    expect(imageUrl(new FormControl('https://cdn.test/a.jpg'))).toBeNull();
    expect(imageUrl(new FormControl('http://inseguro.test/a.jpg'))).toEqual({ imageUrl: true });
    expect(imageUrl(new FormControl('javascript:alert(1)'))).toEqual({ imageUrl: true });
    expect(imageUrl(new FormControl('/assets/../secreto'))).toEqual({ imageUrl: true });
  });

  it('valida la ruta del video igual que el backend', () => {
    expect(videoPath(new FormControl('peliculas/demo.mp4'))).toBeNull();
    expect(videoPath(new FormControl(''))).toBeNull();
    expect(videoPath(new FormControl('../etc/passwd'))).toEqual({ videoPath: true });
  });

  it('muestra mensajes en español solo después de tocar el campo', () => {
    const control = new FormControl('', Validators.required);
    expect(fieldError(control, 'El título')).toBeNull();
    control.markAsTouched();
    expect(fieldError(control, 'El título')).toContain('título');
  });
});

describe('formato', () => {
  const movie = { type: 'MOVIE', durationMinutes: 169, seasons: 0 } as Content;
  it('describe la duración de películas y series', () => {
    expect(lengthLabel(movie)).toBe('2 h 49 min');
    expect(lengthLabel({ type: 'SERIES', durationMinutes: 50, seasons: 1 })).toBe('1 temporada');
  });
  it('calcula el porcentaje visto y el reloj', () => {
    expect(progressPercent(movie, 169 * 30)).toBe(50);
    expect(clock(3725)).toBe('1:02:05');
  });
});
