# Frontend Cabaña

Interfaz en HTML, CSS y JavaScript sin dependencias de compilación. `pages/` contiene archivos HTML separados para inicio, películas, series, géneros, login, registro, mi lista y panel de control. Comparten estilos y JavaScript para obtener los datos del backend; Angular aparece solo en el documento de ejemplo y no fue un requisito de tu solicitud.

Spring Boot sirve estos archivos desde la raíz del sitio. El proceso de Maven copia frontend/ a los recursos estáticos del backend. Después de modificar el diseño, reinicia `mvnw spring-boot:run` o reconstruye el JAR.

El CSS y las imágenes usan rutas relativas: `./styles.css` desde `index.html` y `../styles.css` desde `pages/`. Al abrir un HTML con doble clic se muestra el diseño y una guía para iniciar Java; login y registro permiten ver sus formularios, pero no enviarlos. Para usar el catálogo, la sesión y el CRUD, ejecuta `Iniciar_Cabana.cmd` y abre `http://localhost:8080/pages/inicio.html`. `bootstrap.js` también reconoce una vista local en Live Server (puertos 5500–5599 o carpeta `/frontend/`) y muestra la guía sin intentar consultar su API inexistente. Fuera de esas vistas estáticas carga la aplicación completa por HTTP.

Si la consola muestra `:5500/api/config 404`, estás abriendo la aplicación en el servidor de archivos de VS Code. Abre `localhost:8080` después de ejecutar Java. El aviso `com.chrome.devtools.json` pertenece a la conexión de carpetas de Chrome DevTools; el aviso del WebSocket con Back-Forward Cache pertenece a la recarga de Live Server. No se resuelven desactivando la seguridad del navegador ni añadiendo claves de Supabase al HTML.

Pantallas: inicio, películas, series, géneros, lista personal, registro, inicio de sesión y panel de control. Detalles y reproducción usan cuadros accesibles. Hay diseño adaptable para celular y teclado, búsqueda, filtros y temas claro, oscuro y Halloween persistentes en localStorage. La sesión de acceso queda en memoria; la cookie de renovación es HttpOnly. El anuncio de octubre es opcional; nunca cambia el tema sin que lo elijas.

Los archivos `fire.png` y `bonfire.png` son los iconos que enviaste. El botón muestra la fogata a color en modo oscuro y el fuego negro en modo claro. Las tres portadas y el logo son tus archivos originales. Los demás títulos usan tarjetas tipográficas hasta que añadas sus imágenes desde el panel.
