# Organización del frontend y recuperación

Origen: [Caba-a-fronted](https://github.com/jpumaricradgjdgp-cyber/Caba-a-fronted), revisión `5b7424d`. Destino: Desarrollo_Cabana.

| Parte anterior | Adaptación en Cabaña |
|---|---|
| public/css, public/js, public/pages, public/media | frontend/css, frontend/js, frontend/pages, frontend/assets/catalogo |
| Top estrenos con contenido fijo | «Lo más reciente», con los tres títulos más recientes del catálogo real, por año |
| Formulario para crear películas | CRUD completo existente, ahora con selector visual de las siete portadas recuperadas |
| Tarjetas de películas y favoritos | Catálogo dinámico, detalles y lista personal existentes, conectados a la API actual |
| Cambio de tema claro/oscuro | Selector persistente Azul noche, Claro y Halloween desde la fogata |

Las siete imágenes se copiaron del repositorio anterior sin modificación: Avengers, Michael, Obsesión, Spider-Man, Scary Movie, Rápidos y furiosos y Pelé. Pueden elegirse desde «Nuevo contenido» o «Editar». No se copiaron las fechas, puntuaciones, promociones ni enlaces de reproducción fijos del prototipo.

El prototipo anterior usaba un selector de usuarios para simular el acceso y rutas `/api/usuarios` y `/api/peliculas`. El proyecto principal utiliza Auth real, JWT y roles con `/api/auth`, `/api/catalog`, `/api/me` y `/api/admin`. Las funciones recuperadas se adaptaron a este contrato para conservar el aislamiento de favoritos y los permisos de administración. El diseño mantiene la marca Cabaña, sus iconos, los acentos azules y los tres temas pedidos.

`js/components/icons.js` concentra los iconos del sitio y `js/data/posters.js` declara las portadas reutilizables. Las páginas HTML comparten esos recursos; las rutas se resolvieron nuevamente para Java, Live Server y doble clic.
