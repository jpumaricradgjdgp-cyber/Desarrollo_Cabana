# Normalización del catálogo de Cabaña

La migración `supabase/06_normalizacion_generos.sql` incorpora `cabana.genres` y sustituye el texto repetido en `contents.genre` por `contents.genre_id`, una FK obligatoria con `ON DELETE RESTRICT`. Se conservan los UUID y todos los atributos del catálogo. Los usuarios, perfiles, favoritos, progresos y archivos de Storage no se eliminan.

## Alcance y dependencias

El avance utiliza **un género principal por contenido** y **un progreso por usuario y título**. No incorpora reproducción por episodio ni varios géneros por título. Las cinco tablas de aplicación son accounts, genres, contents, saved_items y watch_progress; las referencias de identidad apuntan a la tabla externa auth.users.

- Perfil: id y email son claves candidatas; cada una determina los atributos del perfil.
- Género: id y name son claves candidatas.
- Contenido: id determina los metadatos y genre_id.
- Favorito: id y (user_id, content_id) son claves candidatas.
- Progreso: id y (user_id, content_id) son claves candidatas; la pareja completa determina seconds.

Los valores son atómicos (1FN); los atributos dependen de las claves completas (2FN); no hay dependencias transitivas de atributos no clave bajo estas reglas (3FN). El nombre del género se resuelve a través de su tabla. El correo del perfil sigue siendo una copia de contacto de Auth, documentada como redundancia entre componentes; su sincronización ante cambios de correo es una mejora pendiente.

Un género textual único no demostraba por sí solo incumplimiento de 3FN. Esta revisión formaliza las dependencias y controla la clasificación mediante integridad referencial. Más tablas no implican por sí mismas mayor normalización.

## Código actualizado

- Genre y GenreRepository; asociación Content.genre de tipo Genre.
- JPQL mediante unión con Genre.
- ContentView conserva el nombre textual esperado por el frontend.
- AdminContentView evita exponer entidades JPA en el panel.
- Selector de género principal en el formulario y rechazo de géneros inexistentes.
- Dos pruebas nuevas; 15 pruebas aprobadas en total.

## Instalación y actualización

Para una base nueva, ejecutar los scripts iniciales 01 y 02 y las configuraciones adicionales que correspondan, antes de ejecutar 06_normalizacion_generos.sql. Una base existente con el esquema anterior solo requiere 06. No volver a ejecutar después los scripts de datos antiguos que escriben la columna genre.

Coordinar la migración con esta versión del backend. El perfil Supabase usa `ddl-auto: validate`. Las credenciales permanecen en `backend/.env`, fuera de Git y del ZIP. El frontend se sirve desde Java.

En la actualización del 11 de octubre de 2026 se respaldaron las cuatro tablas originales y se compararon íntegramente los 13 contenidos antes y después. La API conectada devolvió 13 títulos y 9 géneros. Esta verificación no acredita una prueba de contraseña real ni reproducción privada.

## Reversión

`06_revertir_normalizacion.sql` reconstruye la columna textual mediante la FK y conserva el catálogo de géneros. Detener la versión nueva y coordinar el retorno al backend anterior. No ejecutar la reversión como parte de una instalación normal.
