import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { fieldError } from '../../core/validators';
import { Icon } from '../../shared/icon';

/** Paso 1 de la recuperación: pedir el enlace por correo. */
@Component({
  selector: 'app-forgot',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <section class="narrow card">
      <span class="badge-icon"><app-icon name="shield" [size]="26" /></span>
      <h1>¿Olvidaste tu contraseña?</h1>
      <p class="sub">Escribe tu correo y te enviaremos un enlace para crear una nueva.</p>
      @if (sent(); as message) {
        <div class="alert success" role="status">{{ message }}</div>
        <a class="btn btn-ghost btn-block" routerLink="/login"><app-icon name="arrow-left" [size]="18" />Volver a iniciar sesión</a>
      } @else {
        <form (ngSubmit)="submit()" novalidate>
          @if (error()) { <div class="alert error" role="alert">{{ error() }}</div> }
          <label class="field">
            <span>Correo electrónico</span>
            <input class="input" type="email" [formControl]="email" autocomplete="email" placeholder="tu@correo.com" [class.invalid]="err()" />
            @if (err(); as m) { <small class="error-text">{{ m }}</small> }
          </label>
          <button class="btn btn-primary btn-lg btn-block" type="submit" [disabled]="loading()">{{ loading() ? 'Enviando…' : 'Enviar enlace' }}</button>
        </form>
        <p class="switch"><a routerLink="/login">Volver a iniciar sesión</a></p>
      }
    </section>
  `,
  styleUrl: './narrow.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPage {
  private readonly api = inject(ApiService);
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);

  protected err(): string | null {
    return fieldError(this.email, 'El correo');
  }

  protected async submit(): Promise<void> {
    this.email.markAsTouched();
    if (this.email.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.sent.set((await firstValueFrom(this.api.forgotPassword(this.email.value.trim()))).message);
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo enviar el enlace.'));
    } finally {
      this.loading.set(false);
    }
  }
}
