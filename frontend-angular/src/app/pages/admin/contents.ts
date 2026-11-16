import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { lengthLabel } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { AGE_RATINGS, AdminContent, AgeRating, ContentInput, ContentType, PLACEHOLDER, POSTER_LIBRARY } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/toast.service';
import { fieldError, imageUrl, videoPath } from '../../core/validators';
import { Icon } from '../../shared/icon';
import { Poster } from '../../shared/poster';
import { RatingStars } from '../../shared/rating-stars';

const PAGE_SIZE = 8;

/** Convierte WebP/AVIF/GIF a JPEG en el navegador; la API solo acepta JPG o PNG. */
async function toUploadable(file: File): Promise<{ blob: Blob; name: string }> {
  if (file.type === 'image/jpeg' || file.type === 'image/png') return { blob: file, name: file.name };
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('canvas'))), 'image/jpeg', 0.9));
  return { blob, name: file.name.replace(/\.\w+$/, '') + '.jpg' };
}

@Component({
  selector: 'app-admin-contents',
  imports: [ReactiveFormsModule, RouterLink, Icon, Poster, RatingStars],
  templateUrl: './contents.html',
  styleUrl: './contents.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentsPage {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly catalog = inject(CatalogService);
  protected readonly library = inject(LibraryService);

  protected readonly items = signal<AdminContent[]>([]);
  protected readonly genres = signal<string[]>([]);
  protected readonly loading = signal(true);
  protected readonly q = signal('');
  protected readonly type = signal<'' | ContentType>('');
  protected readonly page = signal(1);
  protected readonly editing = signal<AdminContent | 'new' | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly dragging = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly ratings = AGE_RATINGS;
  protected readonly posters = POSTER_LIBRARY;
  protected readonly lengthLabel = lengthLabel;

  protected readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.items().filter((c) => (!this.type() || c.type === this.type()) && (!q || `${c.title} ${c.genre}`.toLowerCase().includes(q)));
  });
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly visible = computed(() => {
    const page = Math.min(this.page(), this.pages());
    return this.filtered().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  });

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    type: new FormControl<ContentType>('MOVIE', { nonNullable: true }),
    releaseYear: new FormControl(new Date().getFullYear(), { nonNullable: true, validators: [Validators.required, Validators.min(1888), Validators.max(2100)] }),
    durationMinutes: new FormControl(90, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(1500)] }),
    seasons: new FormControl(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(100)] }),
    genre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    imageUrl: new FormControl(PLACEHOLDER, { nonNullable: true, validators: [Validators.required, Validators.maxLength(1000), imageUrl] }),
    videoPath: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(1000), videoPath] }),
    featured: new FormControl(false, { nonNullable: true }),
    ageRating: new FormControl<AgeRating>('13+', { nonNullable: true }),
  });

  constructor() {
    this.load();
    // Las series necesitan al menos una temporada; las películas, 0.
    this.form.controls.type.valueChanges.subscribe((type) => {
      const seasons = this.form.controls.seasons;
      seasons.setValidators(type === 'SERIES' ? [Validators.required, Validators.min(1), Validators.max(100)] : [Validators.min(0), Validators.max(0)]);
      seasons.setValue(type === 'SERIES' ? Math.max(1, seasons.value) : 0);
    });
  }

  private async load(): Promise<void> {
    try {
      const [items, genres] = await Promise.all([firstValueFrom(this.api.adminCatalog()), firstValueFrom(this.api.genres())]);
      this.items.set(items);
      this.genres.set(genres);
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.loading.set(false);
    }
  }

  protected err(name: keyof typeof this.form.controls, label: string): string | null {
    return fieldError(this.form.controls[name], label);
  }

  protected open(item: AdminContent | 'new'): void {
    this.formError.set(null);
    if (item === 'new') {
      this.form.reset();
      this.form.controls.genre.setValue(this.genres()[0] ?? '');
    } else {
      this.form.reset({ ...item, videoPath: item.videoPath ?? '' });
    }
    this.editing.set(item);
  }

  protected close(): void {
    if (!this.saving()) this.editing.set(null);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.formError.set('Revisa los campos marcados en rojo.');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    const raw = this.form.getRawValue();
    const input: ContentInput = { ...raw, title: raw.title.trim(), videoPath: raw.videoPath.trim() || null };
    const current = this.editing();
    try {
      if (current === 'new') await firstValueFrom(this.api.createContent(input));
      else if (current) await firstValueFrom(this.api.updateContent(current.id, input));
      this.toast.show(current === 'new' ? `«${input.title}» se agregó al catálogo` : 'Cambios guardados', 'success');
      this.saving.set(false);
      this.editing.set(null);
      await Promise.all([this.load(), this.catalog.reload()]);
    } catch (e) {
      this.formError.set(errorMessage(e));
      this.saving.set(false);
    }
  }

  protected async remove(item: AdminContent): Promise<void> {
    const ok = await this.confirm.ask(
      `¿Eliminar «${item.title}»?`,
      'También se quitará de las listas, el progreso y las reseñas de los usuarios. No se puede deshacer.',
      'Eliminar',
    );
    if (!ok) return;
    try {
      await firstValueFrom(this.api.deleteContent(item.id));
      this.items.update((list) => list.filter((c) => c.id !== item.id));
      this.toast.show(`«${item.title}» se eliminó`, 'success');
      this.catalog.reload();
      this.library.loadUserData();
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }

  protected async toggleFeatured(item: AdminContent): Promise<void> {
    const { id, ...rest } = item;
    try {
      await firstValueFrom(this.api.updateContent(id, { ...rest, featured: !item.featured }));
      this.items.update((list) => list.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c)));
      this.catalog.reload();
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }

  protected pickLibrary(select: HTMLSelectElement): void {
    if (!select.value) return;
    this.form.controls.imageUrl.setValue(select.value);
    this.form.controls.imageUrl.markAsDirty();
    select.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.upload(file);
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
    input.value = '';
  }

  private async upload(file: File): Promise<void> {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      this.toast.show('Elige una imagen JPG, PNG, WebP o AVIF.', 'error');
      return;
    }
    this.uploading.set(true);
    try {
      const { blob, name } = await toUploadable(file);
      if (blob.size > 5 * 1024 * 1024) throw new Error('La portada debe pesar como máximo 5 MB.');
      const { imageUrl } = await firstValueFrom(this.api.uploadImage(blob, name));
      this.form.controls.imageUrl.setValue(imageUrl);
      this.form.controls.imageUrl.markAsDirty();
      this.toast.show('Portada subida', 'success');
    } catch (e) {
      this.toast.show(e instanceof Error && !('status' in e) ? e.message : errorMessage(e), 'error');
    } finally {
      this.uploading.set(false);
    }
  }
}
