import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { adminGuard, authGuard } from './guards';

describe('autenticación', () => {
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  async function login(role: 'USER' | 'ADMIN') {
    const done = auth.login('a@b.pe', 'Cabana2026!');
    const req = http.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.withCredentials).toBe(true);
    req.flush({ accessToken: 'tok-1', expiresIn: 3600, message: 'ok' });
    await Promise.resolve();
    http.expectOne('/api/auth/me').flush({ id: '1', email: 'a@b.pe', name: 'Ana Pérez', role });
    await done;
  }

  it('guarda el usuario y envía el token Bearer en las llamadas privadas', async () => {
    await login('USER');
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.initials()).toBe('AP');
    TestBed.inject(HttpClient).get('/api/me/list').subscribe();
    expect(http.expectOne('/api/me/list').request.headers.get('Authorization')).toBe('Bearer tok-1');
  });

  it('renueva el token una vez cuando la API responde 401', async () => {
    await login('USER');
    const result = firstValueFrom(TestBed.inject(HttpClient).get<string[]>('/api/me/list'));
    http.expectOne('/api/me/list').flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({ accessToken: 'tok-2', expiresIn: 3600, message: 'ok' });
    await Promise.resolve();
    http.expectOne('/api/auth/me').flush({ id: '1', email: 'a@b.pe', name: 'Ana', role: 'USER' });
    await new Promise((r) => setTimeout(r));
    const retry = http.expectOne('/api/me/list');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer tok-2');
    retry.flush(['ok']);
    expect(await result).toEqual(['ok']);
  });

  it('los guards redirigen según la sesión y el rol', async () => {
    const run = (guard: typeof authGuard) =>
      TestBed.runInInjectionContext(() => guard({} as never, { url: '/admin' } as never));
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(run(authGuard) as never)).toBe('/login?volver=%2Fadmin');
    await login('USER');
    expect(run(authGuard)).toBe(true);
    expect(router.serializeUrl(run(adminGuard) as never)).toBe('/inicio');
    auth.user.set({ id: '1', email: 'a@b.pe', name: 'Ana', role: 'ADMIN' });
    expect(run(adminGuard)).toBe(true);
  });
});
