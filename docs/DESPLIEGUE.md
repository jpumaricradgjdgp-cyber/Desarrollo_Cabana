# Despliegue en la nube (Render + Supabase)

Cabaña se publica como **un solo contenedor Docker**: Spring Boot sirve la API REST y la aplicación Angular compilada. La base de datos, la autenticación y el almacenamiento siguen en **Supabase**.

```text
Navegador ──HTTPS──▶ Render (Docker)
                      ├─ Angular (archivos estáticos)
                      └─ Spring Boot /api/** ──JDBC (Session pooler)──▶ Supabase PostgreSQL
                                             └─HTTPS──▶ Supabase Auth y Storage
```

## 1. Preparar Supabase (una sola vez)

1. En **SQL Editor** ejecuta, en orden, los scripts que aún no hayas corrido: `06_normalizacion_generos.sql`, `07_resenas.sql`, `08_catalogo_portadas.sql`, `09_episodios_trailers_historial.sql`.
2. En **Authentication → URL Configuration**:
   - **Site URL**: `https://<tu-servicio>.onrender.com`
   - **Redirect URLs**: agrega `https://<tu-servicio>.onrender.com/restablecer` y `http://localhost:8081/restablecer`. Sin esto, el correo de «Olvidé mi contraseña» no vuelve a Cabaña.
3. Opcional para la demostración del curso: en **Authentication → Sign In / Providers → Email** desactiva **Confirm email** para entrar sin confirmar el correo.

## 2. Crear el servicio en Render

1. Sube la rama `main` a GitHub (el blueprint usa `main`).
2. Entra a [render.com](https://render.com) con tu cuenta de GitHub → **New → Blueprint** → elige el repositorio `Desarrollo_Cabana`. Render lee `render.yaml`.
3. Completa las variables marcadas como secretas, con los mismos valores de tu `backend/.env`:

| Variable | Valor |
|---|---|
| `FRONTEND_ORIGIN` | `https://<tu-servicio>.onrender.com` (sin `/` al final) |
| `SUPABASE_URL` | `https://<proyecto>.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | clave pública (anon/publishable) |
| `SUPABASE_DB_URL` | `jdbc:postgresql://aws-0-<región>.pooler.supabase.com:5432/postgres` (Session pooler) |
| `SUPABASE_DB_USER` | `postgres.<proyecto>` |
| `SUPABASE_DB_PASSWORD` | contraseña de la base de datos |
| `SUPABASE_SERVICE_ROLE_KEY` | clave de servicio (solo para firmar URLs de video; nunca en el frontend) |

4. Pulsa **Apply**. La primera compilación tarda unos minutos (Node compila Angular y Maven empaqueta el JAR).
5. Abre `https://<tu-servicio>.onrender.com`. Swagger queda en `/swagger-ui.html`.

> **Importante:** usa el **Session pooler** de Supabase, no la conexión directa. La conexión directa usa IPv6 y Render, igual que muchas redes domésticas, solo garantiza IPv4.

> El plan gratuito de Render **se duerme** tras 15 minutos sin visitas; la primera carga después puede tardar ~1 minuto. Abre la página unos minutos antes de presentar.

## 3. Actualizaciones

Cada `git push` a `main` vuelve a desplegar automáticamente (`autoDeploy: true`). El flujo de **GitHub Actions** (`.github/workflows/ci.yml`) ejecuta antes las pruebas del backend y del frontend y construye la imagen Docker, así un cambio que rompa las pruebas se ve en GitHub antes de llegar a producción.

## 4. Probar en producción (Capítulo VI)

- [ ] `GET /api/config` responde `"demo": false`.
- [ ] Registro, confirmación de correo e inicio de sesión.
- [ ] «¿Olvidaste tu contraseña?» envía el correo y el enlace abre `/restablecer`.
- [ ] Catálogo con portadas, ficha con episodios y tráiler, reproducción y «Continuar viendo».
- [ ] Reseñas, Mi lista, Historial y «Recomendado para ti».
- [ ] Panel ADMIN: indicadores, CRUD de contenido y episodios, moderación y cambio de roles.
- [ ] Swagger UI en `/swagger-ui.html`.

## Alternativa: Railway

Railway también detecta el `Dockerfile`: **New Project → Deploy from GitHub repo**, en *Settings* indica `backend/Dockerfile` como ruta del Dockerfile y la raíz del repositorio como contexto, y carga las mismas variables. Railway asigna `PORT` automáticamente y Cabaña lo respeta.
