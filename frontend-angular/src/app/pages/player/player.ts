import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, errorMessage } from '../../core/api.service';
import { CatalogService } from '../../core/catalog.service';
import { clock } from '../../core/format';
import { LibraryService } from '../../core/library.service';
import { Content, Playback } from '../../core/models';
import { Icon } from '../../shared/icon';

/** Reproductor a pantalla completa. Reanuda donde quedó y guarda el progreso cada 10 s. */
@Component({
  selector: 'app-player',
  imports: [Icon, RouterLink],
  template: `
    <div class="player">
      <div class="top">
        <button class="icon-btn round" type="button" aria-label="Volver" (click)="back()"><app-icon name="arrow-left" /></button>
        <div>
          <small>Estás viendo</small>
          <strong>{{ content()?.title ?? 'Cargando…' }}</strong>
        </div>
      </div>
      @if (error(); as e) {
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
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly id = input.required<string>();
  protected readonly content = signal<Content | null>(null);
  protected readonly playback = signal<Playback | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly resumedFrom = signal(0);
  protected readonly clock = clock;
  private lastSaved = -1;

  constructor() {
    const timer = setInterval(() => this.save(), 10_000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.save();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const [content, playback] = await Promise.all([
        this.catalog.byId(this.id()) ?? firstValueFrom(this.api.content(this.id())),
        firstValueFrom(this.api.playback(this.id())),
      ]);
      this.content.set(content);
      this.playback.set(playback);
    } catch (e) {
      this.error.set(errorMessage(e, 'El video no está disponible.'));
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

  protected save(): void {
    const el = this.video()?.nativeElement;
    const content = this.content();
    if (!el || !content || !el.currentTime) return;
    const seconds = Math.floor(el.currentTime);
    if (seconds === this.lastSaved) return;
    this.lastSaved = seconds;
    this.library.updateProgress(content, seconds);
    this.api.saveProgress(content.id, seconds).subscribe({ error: () => {} });
  }

  protected back(): void {
    this.location.back();
  }
}
