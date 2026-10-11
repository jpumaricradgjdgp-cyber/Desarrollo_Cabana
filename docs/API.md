# API REST Cabaña

Base local: `http://localhost:8080/api`. Las respuestas usan JSON. En rutas privadas envía `Authorization: Bearer <accessToken>`. Usa correo electrónico como identificador de acceso, aunque el diseño de referencia dice Usuario.

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | /config | Público | Identifica el modo demo |
| POST | /auth/register | Público | Registro con email password name |
| POST | /auth/login | Público | Inicio con email y password |
| POST | /auth/refresh | Cookie | Renovación de sesión |
| POST | /auth/logout | Público/cookie | Cierra sesión y elimina cookie |
| GET | /auth/me | USER/ADMIN | Perfil actual |
| GET | /catalog?q=&type=&genre= | Público | Catálogo y filtros JPQL |
| GET | /catalog/{id} | Público | Detalle |
| GET | /genres | Público | Géneros distintos |
| GET | /me/list | USER/ADMIN | Lista personal |
| PUT | /me/list/{id} | USER/ADMIN | Añadir favorito |
| DELETE | /me/list/{id} | USER/ADMIN | Quitar favorito |
| GET | /me/progress | USER/ADMIN | Posiciones guardadas |
| PUT | /me/progress/{id} | USER/ADMIN | Actualizar segundos |
| GET | /playback/{id} | USER/ADMIN | Obtener URL temporal |
| POST | /admin/images | ADMIN | Subir portada multipart (`file`), JPG/PNG hasta 5 MB |
| GET | /admin/catalog | ADMIN | Catálogo con rutas privadas para edición |
| POST | /admin/catalog | ADMIN | Crear contenido |
| PUT | /admin/catalog/{id} | ADMIN | Actualizar contenido |
| DELETE | /admin/catalog/{id} | ADMIN | Eliminar y limpiar referencias |

## Inicio de sesión

```json
{"email":"admin@cabana.demo","password":"Cabana2026!"}
```

Respuesta: `accessToken`, `expiresIn` y `message`. La renovación se devuelve mediante `Set-Cookie`, no en el JSON. El navegador usa la cookie HttpOnly y mantiene el token de acceso en memoria. Postman conserva las cookies automáticamente. El registro de Supabase puede devolver `accessToken: null` cuando exige confirmar el correo.

## Crear o actualizar contenido

```json
{
  "title":"Mi película",
  "description":"Descripción del contenido.",
  "type":"MOVIE",
  "releaseYear":2026,
  "durationMinutes":110,
  "seasons":0,
  "genre":"Drama",
  "imageUrl":"/assets/dark.jpg",
  "videoPath":"peliculas/mi-video.mp4",
  "featured":false,
  "ageRating":"13+"
}
```

Tipos: MOVIE o SERIES. Clasificaciones: ATP, 7+, 13+, 16+, 18+. `videoPath` es opcional y acepta letras ASCII, números, guiones, barras y extensión de archivo. Al editar, manda el objeto completo. El catálogo público excluye `videoPath`. No incluye contraseñas, claves privadas ni URLs firmadas permanentes.

## Guardar progreso

```json
{"seconds":42}
```

Cada ruta personal obtiene el usuario desde el JWT. No recibe un `userId` controlado por el cliente.

## Errores

400 para datos incorrectos; 401 para sesión ausente o inválida; 403 para rol u origen no permitido; 404 para contenido o video inexistente; 409 para duplicados; 429 para demasiados intentos de Supabase Auth; 502/503 si falla el acceso remoto. Los errores de negocio tienen un campo `message`. Spring Security puede devolver 401/403 sin cuerpo; el frontend tiene mensajes para esos casos.

Importa `docs/Cabana.postman_collection.json` para ejecutar solicitudes. Primero inicia sesión; luego consulta el catálogo para capturar un UUID. Las operaciones de alta, edición y eliminación de la colección usan un contenido nuevo de prueba.

## Subir una portada

`POST /api/admin/images` recibe `multipart/form-data` con el campo `file` y el JWT del administrador. Devuelve `{"imageUrl":"https://…/storage/v1/object/public/portadas/…"}`; utiliza esa URL en el JSON de alta/edición. En demo devuelve `/assets/uploads/…`, disponible durante esa ejecución. El servidor comprueba el formato real, limita dimensiones, normaliza a un máximo de 1920 px y elimina metadatos al recodificar. Devuelve 413 si supera 5 MB y 415 para formatos distintos de JPG/PNG. El navegador genera automáticamente el Content-Type y boundary de FormData.

El frontend también permite WebP y AVIF, incluso descargados con extensión JPG: detecta la firma real y los convierte mediante canvas antes del envío. La API continúa recibiendo únicamente raster JPG/PNG y verificándolos en Java. No se cambia la lista de tipos permitidos del bucket ni se admiten SVG.
