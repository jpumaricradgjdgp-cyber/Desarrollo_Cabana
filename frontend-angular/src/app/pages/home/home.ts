import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { ConfigService } from '../../core/config.service';
import { hasImage, hue, lengthLabel, progressPercent, typeLabel } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Content } from '../../core/models';
import { ThemeService } from '../../core/theme.service';
import { ContentCard } from '../../shared/content-card';
import { Icon } from '../../shared/icon';
import { Poster } from '../../shared/poster';
import { ScrollRow } from '../../shared/scroll-row';

@Component({
  selector: 'app-home',
  imports: [RouterLink, UpperCasePipe, ContentCard, Icon, Poster, ScrollRow],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly catalog = inject(CatalogService);
  protected readonly library = inject(LibraryService);
  protected readonly auth = inject(AuthService);
  protected readonly config = inject(ConfigService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly slide = signal(0);
  protected readonly halloweenDismissed = signal(false);
  protected readonly typeLabel = typeLabel;
  protected readonly lengthLabel = lengthLabel;
  protected readonly hasImage = hasImage;
  protected readonly hue = hue;
  protected readonly percent = progressPercent;
  protected readonly Math = Math;

  protected readonly current = computed(() => this.catalog.featured()[this.slide() % Math.max(1, this.catalog.featured().length)]);
  protected readonly topRated = computed(() => {
    const ratings = this.library.ratings();
    return this.catalog
      .items()
      .filter((c) => ratings.has(c.id))
      .sort((a, b) => ratings.get(b.id)!.average - ratings.get(a.id)!.average || ratings.get(b.id)!.count - ratings.get(a.id)!.count)
      .slice(0, 10);
  });
  protected readonly continueWatching = computed(() =>
    this.library.progress().filter((p) => progressPercent(p.content, p.seconds) < 98).slice(0, 10),
  );
  protected readonly showHalloween = computed(
    () => this.config.config().halloweenSeason && this.theme.theme() !== 'halloween' && !this.halloweenDismissed(),
  );

  constructor() {
    this.catalog.ensure();
    const timer = setInterval(() => this.next(), 8000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected next(step = 1): void {
    const total = this.catalog.featured().length || 1;
    this.slide.update((s) => (s + step + total) % total);
  }

  protected play(content: Content): void {
    this.router.navigate(this.auth.isLoggedIn() ? ['/ver', content.id] : ['/login'], {
      queryParams: this.auth.isLoggedIn() ? {} : { volver: `/ver/${content.id}` },
    });
  }
}
