# Octubre en Cabaña

El anuncio de Semana del terror aparece en Inicio durante octubre, según la fecha de Lima. Ofrece activar el modo Halloween o consultar una recomendación. No cambia el tema automáticamente.

Al elegir Halloween, la interfaz utiliza naranja y violeta, incorpora a Jason y muestra una recomendación de terror. El usuario puede volver al tema anterior desde el icono de Jason, o elegir claro/oscuro desde la fogata. La elección se recuerda en ese navegador. También puede cerrar el anuncio; su cierre se recuerda para ese año. El icono del especial sigue disponible aunque el anuncio esté oculto y permite activar el tema en cualquier mes.

Los tres PNG entregados se encuentran en `frontend/assets/ghost.png`, `jason-outline.png` y `jason-movie.png`. El fantasma anuncia el especial, la ilustración de Jason aparece en su presentación y el icono a color identifica la recomendación. No son portadas oficiales de la película.

La ficha de muestra recomienda Viernes 13, parte 2 (1981), basada en [la información de Paramount](https://www.paramountpictures.com/movies/friday-the-13th-part-ii). El modo demo conserva el tráiler de prueba de Big Buck Bunny e indica que no corresponde a la película seleccionada. Para una cuenta real, añade la ficha ejecutando `supabase/04_halloween.sql` después del esquema, y asigna un archivo de video desde el panel cuando lo tengas.

## Páginas HTML

La carpeta `frontend/pages` contiene ocho entradas independientes:

| Archivo | Pantalla |
|---|---|
| inicio.html | Inicio y anuncio estacional |
| peliculas.html | Catálogo de películas |
| series.html | Catálogo de series |
| generos.html | Géneros y filtros |
| login.html | Inicio de sesión |
| registro.html | Crear cuenta |
| mi-lista.html | Lista personal |
| panel-control.html | Administración del catálogo |

Cada archivo tiene su título, descripción y atributo `data-page`. Los formularios de login y registro están definidos en los HTML correspondientes, dentro de `template#auth-layout`, y se conectan a la API mediante JavaScript. Las páginas comparten `css/styles.css`, `css/halloween.css`, `js/app.js`, `js/halloween.js` y las imágenes. Los catálogos se construyen con datos dinámicos de la API. La navegación utiliza rutas de archivos HTML, por ejemplo `/pages/peliculas.html`. `index.html` se mantiene como entrada principal. Las páginas deben abrirse desde el servidor Java, no mediante doble clic en un HTML, porque necesitan la API.

## Configuración de tu backend anterior

Se copiaron a `backend/.env.example` el host JDBC y el usuario de PostgreSQL que proporcionaste. La URL de Auth se obtuvo del identificador de proyecto incluido en ese usuario; compruébala en el panel de tu proyecto. La contraseña compartida no se guardó en el código, en el ejecutable ni en el ZIP.

La configuración local de PostgreSQL y Auth quedó completada en `backend/.env`, excluido de Git y del ZIP. Se comprobó el perfil real y se ejecutaron los scripts 01, 02 y 04 en el esquema privado `cabana`: la API devuelve 13 títulos y 9 géneros. La clave pública de Auth funciona; el proyecto exige confirmar el correo al registrarse.

El perfil real conserva `ddl-auto=validate`, para que arrancar Cabaña no modifique las tablas del backend anterior. El perfil demo usa una base temporal H2. La clave de Storage puede permanecer vacía hasta configurar los videos: reproducir archivos reales requiere subirlos al bucket privado y completar la configuración exclusiva del backend.

Usa `Iniciar_Supabase.cmd` o `Iniciar_Cabana.cmd` con el `.env` local. La clave pública no sustituye a la contraseña PostgreSQL y el administrador demo no es una cuenta de Supabase.
