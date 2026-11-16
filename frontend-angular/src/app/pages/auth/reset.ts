import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { recoveryFromHash } from '../../core/format';
import { fieldError, matchFields, passwordScore, passwordStrength } from '../../core/validators';
import { Icon } from '../../shared/icon';

/** Paso 2 de la recuperación: Supabase redirige aquí con #access_token=…&type=recovery. */
@Component({
  selector: 'app-reset',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <section class="narrow card">
      <span class="badge-icon"><app-icon name="shield" [size]="26" /></span>
      <h1>Crea una nueva contraseña</h1>
      @if (done(); as message) {
        <div class="alert success" role="status">{{ message }}</div>
        <a class="btn btn-primary btn-block" routerLink="/login">Iniciar sesión</a>
      } @else if (!token) {
        <div class="alert error" role="alert">{{ linkError || 'El enlace no es válido o ya se usó.' }} Pide uno nuevo.</div>
        <a class="btn btn-primary btn-block" routerLink="/recuperar">Pedir otro enlace</a>
      } @else {
        <p class="sub">Elige una contraseña que no hayas usado antes.</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) { <div class="alert error" role="alert">{{ error() }}</div> }
          <label class="field">
            <span>Nueva contraseña</span>
            <input class="input" type="password" formControlName="password" autocomplete="new-password" [class.invalid]="err('password', 'La contraseña')" />
            <span class="meter" [attr.data-score]="score()" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
            @if (err('password', 'La contraseña'); as m) { <small class="error-text">{{ m }}</small> }
          </label>
          <label class="field">
            <span>Repite la contraseña</span>
            <input class="input" type="password" formControlName="confirm" autocomplete="new-password" [class.invalid]="mismatch()" />
            @if (mismatch()) { <small class="error-text">Las contraseñas no coinciden.</small> }
          </label>
          <button class="btn btn-primary btn-lg btn-block" type="submit" [disabled]="loading()">{{ loading() ? 'Guardando…' : 'Guardar contraseña' }}</button>
        </form>
      }
    </section>
  `,
  styleUrl: './narrow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPage {
  private readonly api = inject(ApiService);
  protected readonly token: string | null;
  protected readonly linkError: string | null;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal<string | null>(null);

  protected readonly form = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72), passwordStrength] }),
      confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: matchFields('password', 'confirm') },
  );
  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly score = computed(() => passwordScore(this.value().password ?? ''));
  protected readonly mismatch = computed(() => (this.value(), this.form.hasError('mismatch') && this.form.controls.confirm.touched));

  constructor() {
    const { token, error } = recoveryFromHash(window.location.hash);
    this.token = token;
    this.linkError = error ? (/expired|invalid/i.test(error) ? 'El enlace venció o ya se usó.' : 'El enlace no es válido.') : null;
    // Quita el token de la barra de direcciones para que no quede en el historial.
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
  }

  protected err(name: 'password' | 'confirm', label: string): string | null {
    return fieldError(this.form.controls[name], label);
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.token) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.done.set((await firstValueFrom(this.api.resetPassword(this.token, this.form.controls.password.value))).message);
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo guardar la contraseña.'));
    } finally {
      this.loading.set(false);
    }
  }
}
