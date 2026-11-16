import { HttpErrorResponse } from '@angular/common/http';
import { optionalText } from '../../core/query-param';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ConfigService } from '../../core/config.service';
import { ToastService } from '../../core/toast.service';
import { fieldError } from '../../core/validators';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <section class="auth">
      <div class="art">
        <img src="assets/logo.jpg" alt="Cabaña" />
        <h2>Vuelve a tu lugar favorito.</h2>
        <p>Retoma tus series donde las dejaste y descubre qué está viendo la comunidad.</p>
        <ul class="perks">
          <li><app-icon name="clock" />Continúa viendo en cualquier momento</li>
          <li><app-icon name="bookmark" />Tu lista siempre contigo</li>
          <li><app-icon name="star" />Califica y comenta tus favoritas</li>
        </ul>
      </div>
      <div class="panel">
        <h1>Iniciar sesión</h1>
        <p class="sub">Usa el correo con el que te registraste.</p>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) { <div class="alert error" role="alert">{{ error() }}</div> }
          <label class="field">
            <span>Correo electrónico</span>
            <input class="input" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com"
              [class.invalid]="err('email', 'El correo')" />
            @if (err('email', 'El correo'); as m) { <small class="error-text">{{ m }}</small> }
          </label>
          <label class="field">
            <span>Contraseña</span>
            <span class="pwd">
              <input class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password"
                [class.invalid]="err('password', 'La contraseña')" />
              <button class="eye" type="button" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="18" />
              </button>
            </span>
            @if (err('password', 'La contraseña'); as m) { <small class="error-text">{{ m }}</small> }
          </label>
          <a class="forgot" routerLink="/recuperar">¿Olvidaste tu contraseña?</a>
          <button class="btn btn-primary btn-lg btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando…' : 'Entrar a la cabaña' }}
          </button>
        </form>
        @if (config.config().demo) {
          <div class="demo">
            <p><strong>Modo demostración.</strong> Completa con una cuenta de prueba:</p>
            <div>
              <button class="btn btn-ghost btn-sm" type="button" (click)="fill('admin@cabana.demo')"><app-icon name="shield" [size]="16" />Administrador</button>
              <button class="btn btn-ghost btn-sm" type="button" (click)="fill('usuario@cabana.demo')"><app-icon name="user" [size]="16" />Usuario</button>
            </div>
          </div>
        }
        <p class="switch">¿Aún no tienes cuenta? <a routerLink="/registro">Regístrate gratis</a></p>
      </div>
    </section>
  `,
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly config = inject(ConfigService);
  /** Ruta a la que volver después de iniciar sesión (?volver=). */
  readonly volver = input('', { transform: optionalText });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly show = signal(false);

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72)] }),
  });

  protected err(name: 'email' | 'password', label: string): string | null {
    return fieldError(this.form.controls[name], label);
  }

  protected fill(email: string): void {
    this.form.setValue({ email, password: 'Cabana2026!' });
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email.trim(), password);
    } catch (e) {
      // Solo un error HTTP del servidor describe un problema de credenciales.
      if (!(e instanceof HttpErrorResponse)) console.error(e);
      this.error.set(
        e instanceof HttpErrorResponse
          ? errorMessage(e, 'No se pudo iniciar sesión. Inténtalo de nuevo.')
          : 'Ocurrió un error inesperado al iniciar sesión. Recarga la página e inténtalo de nuevo.',
      );
      this.loading.set(false);
      return;
    }
    this.loading.set(false);
    this.toast.show(`¡Hola, ${this.auth.user()?.name}! Bienvenido de vuelta.`, 'success');
    const target = this.volver();
    this.router.navigateByUrl(target.startsWith('/') && !target.startsWith('//') ? target : '/inicio');
  }
}
