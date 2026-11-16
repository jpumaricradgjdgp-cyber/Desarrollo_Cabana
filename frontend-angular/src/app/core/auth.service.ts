import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, firstValueFrom, from, map, of, shareReplay, switchMap } from 'rxjs';
import { Profile, Session } from './models';

const SESSION_FLAG = 'cabana-session';

/**
 * Sesión del usuario. El token de acceso vive solo en memoria (signal); la renovación usa
 * la cookie HttpOnly "cabana_refresh" que emite el backend, por eso nunca se guarda en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private refreshing: Observable<string | null> | null = null;

  readonly token = signal<string | null>(null);
  readonly user = signal<Profile | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || 'C';
  });

  /** Recupera la sesión al abrir la app si antes hubo un inicio de sesión. */
  async init(): Promise<void> {
    if (!this.hasFlag()) return;
    await firstValueFrom(this.refresh());
  }

  async login(email: string, password: string): Promise<void> {
    const session = await firstValueFrom(this.http.post<Session>('/api/auth/login', { email, password }));
    await this.accept(session);
  }

  /** Devuelve el mensaje del servidor; con Supabase puede requerir confirmar el correo (accessToken null). */
  async register(name: string, email: string, password: string): Promise<Session> {
    const session = await firstValueFrom(this.http.post<Session>('/api/auth/register', { name, email, password }));
    if (session.accessToken) await this.accept(session);
    return session;
  }

  refresh(): Observable<string | null> {
    this.refreshing ??= this.http.post<Session>('/api/auth/refresh', null).pipe(
      switchMap((session) => from(this.accept(session)).pipe(map(() => session.accessToken))),
      catchError(() => {
        this.clear();
        return of(null);
      }),
      finalize(() => (this.refreshing = null)),
      shareReplay(1),
    );
    return this.refreshing;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', null));
    } finally {
      this.clear();
    }
  }

  private async accept(session: Session): Promise<void> {
    if (!session.accessToken) throw new Error(session.message);
    this.token.set(session.accessToken);
    this.user.set(await firstValueFrom(this.http.get<Profile>('/api/auth/me')));
    this.setFlag(true);
  }

  private clear(): void {
    this.token.set(null);
    this.user.set(null);
    this.setFlag(false);
  }

  private hasFlag(): boolean {
    try {
      return localStorage.getItem(SESSION_FLAG) === '1';
    } catch {
      return false;
    }
  }
  private setFlag(on: boolean): void {
    try {
      if (on) localStorage.setItem(SESSION_FLAG, '1');
      else localStorage.removeItem(SESSION_FLAG);
    } catch {
      /* almacenamiento bloqueado: la sesión dura hasta recargar */
    }
  }
}
