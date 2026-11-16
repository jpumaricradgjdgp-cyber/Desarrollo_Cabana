import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/** Solo usuarios con sesión. Guarda la ruta para volver después del login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { volver: state.url } });
};

/** Solo el rol ADMIN (el backend también lo verifica en /api/admin/**). */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
  if (auth.isAdmin()) return true;
  inject(ToastService).show('El panel es solo para administradores.', 'error');
  return router.createUrlTree(['/inicio']);
};

/** Evita mostrar login/registro a quien ya inició sesión. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/inicio']) : true;
