import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authInterceptor } from '../../core/auth.interceptor';
import { LoginPage } from './login';

/** Regresión: sin ?volver= el login funcionaba pero mostraba «Correo o contraseña incorrectos». */
describe('LoginPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginPage }, { path: 'inicio', children: [] }, { path: 'perfil', children: [] }], withComponentInputBinding()),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function loginAt(url: string) {
    const harness = await RouterTestingHarness.create(url);
    const el: HTMLElement = harness.routeNativeElement!;
    const [email, password] = Array.from(el.querySelectorAll('input')) as HTMLInputElement[];
    email.value = 'ana@cabana.pe';
    email.dispatchEvent(new Event('input'));
    password.value = 'Cabana2026!';
    password.dispatchEvent(new Event('input'));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    http.match('/api/config');
    http.match('/api/ratings');
    http.expectOne('/api/auth/login').flush({ accessToken: 'tok', expiresIn: 3600, message: 'ok' });
    await new Promise((r) => setTimeout(r));
    http.expectOne('/api/auth/me').flush({ id: '1', email: 'ana@cabana.pe', name: 'Ana', role: 'USER' });
    await new Promise((r) => setTimeout(r, 10));
    harness.detectChanges();
    return el;
  }

  it('sin ?volver= entra y redirige a /inicio sin mostrar error', async () => {
    const el = await loginAt('/login');
    expect(el.querySelector('.alert.error')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('con ?volver= vuelve a la ruta pedida', async () => {
    await loginAt('/login?volver=%2Fperfil');
    expect(TestBed.inject(Router).url).toBe('/perfil');
  });
});
