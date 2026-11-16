import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AdminContent,
  AdminReview,
  AdminStats,
  AppConfig,
  Content,
  ContentInput,
  Playback,
  Progress,
  Rating,
  Review,
  ReviewSummary,
} from './models';

/** Acceso tipado a la API REST de Spring Boot. Todas las rutas son relativas al mismo origen. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  config() {
    return this.http.get<AppConfig>('/api/config');
  }

  catalog(filters: { q?: string; type?: string; genre?: string } = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) if (value) params = params.set(key, value);
    return this.http.get<Content[]>('/api/catalog', { params });
  }
  content(id: string) {
    return this.http.get<Content>(`/api/catalog/${id}`);
  }
  genres() {
    return this.http.get<string[]>('/api/genres');
  }
  ratings() {
    return this.http.get<Rating[]>('/api/ratings');
  }

  myList() {
    return this.http.get<Content[]>('/api/me/list');
  }
  save(id: string) {
    return this.http.put<void>(`/api/me/list/${id}`, null);
  }
  unsave(id: string) {
    return this.http.delete<void>(`/api/me/list/${id}`);
  }
  progress() {
    return this.http.get<Progress[]>('/api/me/progress');
  }
  saveProgress(id: string, seconds: number) {
    return this.http.put<void>(`/api/me/progress/${id}`, { seconds: Math.max(0, Math.floor(seconds)) });
  }
  playback(id: string) {
    return this.http.get<Playback>(`/api/playback/${id}`);
  }

  reviews(id: string) {
    return this.http.get<ReviewSummary>(`/api/catalog/${id}/reviews`);
  }
  putReview(id: string, rating: number, comment: string) {
    return this.http.put<Review>(`/api/me/reviews/${id}`, { rating, comment });
  }
  deleteMyReview(id: string) {
    return this.http.delete<void>(`/api/me/reviews/${id}`);
  }

  adminCatalog() {
    return this.http.get<AdminContent[]>('/api/admin/catalog');
  }
  createContent(input: ContentInput) {
    return this.http.post<Content>('/api/admin/catalog', input);
  }
  updateContent(id: string, input: ContentInput) {
    return this.http.put<Content>(`/api/admin/catalog/${id}`, input);
  }
  deleteContent(id: string) {
    return this.http.delete<void>(`/api/admin/catalog/${id}`);
  }
  uploadImage(file: Blob, name: string) {
    const form = new FormData();
    form.append('file', file, name);
    return this.http.post<{ imageUrl: string }>('/api/admin/images', form);
  }
  stats() {
    return this.http.get<AdminStats>('/api/admin/stats');
  }
  adminReviews() {
    return this.http.get<AdminReview[]>('/api/admin/reviews');
  }
  deleteReview(id: string) {
    return this.http.delete<void>(`/api/admin/reviews/${id}`);
  }
}

/** Convierte cualquier error HTTP en un mensaje legible en español. */
export function errorMessage(error: unknown, fallback = 'No se pudo completar la operación.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string; fields?: string[] } | null;
    if (body?.fields?.length) return `${body.message ?? 'Revisa los datos'}: ${body.fields.join(', ')}`;
    if (body?.message) return body.message;
    switch (error.status) {
      case 0:
        return 'No hay conexión con el servidor. ¿Iniciaste el backend en el puerto 8080?';
      case 401:
        return 'Inicia sesión para continuar.';
      case 403:
        return 'No tienes permiso para realizar esta acción.';
      case 404:
        return 'No encontramos lo que buscabas.';
      case 413:
        return 'El archivo es demasiado grande (máximo 5 MB).';
      case 415:
        return 'Formato no permitido. Usa JPG o PNG.';
    }
  }
  return fallback;
}
