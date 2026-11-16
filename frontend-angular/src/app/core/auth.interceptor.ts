import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const PUBLIC_AUTH = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/forgot', '/api/auth/reset'];

/**
 * Agrega "Authorization: Bearer" a las llamadas de la API, envía la cookie de renovación
 * a /api/auth y, si el token expiró (401), lo renueva una sola vez y repite la solicitud.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);
  const auth = inject(AuthService);
  const isPublicAuth = PUBLIC_AUTH.includes(req.url);
  const withToken = (token: string | null) =>
    req.clone({
      withCredentials: req.url.startsWith('/api/auth/'),
      setHeaders: token && !isPublicAuth ? { Authorization: `Bearer ${token}` } : {},
    });

  const token = auth.token();
  return next(withToken(token)).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isPublicAuth) {
        return auth.refresh().pipe(
          switchMap((fresh) => (fresh ? next(withToken(fresh)) : throwError(() => error))),
        );
      }
      return throwError(() => error);
    }),
  );
};
