# Frontend Angular de Cabaña

Desde la versión 2.0 la interfaz está hecha en **Angular 21** (componentes standalone, signals y control flow `@if/@for`). Reemplaza al frontend HTML/JS del Avance 1 y 2, que se conserva en `frontend/` solo como referencia histórica. El backend Spring Boot no cambió su contrato: Angular consume la misma API REST.

## Arquitectura

```text
Angular 21 (frontend-angular/)
   │  HttpClient + interceptor JWT
   ▼
API REST /api/**  ── Swagger: /swagger-ui.html
   │
Spring Boot 3.5 · Spring Security (JWT, roles USER/ADMIN)
   │
JPA / Hibernate
   │
PostgreSQL (Supabase) · H2 en modo demo
```

En producción Maven empaqueta `frontend-angular/dist/cabana/browser` dentro del JAR, así que **frontend y API comparten origen** (sin CORS). `SpaController` devuelve `index.html` cuando el navegador abre directamente una ruta de Angular, por ejemplo `/titulo/…`.

## Estructura

```text
frontend-angular/src/app/
├── app.config.ts       Proveedores: router, HttpClient, interceptor, inicialización
├── app.routes.ts       Rutas con carga diferida (lazy loading) y guards
├── app.ts              Shell: barra lateral, barra superior, notificaciones
├── core/               Servicios y lógica sin interfaz
│   ├── api.service.ts        Llamadas REST tipadas + mensajes de error en español
│   ├── auth.service.ts       Sesión: token en memoria, renovación con cookie HttpOnly
│   ├── auth.interceptor.ts   Bearer JWT y reintento tras 401
│   ├── guards.ts             authGuard, adminGuard, guestGuard
│   ├── catalog.service.ts    Catálogo compartido (signals)
│   ├── library.service.ts    Mi lista, progreso y calificaciones
│   ├── theme.service.ts      Azul noche / Claro / Halloween
│   ├── validators.ts         Validadores de formularios reactivos
│   └── models.ts             Interfaces TypeScript de los DTO
├── layout/             Sidebar, Topbar, Overlays (toasts y confirmación)
├── shared/             Icon, Poster, ContentCard, RatingStars, ScrollRow
└── pages/
    ├── home/           Carrusel destacado, continuar viendo, mejor calificadas
    ├── browse/         Películas y Series con filtros y orden
    ├── genres/         Mosaico de géneros
    ├── search/         Búsqueda instantánea (atajo: tecla /)
    ├── detail/         Ficha, reseñas con estrellas y recomendaciones
    ├── player/         Reproductor que reanuda y guarda progreso
    ├── my-list/        Mi lista
    ├── auth/           Login y registro (formularios reactivos)
    └── admin/          Panel: resumen con gráficos, CRUD de contenido, moderación
```

## Rutas

| Ruta | Acceso | Vista |
|---|---|---|
| `/inicio` | Público | Portada |
| `/peliculas`, `/series` | Público | Catálogo filtrable |
| `/generos?g=Drama` | Público | Géneros |
| `/buscar?q=dark` | Público | Resultados |
| `/titulo/:id` | Público (reseñar requiere sesión) | Detalle |
| `/ver/:id` | `authGuard` | Reproductor |
| `/mi-lista` | `authGuard` | Mi lista |
| `/login`, `/registro` | `guestGuard` | Autenticación |
| `/admin`, `/admin/contenido`, `/admin/resenas` | `adminGuard` | Panel ADMIN |

## Autenticación y autorización

1. `POST /api/auth/login` devuelve `accessToken`; el backend además fija la cookie HttpOnly `cabana_refresh`.
2. `AuthService` guarda el token **solo en memoria** (signal) y consulta `/api/auth/me` para conocer el rol.
3. `authInterceptor` agrega `Authorization: Bearer …` a cada llamada `/api/**`. Si una llamada privada responde 401, renueva el token con `POST /api/auth/refresh` una sola vez y repite la solicitud.
4. Al recargar la página, `provideAppInitializer` intenta renovar la sesión antes de mostrar la primera ruta.
5. Los guards protegen las rutas en el cliente; el backend vuelve a validar el rol en `/api/admin/**`.

## Formularios y validaciones

Todos usan **Reactive Forms**:

- **Login**: correo válido y contraseña de 8 a 72 caracteres.
- **Registro**: nombre (máx. 80), correo, contraseña con letras y números, confirmación que coincida (`matchFields`) y medidor de seguridad.
- **Reseña**: 1 a 5 estrellas (control propio `RatingStars` con `ControlValueAccessor`) y comentario de hasta 500 caracteres.
- **Contenido (ADMIN)**: mismas reglas que `ContentInput` en Java: título ≤150, descripción ≤2000, año 1888–2100, duración 1–1500, temporadas ≥1 solo en series, portada HTTPS o `/assets/`, ruta de video segura.

Los mensajes de error aparecen al tocar el campo y los errores del servidor se traducen con `errorMessage()`.

## Desarrollo

```powershell
# Terminal 1: backend en modo demo (puerto 8080)
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2: Angular con recarga en vivo (puerto 4200)
cd frontend-angular
npm install
npm start
```

Abre http://localhost:4200. `proxy.conf.json` redirige `/api` al backend en 8080, y el backend acepta el origen 4200 por defecto (`FRONTEND_ORIGIN`).

## Compilar y probar

```powershell
cd frontend-angular
npm run build          # genera dist/cabana/browser
npx ng test --watch=false   # pruebas unitarias con Vitest
cd ..\backend
.\mvnw.cmd package     # JAR con API + Angular
```

Pruebas incluidas: validadores y formato, flujo de login con interceptor (token Bearer y renovación tras 401), guards por rol y el componente de estrellas.
