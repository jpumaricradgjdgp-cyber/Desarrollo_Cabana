# Avance 2 — Cabaña

Alcance: semanas 1–10. El informe llega hasta 4.3, seguridad. El frontend existente utiliza HTML, CSS y JavaScript.

| Tema | Evidencia | Estado |
|---|---|---|
| Spring Boot y entorno | pom.xml y perfiles | JDK 21 / Boot 3.5.16 |
| Endpoints e inyección | api/ y constructores service/ | Implementado |
| TDD | src/test/ | Pruebas; historial red–green–refactor pendiente |
| REST y pruebas | API.md, Postman y MockMvc | Implementado |
| JPA / Hibernate y CRUD | model/, repository/ y CatalogService | Verificado en demo y pruebas |
| JPQL y transacciones | search y @Transactional | Verificado en pruebas |
| Roles y permisos | SecurityConfig + accounts | USER / ADMIN |
| JWT | JWKS, firma, emisor, audiencia y sub | Contrato externo simulado |
| Integración | pages/, css/, js/ y assets/ | Tres temas, carga y portadas |

## Evidencia del 11/10/2026

CabanaIntegrationTest: 9 pruebas; SupabaseContractTest: 4 pruebas. Total 13, sin fallos, errores u omisiones. La segunda suite simula Auth, JWKS y Storage.

Catálogo conectado: 13 títulos y 9 géneros. Acceso anónimo al panel: 401. Capturas de los tres temas sin errores JavaScript. La foto nombrada JPG era AVIF y fue convertida a JPEG real por el frontend, guardada y editada en demo.

Falta validar login final de la cuenta real, portada con esa sesión, MP4 privado propio, despliegue HTTPS, pruebas de carga y un ciclo TDD documentado. No hay Swagger/OpenAPI, Angular o JSP. Logback está incluido transitivamente; no se declaran Guava, POI o Commons como funciones propias.

## Reproducibilidad

Desde backend: `.\mvnw.cmd test` en Windows o `./mvnw test`. JDK 21 e internet para la primera descarga. Iniciar_Cabana.cmd utiliza demo sin .env y Supabase con configuración privada local. .env.example sirve de guía; los secretos nunca se incluyen en ZIP o GitHub.

El código incluye backend, frontend, SQL, scripts, pruebas, documentación y colección Postman. Modelos: ARQUITECTURA.md y avance2/DIAGRAMAS.md.

## Límites técnicos

La subida a Storage y la escritura de catálogo no son una transacción distribuida. Puede quedar una portada huérfana. La salida administrativa actual es Content; se recomienda un DTO específico. La búsqueda no tiene paginación ni medición de rendimiento. No se presenta localhost como sitio público desplegado.
