import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', title: 'Inicio · Cabaña', loadComponent: () => import('./pages/home/home').then((m) => m.HomePage) },
  {
    path: 'peliculas',
    title: 'Películas · Cabaña',
    data: { type: 'MOVIE' },
    loadComponent: () => import('./pages/browse/browse').then((m) => m.BrowsePage),
  },
  {
    path: 'series',
    title: 'Series · Cabaña',
    data: { type: 'SERIES' },
    loadComponent: () => import('./pages/browse/browse').then((m) => m.BrowsePage),
  },
  { path: 'generos', title: 'Géneros · Cabaña', loadComponent: () => import('./pages/genres/genres').then((m) => m.GenresPage) },
  { path: 'buscar', title: 'Buscar · Cabaña', loadComponent: () => import('./pages/search/search').then((m) => m.SearchPage) },
  { path: 'titulo/:id', title: 'Detalle · Cabaña', loadComponent: () => import('./pages/detail/detail').then((m) => m.DetailPage) },
  {
    path: 'ver/:id',
    title: 'Reproduciendo · Cabaña',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/player/player').then((m) => m.PlayerPage),
  },
  {
    path: 'mi-lista',
    title: 'Mi lista · Cabaña',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-list/my-list').then((m) => m.MyListPage),
  },
  {
    path: 'historial',
    title: 'Historial · Cabaña',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/history/history').then((m) => m.HistoryPage),
  },
  {
    path: 'perfil',
    title: 'Mi perfil · Cabaña',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfilePage),
  },
  { path: 'recuperar', title: 'Recuperar contraseña · Cabaña', loadComponent: () => import('./pages/auth/forgot').then((m) => m.ForgotPage) },
  { path: 'restablecer', title: 'Nueva contraseña · Cabaña', loadComponent: () => import('./pages/auth/reset').then((m) => m.ResetPage) },
  {
    path: 'login',
    title: 'Iniciar sesión · Cabaña',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · Cabaña',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register').then((m) => m.RegisterPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'Panel · Cabaña', loadComponent: () => import('./pages/admin/dashboard').then((m) => m.DashboardPage) },
      { path: 'contenido', title: 'Contenido · Panel', loadComponent: () => import('./pages/admin/contents').then((m) => m.ContentsPage) },
      { path: 'resenas', title: 'Reseñas · Panel', loadComponent: () => import('./pages/admin/reviews').then((m) => m.ReviewsPage) },
      { path: 'usuarios', title: 'Usuarios · Panel', loadComponent: () => import('./pages/admin/users').then((m) => m.UsersPage) },
    ],
  },
  { path: '**', title: 'No encontrado · Cabaña', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage) },
];
