import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { clock, hasImage, hue, lengthLabel, progressPercent, typeLabel, youtubeId } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Content, Episode, ReviewSummary } from '../../core/models';
import { ConfirmService, ToastService } from '../../core/toast.service';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';
import { Poster } from '../../shared/poster';
import { RatingStars } from '../../shared/rating-stars';
import { TrailerModal } from '../../shared/trailer-modal';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, ContentCard, Icon, Poster, RatingStars, TrailerModal],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly title = inject(Title);
  protected readonly auth = inject(AuthService);
  protected readonly library = inject(LibraryService);
  protected readonly catalog = inject(CatalogService);

  readonly id = input.required<string>();
  protected readonly content = signal<Content | null>(null);
  protected readonly notFound = signal(false);
  protected readonly reviews = signal<ReviewSummary | null>(null);
  protected readonly saving = signal(false);
  protected readonly editing = signal(false);
  protected readonly episodes = signal<Episode[]>([]);
  protected readonly season = signal(1);
  protected readonly showTrailer = signal(false);
  protected readonly hasTrailer = computed(() => !!youtubeId(this.content()?.trailerUrl));
  protected readonly seasons = computed(() => [...new Set(this.episodes().map((e) => e.season))].sort((a, b) => a - b));
  protected readonly seasonEpisodes = computed(() => this.episodes().filter((e) => e.season === this.season()));

  protected readonly form = new FormGroup({
    rating: new FormControl(0, { nonNullable: true, validators: [Validators.min(1), Validators.max(5)] }),
    comment: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });

  protected readonly typeLabel = typeLabel;
  protected readonly lengthLabel = lengthLabel;
  protected readonly hasImage = hasImage;
  protected readonly hue = hue;
  protected readonly clock = clock;
  protected readonly mine = computed(() => this.reviews()?.reviews.find((r) => r.mine) ?? null);
  protected readonly others = computed(() => this.reviews()?.reviews.filter((r) => !r.mine) ?? []);
  protected readonly resumeAt = computed(() => this.library.progressById().get(this.id()) ?? 0);
  protected readonly percent = computed(() => {
    const c = this.content();
    const p = this.library.progress().find((x) => x.content.id === this.id());
    return c && p && p.seconds ? progressPercent(c, p.seconds, p.totalSeconds) : 0;
  });
  protected readonly related = computed(() => {
    const c = this.content();
    if (!c) return [];
    const same = this.catalog.items().filter((x) => x.id !== c.id && x.genre === c.genre);
    const more = this.catalog.items().filter((x) => x.id !== c.id && x.genre !== c.genre && x.type === c.type);
    return [...same, ...more].slice(0, 6);
  });
  /** Distribución de estrellas 5→1 para las barras del resumen. */
  protected readonly distribution = computed(() => {
    const list = this.reviews()?.reviews ?? [];
    return [5, 4, 3, 2, 1].map((n) => {
      const count = list.filter((r) => r.rating === n).length;
      return { n, count, pct: list.length ? (count / list.length) * 100 : 0 };
    });
  });

  constructor() {
    this.catalog.ensure();
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  private async load(id: string): Promise<void> {
    this.content.set(this.catalog.byId(id) ?? null);
    this.notFound.set(false);
    this.reviews.set(null);
    this.editing.set(false);
    this.episodes.set([]);
    this.showTrailer.set(false);
    try {
      const content = await firstValueFrom(this.api.content(id));
      this.content.set(content);
      this.title.setTitle(`${content.title} · Cabaña`);
    } catch {
      this.notFound.set(true);
      return;
    }
    if (this.content()?.type === 'SERIES') this.loadEpisodes(id);
    await this.loadReviews();
  }

  private async loadEpisodes(id: string): Promise<void> {
    try {
      const list = await firstValueFrom(this.api.episodes(id));
      this.episodes.set(list);
      this.season.set(list[0]?.season ?? 1);
    } catch {
      this.episodes.set([]);
    }
  }

  private async loadReviews(): Promise<void> {
    try {
      const summary = await firstValueFrom(this.api.reviews(this.id()));
      this.reviews.set(summary);
      const mine = summary.reviews.find((r) => r.mine);
      this.form.reset({ rating: mine?.rating ?? 0, comment: mine?.comment ?? '' });
    } catch {
      this.reviews.set({ average: 0, count: 0, reviews: [] });
    }
  }

  protected play(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { volver: `/ver/${this.id()}` } });
      return;
    }
    this.router.navigate(['/ver', this.id()]);
  }

  protected async submit(): Promise<void> {
    const { rating, comment } = this.form.getRawValue();
    if (rating < 1) {
      this.form.controls.rating.markAsTouched();
      this.toast.show('Elige de 1 a 5 estrellas.', 'error');
      return;
    }
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.putReview(this.id(), rating, comment));
      this.toast.show(this.mine() ? 'Actualizaste tu reseña' : '¡Gracias por tu reseña!', 'success');
      this.editing.set(false);
      await Promise.all([this.loadReviews(), this.library.loadRatings()]);
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(): Promise<void> {
    if (!(await this.confirm.ask('¿Eliminar tu reseña?', 'Tu calificación dejará de contar en el promedio.', 'Eliminar'))) return;
    try {
      await firstValueFrom(this.api.deleteMyReview(this.id()));
      this.toast.show('Eliminaste tu reseña', 'success');
      await Promise.all([this.loadReviews(), this.library.loadRatings()]);
    } catch (e) {
      this.toast.show(errorMessage(e), 'error');
    }
  }

  protected initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  }
}
