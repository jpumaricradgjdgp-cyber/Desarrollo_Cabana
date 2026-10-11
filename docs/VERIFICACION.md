# Verificación de la entrega Cabaña

Fecha: 11 de octubre de 2026. Entorno: Windows, Java 21, Spring Boot 3.5.16 y navegador Chrome.

## Backend

Diez pruebas de integración completadas sin fallos ni errores:

| Grupo | Comprobaciones |
|---|---|
| Perfil demo · 7 pruebas | Filtros JPQL y catálogo público; rechazo de tokens falsos y acceso anónimo; permisos USER y ADMIN; aislamiento de listas y progreso entre usuarios; CRUD del administrador con eliminación transaccional; cookies HttpOnly y origen; validación y reproducción identificada como demo |
| Contrato Supabase · 3 pruebas | Firma ES256 y validación de emisor/audiencia; respuestas de login registro con confirmación y renovación; rol desde PostgreSQL/JPA en lugar de user_metadata y composición de URL firmada de Storage |

El segundo grupo utiliza un servidor HTTP local simulado y H2. Comprueba la configuración del perfil supabase y los contratos HTTP, pero no demuestra una conexión a la cuenta real de Supabase ni valida su infraestructura o sus scripts SQL en PostgreSQL.

La compilación produce un JAR ejecutable con frontend y backend. Se comprobó que puede iniciar y servir la página y la API.

## Frontend

Once flujos comprobados en navegador: cambio de tema persistente; búsqueda; registro; lista personal; renovación tras recargar; inicio/cierre de sesión; CRUD desde el panel; filtro por género; apertura de reproductor; ancho de 390 px sin desbordamiento horizontal; menú móvil. No se detectaron errores de ejecución JavaScript.

También se comprobó que el video externo de demostración carga sus metadatos, avanza al reproducir y conserva una posición al cerrar. Las capturas finales corresponden a modo oscuro, claro, inicio de sesión, panel y celular. Se revisó el contraste, el ajuste de imágenes y la ausencia de superposiciones importantes.

## Actualización de Halloween y páginas HTML

Se repitieron las diez pruebas del backend sin fallos y se verificaron quince flujos nuevos en navegador: activación opcional y rechazo del tema; persistencia y restauración del modo anterior; cierre persistente del anuncio; ficha de recomendación; ocho HTML accesibles; navegación entre archivos HTML; conservación del filtro de género; formularios HTML de registro/login; sesión y lista personal entre páginas; panel protegido; tema y anuncio adaptables a 390 px; anuncio oculto fuera de octubre mediante simulación de la configuración. No se detectaron errores JavaScript. Las capturas nuevas están en `vistas/`.

## Corrección de CSS al abrir archivos HTML

La corrección de rutas del frontend se comprobó abriendo los nueve HTML directamente con `file://`: CSS principal y Halloween aplicados, imágenes locales disponibles, formularios de login/registro visibles con envío deshabilitado, cambio claro/oscuro, navegación entre HTML y ancho de 390 px sin desbordamiento. Se repitieron los quince flujos de navegación, sesión y Halloween contra el JAR corregido. El modo archivo muestra una guía para iniciar Java; no presenta un catálogo ni una sesión simulada.

## Corrección para Live Server

Se reprodujo el servidor estático con interceptación HTTP del navegador para URLs de `127.0.0.1:5500`, tanto con `/frontend/` como con el frontend en la raíz. Ocho URLs (inicio, índice, login y registro en ambos montajes) cargaron sus estilos e imágenes y permitieron navegar sin solicitudes a `/api/` ni recursos 404. La vista estática muestra una guía y un enlace al puerto 8080; no conecta Live Server a PostgreSQL ni ejecuta el CRUD. La comprobación no incluye el WebSocket inyectado por la extensión de VS Code.

Tras actualizar las rutas dinámicas de imágenes y navegación, también se repitieron los nueve HTML con `file://` y los quince flujos de la aplicación servida por Java, sin fallos.

## Pendiente de comprobación con datos del usuario

Registro y correo de confirmación real; emisión de JWT por esa cuenta; permisos y reproducción desde el bucket del usuario; despliegue con HTTPS; prueba Docker. Ninguna de estas pruebas se presenta como realizada.

## Conexión real a Supabase

Se comprobó JDBC contra PostgreSQL 17.6, se creó el esquema `cabana` y se ejecutaron 01_schema.sql, 02_catalog.sql y 04_halloween.sql. El backend inició con el perfil `supabase`, validó las entidades JPA y respondió `/api/config` con `demo: false`, `/api/catalog` con 13 títulos y `/api/genres` con 9 géneros. La clave pública permitió consultar la configuración de Auth: email habilitado y confirmación requerida. El endpoint JWKS devolvió una clave ES256. Estas comprobaciones no crearon usuarios ni enviaron correos; registro, confirmación, login real y reproducción privada siguen pendientes de una cuenta y archivos del usuario.

## Frontend organizado y portadas recuperadas

La compilación limpia final completó las diez pruebas del backend. Se comprobó la nueva estructura css/js/pages/assets desde Java, nueve HTML con doble clic y ocho vistas simuladas de Live Server: cero errores JavaScript y recursos 404. Los tres temas conservaron sus imágenes y preferencias entre páginas, con anchos de 320 a 1366 px sin desbordamiento horizontal. «Lo más reciente» presentó los tres títulos esperados según el año de la API real y abrió sus detalles. Las siete portadas servidas coinciden con los archivos originales por SHA256.

El formulario ADMIN se probó en demo: carga de siete imágenes, selección de portada, creación, edición persistida y eliminación del registro de prueba. No se usó el administrador demo contra la base real. El lanzador Supabase detectó la instancia abierta y terminó correctamente sin iniciar otra en el mismo puerto.

## Carga y rol administrador

Se comprobó la fogata en Azul noche y Claro, la ilustración de Jason corriendo en Halloween, el cambio real de los fotogramas mediante CSS, el ancho de 320 px y la desactivación de animaciones con movimiento reducido. Se simularon API lenta, tiempo de espera agotado, módulo JavaScript inaccesible y módulo que no termina de inicializar. El aviso de lentitud, el error, «Reintentar» y la recuperación del catálogo funcionaron. Se repitieron las nueve páginas, los tres temas, las vistas estáticas y el selector de portadas con CRUD demo sin errores JS ni recursos 404 en el funcionamiento normal.

Se verificó que la cuenta elegida por el usuario existe en Supabase Auth y tiene el correo confirmado; se asignó y consultó su rol ADMIN en `cabana.accounts`. No se consultó ni modificó su contraseña. El inicio de sesión real sigue utilizando la contraseña que el usuario ya estableció.
