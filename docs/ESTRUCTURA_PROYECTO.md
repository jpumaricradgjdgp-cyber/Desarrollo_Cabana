# Estructura del proyecto Cabaña

Adaptación de la estructura de ejemplo proporcionada. Esta entrega se centra en backend y frontend. El esquema siguiente sirve como base del informe posterior; los resultados y evidencias deben limitarse a lo comprobado.

## Resumen

Cabaña es una aplicación web para descubrir películas y series, gestionar una lista personal y reproducir contenido audiovisual. Java y Spring Boot implementan servicios REST y seguridad; Supabase aporta PostgreSQL, autenticación y almacenamiento. El frontend reproduce la organización de los diseños entregados y permite cambiar entre tema oscuro y claro.

## Capítulo I Planteamiento del proyecto

**Problema general propuesto:** ¿Cómo desarrollar un servicio web de streaming que permita organizar un catálogo audiovisual, autenticar usuarios y ofrecer reproducción y listas personales de manera integrada?

**Objetivo general:** desarrollar el MVP de Cabaña mediante Java, Spring Boot y Supabase, integrando una interfaz web adaptable con autenticación JWT y administración del catálogo.

Objetivos específicos: implementar la API REST; persistir catálogo, perfiles, favoritos y progreso; aplicar roles USER y ADMIN; integrar el frontend; preparar una configuración de despliegue. Alcance y limitaciones: consultar README, que distingue el modo demo de la conexión real pendiente.

## Capítulo II Marco teórico

Arquitectura cliente-servidor, REST, Spring Boot, inyección de dependencias, JPA, Hibernate, JPQL, transacciones, PostgreSQL, Supabase Auth, JWT, Spring Security y reproducción HTML5. Las referencias oficiales están en README. No afirmar TDD: se implementaron pruebas de integración, sin declarar que se escribieron antes del código.

## Capítulo III Análisis y diseño

| Código | Requerimiento funcional |
|---|---|
| RF01 | Registrar y autenticar usuarios |
| RF02 | Consultar catálogo de películas y series |
| RF03 | Buscar y filtrar por género o tipo |
| RF04 | Consultar detalles y reproducir video disponible |
| RF05 | Añadir y quitar contenidos de la lista personal |
| RF06 | Guardar posición de reproducción |
| RF07 | Administrar el catálogo con rol ADMIN |
| RF08 | Cambiar y recordar el tema oscuro o claro |

Requerimientos no funcionales: protección de rutas, datos personales por usuario, formularios validados, interfaz adaptable y separación en capas. Modelos conceptual, lógico y físico: `docs/ARQUITECTURA.md` y los scripts SQL.

## Capítulo IV Desarrollo del sistema

Backend: entidades, repositorios, servicios, controladores y seguridad. Frontend: pantallas, rutas por hash, formularios, búsqueda, detalles y reproductor. Configuración de Supabase mediante variables de entorno. Evidencias concretas: archivos del proyecto y capturas en `vistas/`.

## Capítulo V Pruebas y resultados

Usar los resultados de `docs/VERIFICACION.md`. Se comprobaron el perfil demo y la interfaz; no atribuir resultados de producción a Supabase sin realizar las pruebas reales. La colección Postman permite repetir comprobaciones de la API.

## Capítulo VI Despliegue

Se entrega un JAR ejecutable, Dockerfile y guía de configuración. Quedan pendientes un servidor real, las variables privadas del proyecto Supabase y los videos autorizados. No hay un enlace externo publicado que pueda presentarse como evidencia.

## Conclusiones recomendaciones y anexos

Redactar conclusiones alineadas con los resultados comprobados cuando se complete el informe. Anexar manual de usuario, manual técnico, código fuente, colección Postman, modelo de datos y capturas. Los enlaces de GitHub y del sistema publicado se incorporarán si se crean posteriormente.
