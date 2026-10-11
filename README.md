# Cabaña · Servicio de streaming

Proyecto inicial funcional con backend Java 21 y Spring Boot 3.5.16, frontend HTML/CSS/JavaScript y configuración para Supabase PostgreSQL, Auth y Storage. Usa el logo, las portadas y los iconos entregados. El diseño sigue la navegación lateral, el banner, el catálogo y el formulario de tu referencia, con Azul noche, Claro y Halloween.

## Abrir Cabaña en Windows

`Iniciar_Cabana.cmd` usa Supabase cuando existe `backend/.env`; sin ese archivo inicia la demostración. En esta laptop la configuración privada de Supabase se guarda localmente y usa el puerto **8081**. Abre [Cabaña conectada](http://localhost:8081/pages/inicio.html). Registra una cuenta real y confirma el correo antes de iniciar sesión. El administrador de demostración solo funciona en el perfil demo.

`Iniciar_Supabase.cmd` exige la configuración real. Si Cabaña con Supabase ya está abierta en ese puerto, muestra su dirección en lugar de arrancar otra instancia.

### Probar la demostración sin Supabase

1. Descomprime `cabana-proyecto.zip` en una carpeta.
2. Instala Java 21 si tu equipo no lo tiene.
3. Haz doble clic en `Iniciar_Cabana.cmd` o desde esa carpeta ejecuta:

```powershell
java -jar cabana.jar
```

4. Abre [Cabaña en tu equipo](http://localhost:8080).
5. Regístrate para probar tu lista o usa el administrador de demostración:

| Campo | Valor |
|---|---|
| Correo | admin@cabana.demo |
| Contraseña | Cabana2026! |

También puedes ejecutar `scripts/iniciar-demo.ps1`. Detén el servidor con Ctrl+C. El modo demo usa H2 en memoria y se reinicia al detener el servidor. No necesita Supabase ni Maven para ejecutar el JAR. El video de muestra y las fuentes opcionales requieren internet; hay fuentes del sistema como alternativa.

Si abres los HTML con doble clic, verás el CSS y una guía para iniciar el servidor. El catálogo, el inicio de sesión y el CRUD requieren abrir la dirección `http://localhost:8080` después de iniciar Java.

Si usas Live Server de VS Code en el puerto 5500, solo sirve la vista estática del diseño. Allí no existe `/api/config`; usa el enlace a `localhost:8080` que muestra la página, después de iniciar `Iniciar_Cabana.cmd`. Las imágenes y los enlaces se resuelven desde la carpeta del frontend.

Si aparece **Port 8080 was already in use**, inicia el modo demo en otro puerto desde PowerShell:

```powershell
$env:PORT="8081"
.\Iniciar_Cabana.cmd
```

En ese caso abre `http://localhost:8081`. El lanzador configura también el origen permitido para que el login y el registro usen el mismo puerto. Para volver al puerto habitual usa `$env:PORT="8080"` antes de iniciar.

## Descargar desde GitHub

El repositorio de esta versión es [Desarrollo_Cabana](https://github.com/jpumaricradgjdgp-cyber/Desarrollo_Cabana). Incluye el backend, las páginas HTML, los estilos, las imágenes, los scripts SQL, las pruebas y la documentación.

```powershell
git clone https://github.com/jpumaricradgjdgp-cyber/Desarrollo_Cabana.git
cd Desarrollo_Cabana
.\Iniciar_Cabana.cmd
```

También puedes usar **Code → Download ZIP**, descomprimir y ejecutar el mismo lanzador. Para ejecutar desde el código instala un **JDK 21** y configura `JAVA_HOME` si Maven lo solicita. No necesitas instalar Maven por separado: el wrapper lo descarga. Necesitas conexión a internet la primera vez.

GitHub contiene el código fuente; `cabana.jar` y `backend/target/` están excluidos del control de versiones. El lanzador usa el JAR cuando está presente en la entrega local y, cuando descargas GitHub, inicia desde el código fuente. No se publican contraseñas ni `.env`: completa tu configuración local a partir de `backend/.env.example`.

## Estructura

```text
cabana/
├── backend/
│   ├── pom.xml
│   ├── mvnw y mvnw.cmd
│   ├── .env.example
│   ├── Dockerfile
│   └── src/
│       ├── main/java/pe/cabana/
│       │   ├── api/          Controladores, DTO y errores
│       │   ├── model/        Entidades JPA
│       │   ├── repository/   Repositorios y consultas JPQL
│       │   ├── security/     JWT, roles y CORS
│       │   └── service/      Lógica de negocio y transacciones
│       ├── main/resources/  Perfiles demo y Supabase
│       └── test/            Pruebas de integración
├── frontend/
│   ├── index.html
│   ├── css/                 Estilos base, Cabaña y Halloween
│   ├── js/                  Aplicación, rutas, temas y vista estática
│   │   ├── components/      Iconos compartidos
│   │   └── data/            Biblioteca de portadas recuperadas
│   ├── pages/               Ocho páginas HTML independientes
│   └── assets/              Marca, fondos, iconos y catalogo/ con portadas
├── supabase/                 SQL de esquema, catálogo y administrador
├── scripts/                 Inicio en Windows
├── docs/                    Arquitectura, API y adaptación de la estructura
├── vistas/                  Capturas de la interfaz
└── cabana.jar               Ejecutable con frontend y backend
```

## Funciones implementadas

- Catálogo de películas y series; búsqueda y filtros por tipo y género.
- Banner con navegación entre títulos destacados y ventanas de detalles.
- Sección «Lo más reciente», ordenada por año del catálogo real.
- Biblioteca de siete portadas del frontend anterior, seleccionables desde el formulario de administración.
- Selector de tres temas persistentes: Azul noche, Claro y Halloween. Se abre desde la fogata usando tus iconos a color y negro.
- Bienvenida y menú con una cabaña entre pinos; el menú de Halloween usa tu foto de ladrillos con una capa oscura para conservar la legibilidad.
- Modo Halloween opcional con tus iconos de Jason y fantasma, anuncio de octubre y recomendación de terror.
- Registro, inicio de sesión, renovación mediante cookie HttpOnly y cierre de sesión.
- Lista personal y progreso de reproducción por usuario.
- Panel ADMIN con creación, edición y eliminación de contenidos.
- Validación de formularios, permisos en el servidor y errores de API.
- URLs de reproducción temporales para un bucket privado de Supabase Storage.
- Interfaz adaptable, navegación con teclado y menú para celular.

El frontend no necesita un proceso separado: Maven lo incorpora al backend, que sirve todo desde el mismo origen. No se exige Angular porque el documento era un ejemplo y tu solicitud no especificó un framework frontend.

## Conectar tu Supabase

1. Crea tu proyecto de Supabase o usa uno existente.
2. En SQL Editor ejecuta, en orden, `supabase/01_schema.sql`, `supabase/02_catalog.sql` y `supabase/04_halloween.sql`.
3. En Auth activa registro con correo/contraseña y revisa la confirmación de correo. La interfaz explica cuándo debes confirmar tu cuenta.
4. En Auth > Signing Keys usa una clave asimétrica ES256 o RS256. Esta implementación valida firma, emisor, expiración y audiencia mediante JWKS. No admite el secreto legacy HS256.
5. En Connect copia los datos del **Session pooler, puerto 5432**. Usa la URL JDBC con `sslmode=require`. El usuario suele tener la forma `postgres.<project-ref>`; copia el valor de tu panel.
6. Copia `backend/.env.example` a `backend/.env` y completa los valores. El archivo `.env` no se publica en Git. Spring usa variables de entorno; el script incluido carga ese archivo local.
7. Para ejecución local usa `PORT=8081`, `FRONTEND_ORIGIN=http://localhost:8081` y `SECURE_COOKIES=false`. Al publicar con HTTPS usa tu dominio y `SECURE_COOKIES=true`.
8. Inicia desde la carpeta raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/iniciar-supabase.ps1
```

La primera ejecución desde el código fuente descarga Maven y las dependencias. Si prefieres el JAR ya compilado, establece las mismas variables en tu entorno y ejecuta `java -jar cabana.jar --spring.profiles.active=supabase`.

En Supabase, las tablas viven en el esquema privado `cabana`, no en `public`. No añadas `cabana` a los esquemas expuestos de Data API. El backend usa JDBC; los permisos se comprueban en Spring Security y los filtros de lista/progreso se hacen con el UUID del JWT. También se activa RLS sin políticas públicas como defensa adicional. `password_hash` solo se utiliza en demo; Supabase Auth gestiona las contraseñas reales.

Para administrar el catálogo en Supabase, registra y confirma tu cuenta, inicia sesión y después adapta el correo en `supabase/03_admin.example.sql`. El registro siempre crea un usuario USER; nunca asigna ADMIN desde datos enviados por el navegador.

## Añadir imágenes y videos

Las portadas Stranger Things, Dark y WandaVision y el logo son tus archivos originales. El resto usa tarjetas tipográficas. Desde el panel puedes indicar una URL HTTPS de imagen o un archivo en `/assets/`.

El SQL crea un bucket privado llamado `videos`. Sube allí un MP4 compatible con navegador, por ejemplo `peliculas/mi-video.mp4`. En el panel de control introduce esa ruta en **Ruta de video en Supabase**. No pegues una URL pública ni el nombre del bucket. Completa `SUPABASE_SERVICE_ROLE_KEY` en el backend con la clave legacy `service_role` JWT. Esta clave nunca se envía al frontend. Java genera enlaces válidos durante dos horas.

El modo demo reproduce un **tráiler de Big Buck Bunny** alojado por W3C, incluso si elegiste otro título, y lo indica claramente. Crédito: Big Buck Bunny © 2008 Blender Foundation, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), [proyecto original](https://peach.blender.org/about/), [demostración de video de W3C](https://www.w3.org/2010/05/video/mediaevents). No se incluyen episodios o películas comerciales. En el modo Supabase, un título sin video muestra un aviso.

## Modificar y compilar

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
.\mvnw.cmd spring-boot:run
```

El ejecutable reconstruido queda en `backend/target/cabana-1.0.0.jar`. Después de modificar el código, ese es el archivo actualizado; el `cabana.jar` de la raíz es la compilación entregada. Para actualizar el lanzador rápido, sustituye `cabana.jar` con el nuevo ejecutable.

## Despliegue

Se puede publicar en un servidor que ejecute Java o Docker. Desde la raíz:

```text
docker build -f backend/Dockerfile -t cabana .
docker run --env-file backend/.env -p 8081:8081 cabana
```

Para producción establece el perfil `supabase`, las credenciales del backend, el dominio HTTPS en `FRONTEND_ORIGIN` y cookies seguras. El Dockerfile sirve backend y frontend juntos. El esquema SQL se ejecuta previamente, no se modifica automáticamente al arrancar. No se ha publicado el sistema en un servidor externo.

## Verificación y alcance

El backend fue compilado y comprobado con pruebas de integración en el perfil demo; la interfaz también se comprobó desde un navegador en escritorio y a 390 px. Consulta `docs/VERIFICACION.md` para el detalle. También se verificó la conexión real a PostgreSQL de Supabase: esquema `cabana`, migraciones 01/02/04, perfil `supabase` y API con 13 títulos y 9 géneros. La clave pública de Auth y sus claves de firma respondieron correctamente. El registro y el inicio de sesión con una cuenta real requieren una prueba del usuario con confirmación por correo. Los videos reales necesitan archivos y configuración de Storage.

Esta primera versión es un MVP académico. Cada título tiene una sola ruta de video; la gestión de temporadas y episodios independientes queda para una ampliación. No incluye pagos, suscripciones, perfiles familiares, recuperación de contraseña, DRM ni transcodificación HLS. Antes de abrirlo a usuarios reales deben incorporarse recuperación de cuenta, límites de peticiones, observabilidad y pruebas con la infraestructura elegida. La reproducción MP4 y las URLs temporales cubren el flujo básico solicitado.

## Referencias técnicas

- [Spring Boot 3.5 y requisitos Java](https://docs.spring.io/spring-boot/3.5/system-requirements.html).
- [Supabase con Spring Boot y conexión JDBC](https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot).
- [Claves JWT y JWKS de Supabase](https://supabase.com/docs/guides/auth/signing-keys).
- [Spring Security Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).
- [API de Supabase Storage para firmar rutas](https://supabase.com/docs/reference/self-hosting-storage).

## Organización y recuperación del frontend anterior

Se mantuvo una sola carpeta `frontend`, separando `css`, `js`, `pages` y `assets`. Consulta [la comparación y los archivos recuperados](docs/FRONTEND_RECUPERADO.md). El backend y los scripts SQL permanecen separados para que sea fácil ubicar cada parte.
