import { ChangeDetectionStrategy, Component, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Estrellas de 1 a 5. En modo lectura muestra el promedio (admite medias estrellas);
 * en modo edición funciona como control de formulario (ControlValueAccessor).
 */
@Component({
  selector: 'app-rating-stars',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingStars), multi: true }],
  template: `
    @if (editable()) {
      <div class="stars edit" role="radiogroup" aria-label="Tu calificación" (mouseleave)="hover.set(0)">
        @for (n of five; track n) {
          <button type="button" role="radio" [attr.aria-checked]="value() === n" [attr.aria-label]="n + (n === 1 ? ' estrella' : ' estrellas')"
            [class.on]="n <= (hover() || value())" (mouseenter)="hover.set(n)" (click)="pick(n)" [disabled]="disabled()">
            <svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/></svg>
          </button>
        }
        <span class="label">{{ labels[(hover() || value())] }}</span>
      </div>
    } @else {
      <span class="stars" [attr.aria-label]="'Calificación ' + value() + ' de 5'" [style.--size.px]="size()">
        @for (n of five; track n) {
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path class="bg" d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/>
            <path class="fg" [style.clip-path]="'inset(0 ' + (100 - fill(n)) + '% 0 0)'" d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/>
          </svg>
        }
      </span>
    }
  `,
  styles: `
    :host { display: inline-flex; }
    .stars { display: inline-flex; align-items: center; gap: 2px; }
    svg { width: var(--size, 16px); height: var(--size, 16px); }
    .bg { fill: var(--surface-3); }
    .fg { fill: var(--gold); }
    .edit { gap: 4px; }
    .edit button { padding: 2px; border-radius: 6px; }
    .edit svg { width: 30px; height: 30px; fill: var(--surface-3); transition: fill .12s, transform .12s; }
    .edit button.on svg { fill: var(--gold); }
    .edit button:hover svg { transform: scale(1.12); }
    .label { margin-left: 8px; color: var(--muted); font-size: 13px; min-width: 80px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStars implements ControlValueAccessor {
  readonly value = model(0);
  readonly editable = input(false);
  readonly size = input(16);
  protected readonly hover = signal(0);
  protected readonly disabled = signal(false);
  protected readonly five = [1, 2, 3, 4, 5];
  protected readonly labels = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', '¡Excelente!'];
  private onChange: (v: number) => void = () => {};
  private onTouched: () => void = () => {};

  protected fill(n: number): number {
    return Math.max(0, Math.min(1, this.value() - (n - 1))) * 100;
  }

  protected pick(n: number): void {
    this.value.set(n);
    this.onChange(n);
    this.onTouched();
  }

  writeValue(v: number | null): void {
    this.value.set(v ?? 0);
  }
  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled.set(d);
  }
}
