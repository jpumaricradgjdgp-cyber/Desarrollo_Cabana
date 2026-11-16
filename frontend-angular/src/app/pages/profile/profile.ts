import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { LibraryService } from '../../core/library.service';
import { MyReview, ProfileStats } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/toast.service';
import { fieldError, matchFields, passwordScore, passwordStrength } from '../../core/validators';
import { Icon } from '../../shared/icon';
import { Poster } from '../../shared/poster';
import { RatingStars } from '../../shared/rating-stars';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon, Poster, RatingStars],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly library = inject(LibraryService);
  protected readonly auth = inject(AuthService);

  protected readonly stats = signal<ProfileStats | null>(null);
  protected readonly reviews = signal<MyReview[]>([]);
  protected readonly savingName = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly nameForm = new FormControl(this.auth.user()?.name ?? '', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(80)],
  });
  protected readonly passwordForm = new FormGroup(
    {
      current: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72), passwordStrength] }),
      confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: matchFields('password', 'confirm') },
  );
  private readonly pwd = toSignal(this.passwordForm.valueChanges, { initialValue: this.passwordForm.getRawValue() });
  protected readonly score = computed(() => passwordScore(this.pwd().password ?? ''));
  protected readonly mismatch = computed(() => (this.pwd(), this.passwordForm.hasError('mismatch') && this.passwordForm.controls.confirm.touched));

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      const [stats, reviews] = await Promise.all([firstValueFrom(this.api.myStats()), firstValueFrom(this.api.myReviews())]);
      this.stats.set(stats);
      this.reviews.set(reviews);
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }

  protected nameError(): string | null {
    return fieldError(this.nameForm, 'El nombre');
  }
  protected pwdError(name: 'current' | 'password' | 'confirm', label: string): string | null {
    return fieldError(this.passwordForm.controls[name], label);
  }

  protected async saveName(): Promise<void> {
    this.nameForm.markAsTouched();
    if (this.nameForm.invalid || this.nameForm.value.trim() === this.auth.user()?.name) return;
    this.savingName.set(true);
    try {
      this.auth.setProfile(await firstValueFrom(this.api.rename(this.nameForm.value.trim())));
      this.toast.show('Nombre actualizado', 'success');
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.savingName.set(false);
    }
  }

  protected async savePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    this.passwordError.set(null);
    const { current, password } = this.passwordForm.getRawValue();
    try {
      await firstValueFrom(this.api.changePassword(current, password));
      this.passwordForm.reset();
      this.toast.show('Tu contraseña se actualizó', 'success');
    } catch (e) {
      this.passwordError.set(errorMessage(e, 'No se pudo cambiar la contraseña.'));
    } finally {
      this.savingPassword.set(false);
    }
  }

  protected async deleteReview(r: MyReview): Promise<void> {
    if (!(await this.confirm.ask('¿Eliminar tu reseña?', `Se borrará tu reseña de «${r.content.title}».`, 'Eliminar'))) return;
    try {
      await firstValueFrom(this.api.deleteMyReview(r.content.id));
      this.reviews.update((list) => list.filter((x) => x.id !== r.id));
      this.stats.update((s) => (s ? { ...s, reviews: s.reviews - 1 } : s));
      this.library.loadRatings();
      this.toast.show('Reseña eliminada', 'success');
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }
}
