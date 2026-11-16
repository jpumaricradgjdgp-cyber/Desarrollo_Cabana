import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { fieldError, matchFields, passwordScore, passwordStrength } from '../../core/validators';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <section class="auth">
      <div class="art">
        <img src="assets/logo.jpg" alt="Cabaña" />
        <h2>Tu refugio para desconectar.</h2>
        <p>Crea tu cuenta gratis y empieza a guardar las historias que quieres ver.</p>
        <ul class="perks">
          <li><app-icon name="bookmark" />Arma tu propia lista</li>
          <li><app-icon name="star" />Califica con estrellas y comenta</li>
          <li><app-icon name="palette" />Elige tu ambiente: Azul noche, Claro o Halloween</li>
        </ul>
      </div>
      <div class="panel">
        <h1>Crear cuenta</h1>
        <p class="sub">Solo te tomará un minuto.</p>
        @if (done(); as message) {
          <div class="alert success" role="status">{{ message }}</div>
          <p class="switch"><a routerLink="/login">Ir a iniciar sesión</a></p>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (error()) { <div class="alert error" role="alert">{{ error() }}</div> }
            <label class="field">
              <span>Nombre</span>
              <input class="input" formControlName="name" autocomplete="name" placeholder="¿Cómo te llamamos?" [class.invalid]="err('name', 'El nombre')" />
              @if (err('name', 'El nombre'); as m) { <small class="error-text">{{ m }}</small> }
            </label>
            <label class="field">
              <span>Correo electrónico</span>
              <input class="input" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com" [class.invalid]="err('email', 'El correo')" />
              @if (err('email', 'El correo'); as m) { <small class="error-text">{{ m }}</small> }
            </label>
            <label class="field">
              <span>Contraseña</span>
              <span class="pwd">
                <input class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" [class.invalid]="err('password', 'La contraseña')" />
                <button class="eye" type="button" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  <app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="18" />
                </button>
              </span>
              <span class="meter" [attr.data-score]="score()" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
              @if (err('password', 'La contraseña'); as m) { <small class="error-text">{{ m }}</small> }
              @else { <small class="hint">Mínimo 8 caracteres, con letras y números.</small> }
            </label>
            <label class="field">
              <span>Confirmar contraseña</span>
              <input class="input" [type]="show() ? 'text' : 'password'" formControlName="confirm" autocomplete="new-password"
                [class.invalid]="mismatch() || err('confirm', 'La confirmación')" />
              @if (mismatch()) { <small class="error-text">Las contraseñas no coinciden.</small> }
              @else if (err('confirm', 'La confirmación'); as m) { <small class="error-text">{{ m }}</small> }
            </label>
            <button class="btn btn-primary btn-lg btn-block" type="submit" [disabled]="loading()">
              {{ loading() ? 'Creando tu cuenta…' : 'Crear cuenta' }}
            </button>
          </form>
          <p class="switch">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
        }
      </div>
    </section>
  `,
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal<string | null>(null);
  protected readonly show = signal(false);

  protected readonly form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email, Validators.maxLength(254)] }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72), passwordStrength],
      }),
      confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: matchFields('password', 'confirm') },
  );

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly score = computed(() => passwordScore(this.value().password ?? ''));
  protected readonly mismatch = computed(() => {
    this.value();
    return this.form.hasError('mismatch') && this.form.controls.confirm.touched;
  });

  protected err(name: keyof typeof this.form.controls, label: string): string | null {
    return fieldError(this.form.controls[name], label);
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const { name, email, password } = this.form.getRawValue();
      const session = await this.auth.register(name.trim(), email.trim(), password);
      if (session.accessToken) {
        this.toast.show(`¡Bienvenido a la cabaña, ${name.trim()}!`, 'success');
        this.router.navigate(['/inicio']);
      } else {
        this.done.set(session.message);
      }
    } catch (e) {
      this.error.set(errorMessage(e, 'No se pudo crear la cuenta.'));
    } finally {
      this.loading.set(false);
    }
  }
}
