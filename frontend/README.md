# Frontend Cabaña

HTML, CSS y JavaScript sin un proceso adicional de compilación.

```text
frontend/
├── index.html
├── pages/             Inicio, películas, series, géneros, login, registro, mi lista y panel
├── css/               styles.css, cabana.css y halloween.css
├── js/                app.js, bootstrap.js, paths.js, themes.js y halloween.js
│   ├── components/    Iconos reutilizables
│   └── data/          Biblioteca de portadas
└── assets/            Logo, iconos, fondos y catalogo/ con siete portadas recuperadas
```

Spring Boot sirve el frontend y la API juntos. Maven copia esta carpeta al ejecutable. Tras editar los archivos, reinicia `mvnw.cmd spring-boot:run` o recompila el JAR; el ejecutable anterior no cambia por editar un HTML.

Desde `pages/`, los estilos se enlazan con `../css/` y los scripts con `../js/`. `js/paths.js` resuelve imágenes y páginas desde la raíz del frontend. `js/bootstrap.js` carga la aplicación al servirla con Java; con doble clic o Live Server muestra una guía y los formularios deshabilitados. Esas vistas estáticas no pueden iniciar sesión ni ejecutar el CRUD. La guía propone localhost:8081; si elegiste otro puerto usa la dirección que imprime el lanzador.

La fogata abre Azul noche, Claro y Halloween; la preferencia persiste al navegar. Halloween conserva tu imagen de ladrillos en el menú. La búsqueda, los filtros, los detalles y «Lo más reciente» usan datos de la API. Esta última sección ordena por año de estreno; no representa popularidad ni visitas.

El panel ADMIN permite crear, consultar, editar y eliminar contenidos. Su formulario incorpora una biblioteca de siete portadas recuperadas del proyecto anterior: seleccionar una rellena la ruta de imagen y guardar aplica el cambio. No agrega películas ni videos automáticamente. El catálogo usa los mismos permisos y autenticación de Supabase que el resto de la aplicación. El token de acceso se mantiene en memoria y la renovación en una cookie HttpOnly.

`css/loading.css` y `js/loading.js` controlan la carga inicial: fogata animada en los temas normales y Jason corriendo en Halloween. El HTML incluye la ilustración SVG decorativa para mostrarla antes de que termine de cargar el módulo principal. Un aviso de lentitud, un límite de espera y «Reintentar» permiten distinguir la carga real de un fallo. Consulta `docs/CARGA_Y_ACCESO.md` desde la raíz del proyecto.

Los avisos de Chrome DevTools y del WebSocket de Live Server pertenecen a esas herramientas. No hace falta desactivar la seguridad ni poner claves privadas en el HTML.

La portada se puede elegir desde el explorador o arrastrar a la zona de subida: `js/components/image-upload.js` muestra la vista previa y `css/image-upload.css` adapta el área a los tres temas. Acepta una imagen JPG, PNG, WebP o AVIF de hasta 5 MB. Al guardar envía `FormData` a `/api/admin/images` antes de guardar el contenido. La selección anterior de portadas y enlaces sigue en «Otras formas de elegir una portada».
