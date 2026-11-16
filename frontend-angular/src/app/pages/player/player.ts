import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, computed, inject, input, signal, viewChild } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { clock, youtubeId } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Content, Playback } from '../../core/models';
import { Icon } from '../../shared/icon';

/**
 * Reproductor a pantalla completa.
 * - Si el título tiene un video real (Supabase Storage), lo reproduce, reanuda y guarda el progreso cada 10 s.
 * - Si no lo tiene (o es el video de muestra del modo demo) y hay tráiler, reproduce el tráiler oficial de YouTube.
 */
@Component({
  selector: 'app-player',
  imports: [Icon, RouterLink],
  template: `
    <div class="player" [class.with-trailer]="trailer()">
      <div class="top">
        <button class="icon-btn round" type="button" aria-label="Volver" (click)="back()"><app-icon name="arrow-left" /></button>
        <div>
          <small>{{ trailer() ? 'Tráiler oficial' : 'Estás viendo' }}</small>
          <strong>{{ content()?.title ?? 'Cargando…' }}</strong>
        </div>
        @if (trailer() && watchUrl()) {
          <a class="yt-link" [href]="watchUrl()" target="_blank" rel="noopener">¿No se reproduce? Ver en YouTube ↗</a>
        }
      </div>
      @if (trailer(); as url) {
        <!-- YouTube exige identificar el sitio que inserta el video (error 153 si no llega el Referer). -->
        <iframe #yt class="yt" [src]="url" title="Tráiler" referrerpolicy="strict-origin-when-cross-origin" (load)="listenYoutube()"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
        @if (resumedFrom()) {
          <div class="notice">Continuando desde {{ clock(resumedFrom()) }}
            <button type="button" (click)="restartTrailer()">Empezar de nuevo</button>
          </div>
        }
      } @else if (error(); as e) {
        <div class="state">
          <app-icon name="info" [size]="40" />
          <h2>No se pudo reproducir</h2>
          <p>{{ e }}</p>
          <a class="btn btn-primary" [routerLink]="['/titulo', id()]">Ver detalle</a>
        </div>
      } @else if (playback(); as p) {
        <video #video [src]="p.url" controls autoplay playsinline (loadedmetadata)="resume()" (pause)="save()" (ended)="save()"></video>
        @if (resumedFrom()) {
          <div class="notice">Continuando desde {{ clock(resumedFrom()) }}
            <button type="button" (click)="restart()">Empezar de nuevo</button>
          </div>
        }
        @if (p.demo) { <p class="demo">{{ p.message }}</p> }
      } @else {
        <div class="state"><span class="spinner"></span></div>
      }
    </div>
  `,
  styles: `
    .player { position: fixed; inset: 0; z-index: 80; background: #000; display: grid; place-items: center; color: #fff; }
    video { width: 100%; height: 100%; max-height: 100vh; background: #000; }
    .yt { width: 100%; height: 100%; border: 0; background: #000; }
    /* Con tráiler, la barra va arriba y no encima del video, para no tapar los controles de YouTube. */
    .player.with-trailer { grid-template-rows: auto 1fr; place-items: stretch; }
    .player.with-trailer .top { position: static; background: #000; }
    .yt-link { margin-left: auto; padding: 6px 12px; border-radius: 8px; border: 1px solid #fff3; color: #fffc; font-size: 13px; font-weight: 600; white-space: nowrap; }
    .yt-link:hover { color: #fff; }
    .player.with-trailer .notice { bottom: auto; top: 150px; z-index: 3; }
    .top { position: absolute; top: 0; left: 0; right: 0; z-index: 2; display: flex; align-items: center; gap: 14px; padding: 18px 24px; background: linear-gradient(#000c, transparent); pointer-events: none; }
    .top > * { pointer-events: auto; }
    .top small { display: block; color: #fff9; font-size: 12px; }
    .top strong { font-family: var(--display); font-size: 18px; }
    .top .icon-btn { background: #0008; color: #fff; border-color: #fff3; }
    .state { display: grid; justify-items: center; gap: 12px; text-align: center; padding: 24px; max-width: 460px; }
    .state p { color: #fffb; }
    .notice { position: absolute; left: 24px; bottom: 90px; display: flex; gap: 12px; align-items: center; padding: 10px 14px; border-radius: 10px; background: #000b; font-size: 13px; animation: fade .3s; }
    .notice button { color: var(--accent-hover); font-weight: 700; }
    .demo { position: absolute; top: 76px; left: 24px; right: 24px; text-align: center; font-size: 12px; color: #fffa; }
    .spinner { width: 44px; height: 44px; border-radius: 50%; border: 3px solid #fff3; border-top-color: var(--accent); animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPage {
  private readonly api = inject(ApiService);
  private readonly catalog = inject(CatalogService);
  private readonly library = inject(LibraryService);
  private readonly location = inject(Location);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly id = input.required<string>();
  protected readonly content = signal<Content | null>(null);
  protected readonly playback = signal<Playback | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly useTrailer = signal(false);
  protected readonly resumedFrom = signal(0);
  protected readonly clock = clock;
  private lastSaved = -1;

  private readonly ytFrame = viewChild<ElementRef<HTMLIFrameElement>>('yt');
  /** Segundo en que arranca el tráiler: se fija una sola vez para no recargar el iframe al guardar. */
  private readonly trailerStart = signal(0);
  /** Último estado informado por el reproductor de YouTube. */
  private ytTime = 0;
  private ytDuration = 0;

  private readonly trailerId = computed(() => youtubeId(this.content()?.trailerUrl));
  protected readonly trailer = computed(() => {
    const id = this.trailerId();
    if (!this.useTrailer() || !id) return null;
    const origin = encodeURIComponent(window.location.origin);
    const start = this.trailerStart() ? `&start=${this.trailerStart()}` : '';
    // enablejsapi permite leer el segundo actual y la duración para guardar «Seguir viendo».
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}${start}`,
    );
  });
  protected readonly watchUrl = computed(() => (this.trailerId() ? `https://www.youtube.com/watch?v=${this.trailerId()}` : null));

  constructor() {
    const timer = setInterval(() => this.save(), 10_000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.save();
    });
  }

  async ngOnInit(): Promise<void> {
    let content: Content;
    try {
      content = this.catalog.byId(this.id()) ?? (await firstValueFrom(this.api.content(this.id())));
      this.content.set(content);
    } catch (e) {
      this.error.set(errorMessage(e, 'El título no está disponible.'));
      return;
    }
    const hasTrailer = !!youtubeId(content.trailerUrl);
    try {
      const playback = await firstValueFrom(this.api.playback(this.id()));
      // El video del modo demostración es una muestra genérica: si hay tráiler oficial, se prefiere el tráiler.
      if (playback.demo && hasTrailer) this.startTrailer();
      else this.playback.set(playback);
    } catch (e) {
      // Sin video real en Supabase (404) o sin acceso al almacenamiento: se muestra el tráiler si existe.
      if (hasTrailer) this.startTrailer();
      else this.error.set(errorMessage(e, 'El video no está disponible.'));
    }
  }

  /** Abre el tráiler y, si quedó a medias, lo reanuda donde se dejó. */
  private startTrailer(): void {
    const saved = this.library.progress().find((p) => p.content.id === this.id());
    const total = saved?.totalSeconds ?? 0;
    if (saved && saved.seconds > 5 && (!total || saved.seconds < total - 5)) {
      this.trailerStart.set(Math.floor(saved.seconds));
      this.resumedFrom.set(Math.floor(saved.seconds));
      setTimeout(() => this.resumedFrom.set(0), 6000);
    }
    this.useTrailer.set(true);
  }

  /** Pide al reproductor de YouTube que informe su estado (API de mensajes del iframe). */
  protected listenYoutube(): void {
    this.ytFrame()?.nativeElement.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
  }

  protected restartTrailer(): void {
    this.ytFrame()?.nativeElement.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
    this.resumedFrom.set(0);
  }

  @HostListener('window:message', ['$event'])
  protected onYoutubeMessage(event: MessageEvent): void {
    const frame = this.ytFrame()?.nativeElement;
    if (!frame || event.source !== frame.contentWindow || !String(event.origin).includes('youtube')) return;
    let data: { event?: string; info?: { currentTime?: number; duration?: number; playerState?: number } };
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    const info = data?.info;
    if (!info) return;
    if (typeof info.duration === 'number' && info.duration > 0) this.ytDuration = info.duration;
    if (typeof info.currentTime === 'number') this.ytTime = info.currentTime;
    // 0 = terminado: se guarda completo para que salga de «Seguir viendo».
    if (info.playerState === 0 && this.ytDuration) {
      this.ytTime = this.ytDuration;
      this.save();
    }
  }

  protected resume(): void {
    const el = this.video()?.nativeElement;
    const saved = this.library.progressById().get(this.id()) ?? 0;
    if (el && saved > 5 && saved < el.duration - 5) {
      el.currentTime = saved;
      this.resumedFrom.set(saved);
      setTimeout(() => this.resumedFrom.set(0), 6000);
    }
  }

  protected restart(): void {
    const el = this.video()?.nativeElement;
    if (el) el.currentTime = 0;
    this.resumedFrom.set(0);
  }

  /** Guarda el progreso del video real o del tráiler de YouTube (cada 10 s, al pausar y al salir). */
  protected save(): void {
    const content = this.content();
    if (!content) return;
    let seconds: number;
    let total: number | undefined;
    if (this.useTrailer()) {
      if (!this.ytTime || !this.ytDuration) return;
      seconds = Math.floor(Math.min(this.ytTime, this.ytDuration));
      total = Math.round(this.ytDuration);
    } else {
      const el = this.video()?.nativeElement;
      if (!el || !el.currentTime) return;
      seconds = Math.floor(el.currentTime);
      total = Number.isFinite(el.duration) && el.duration > 0 ? Math.round(el.duration) : undefined;
    }
    if (seconds === this.lastSaved) return;
    this.lastSaved = seconds;
    this.library.updateProgress(content, seconds, total);
    this.api.saveProgress(content.id, seconds, total).subscribe({ error: () => {} });
  }

  protected back(): void {
    this.location.back();
  }
}
