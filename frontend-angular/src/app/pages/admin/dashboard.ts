import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { AdminReview, AdminStats } from '../../core/models';
import { Icon } from '../../shared/icon';
import { RatingStars } from '../../shared/rating-stars';

@Component({
  selector: 'app-dashboard',
  imports: [Icon, RatingStars, RouterLink, DatePipe],
  template: `
    @if (error(); as e) {
      <div class="alert error">{{ e }} <button class="btn btn-sm btn-ghost" type="button" (click)="load()">Reintentar</button></div>
    } @else if (stats(); as s) {
      <div class="kpis">
        @for (k of kpis(); track k.label) {
          <div class="kpi card">
            <span class="kpi-icon" [style.--c]="k.color"><app-icon [name]="k.icon" /></span>
            <div><strong>{{ k.value }}</strong><small>{{ k.label }}</small></div>
          </div>
        }
      </div>

      <div class="charts">
        <section class="card panel">
          <h2>Títulos por género</h2>
          <div class="bars">
            @for (g of s.byGenre; track g.genre) {
              <div class="bar-row">
                <span class="name">{{ g.genre }}</span>
                <span class="track"><span [style.width.%]="(g.count / maxGenre()) * 100"></span></span>
                <span class="num">{{ g.count }}</span>
              </div>
            }
          </div>
        </section>

        <section class="card panel">
          <h2>Composición del catálogo</h2>
          <div class="donut-wrap">
            <div class="donut" [style.--p]="moviePct()" role="img" [attr.aria-label]="moviePct() + '% películas'">
              <span><strong>{{ s.movies + s.series }}</strong><small>títulos</small></span>
            </div>
            <ul class="legend">
              <li><i class="a"></i>Películas <strong>{{ s.movies }}</strong></li>
              <li><i class="b"></i>Series <strong>{{ s.series }}</strong></li>
            </ul>
          </div>
        </section>

        <section class="card panel">
          <h2>Mejor calificados</h2>
          @for (t of s.topRated; track t.contentId; let i = $index) {
            <a class="top" [routerLink]="['/titulo', t.contentId]">
              <span class="rank">{{ i + 1 }}</span>
              <span class="top-title">{{ t.title }}</span>
              <app-rating-stars [value]="t.average" [size]="13" />
              <small>{{ t.average.toFixed(1) }} · {{ t.count }}</small>
            </a>
          } @empty { <p class="hint">Todavía no hay reseñas.</p> }
        </section>

        <section class="card panel">
          <div class="head"><h2>Últimas reseñas</h2><a routerLink="/admin/resenas">Moderar</a></div>
          @for (r of latest(); track r.id) {
            <div class="latest">
              <div><strong>{{ r.author }}</strong> en <a [routerLink]="['/titulo', r.contentId]">{{ r.contentTitle }}</a></div>
              <app-rating-stars [value]="r.rating" [size]="12" />
              @if (r.comment) { <p>{{ r.comment }}</p> }
              <small>{{ r.createdAt | date: 'd MMM, HH:mm' }}</small>
            </div>
          } @empty { <p class="hint">Sin actividad todavía.</p> }
        </section>
      </div>
    } @else {
      <div class="kpis">@for (n of [1, 2, 3, 4, 5, 6]; track n) { <div class="skeleton" style="height: 88px"></div> }</div>
    }
  `,
  styles: `
    .kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
    .kpi { display: flex; align-items: center; gap: 14px; padding: 18px; }
    .kpi-icon { width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); }
    .kpi strong { display: block; font-family: var(--display); font-size: 26px; line-height: 1.1; }
    .kpi small { color: var(--muted); }
    .charts { display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; margin-top: 16px; }
    .panel { padding: 22px; display: grid; gap: 12px; align-content: start; }
    .panel h2 { font-size: 16px; }
    .head { display: flex; justify-content: space-between; align-items: center; }
    .head a { color: var(--accent-hover); font-size: 13px; font-weight: 700; }
    .bars { display: grid; gap: 10px; }
    .bar-row { display: grid; grid-template-columns: 110px 1fr 28px; gap: 10px; align-items: center; font-size: 13px; }
    .name { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track { height: 12px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
    .track span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--accent-hover)); transition: width .6s; }
    .num { text-align: right; font-weight: 700; }
    .donut-wrap { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
    .donut { --p: 50; width: 150px; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(var(--accent) calc(var(--p) * 1%), var(--gold) 0); }
    .donut span { width: 104px; aspect-ratio: 1; border-radius: 50%; background: var(--surface); display: grid; place-content: center; text-align: center; }
    .donut strong { font-family: var(--display); font-size: 26px; line-height: 1; }
    .donut small { color: var(--muted); }
    .legend { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    .legend li { display: flex; align-items: center; gap: 8px; }
    .legend i { width: 12px; height: 12px; border-radius: 4px; }
    .legend .a { background: var(--accent); } .legend .b { background: var(--gold); }
    .legend strong { margin-left: 6px; }
    .top { display: grid; grid-template-columns: 26px 1fr auto auto; gap: 10px; align-items: center; padding: 8px; border-radius: 10px; }
    .top:hover { background: var(--surface-2); }
    .rank { width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-hover); font-weight: 800; font-size: 12px; }
    .top-title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .top small { color: var(--muted); font-size: 12px; }
    .latest { display: grid; gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
    .latest:last-child { border-bottom: 0; }
    .latest a { color: var(--accent-hover); }
    .latest p { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .latest small { color: var(--muted); font-size: 11px; }
    @media (max-width: 1000px) { .charts { grid-template-columns: 1fr; } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly api = inject(ApiService);
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly reviews = signal<AdminReview[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly kpis = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: 'Películas', value: s.movies, icon: 'film', color: '#4e89ff' },
      { label: 'Series', value: s.series, icon: 'tv', color: '#a879ff' },
      { label: 'Géneros', value: s.genres, icon: 'grid', color: '#3ccf8e' },
      { label: 'Usuarios', value: s.users, icon: 'users', color: '#fa974e' },
      { label: 'Reseñas', value: s.reviews, icon: 'star', color: '#f5c04e' },
      { label: 'Guardados en listas', value: s.savedItems, icon: 'bookmark', color: '#ff5d8f' },
    ];
  });
  protected readonly maxGenre = computed(() => Math.max(1, ...(this.stats()?.byGenre.map((g) => g.count) ?? [1])));
  protected readonly moviePct = computed(() => {
    const s = this.stats();
    const total = (s?.movies ?? 0) + (s?.series ?? 0);
    return total ? Math.round(((s?.movies ?? 0) / total) * 100) : 50;
  });
  protected readonly latest = computed(() => this.reviews().slice(0, 5));

  constructor() {
    this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      const [stats, reviews] = await Promise.all([firstValueFrom(this.api.stats()), firstValueFrom(this.api.adminReviews())]);
      this.stats.set(stats);
      this.reviews.set(reviews);
    } catch (e) {
      this.error.set(errorMessage(e));
    }
  }
}
