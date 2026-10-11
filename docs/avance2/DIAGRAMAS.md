# Diagramas del Avance 2

## Proceso macro propuesto

```mermaid
flowchart LR
 A[Preparar catálogo] --> B[Publicar metadatos] --> C[Descubrir contenido]
 C --> D[Iniciar sesión] --> E[Organizar lista y reproducir] --> F[Mantener catálogo]
```

## Flujo de alta administrativa

```mermaid
flowchart TD
 A([Inicio]) --> B[Completar metadatos y escoger portada]
 B --> C[Enviar con sesión ADMIN]
 C --> D[Validar JWT, rol, DTO y archivo]
 D --> E{¿Solicitud válida?}
 E -->|No| F[Informar error y corregir]
 E -->|Sí| G[Subir portada a Storage]
 G --> H[Guardar contenido con transacción JDBC]
 H --> I([Catálogo actualizado])
```

La transacción solo afecta a PostgreSQL. Storage necesita compensación y limpieza independientes.

## WBS

```mermaid
flowchart TD
 A[Cabaña · Avance 2] --> B[1. Inicio: problema y requisitos]
 A --> C[2. Diseño: modelos y procesos]
 A --> D[3. API: DTO y pruebas]
 A --> E[4. Datos: CRUD, JPQL y transacciones]
 A --> F[5. Seguridad: roles y JWT]
 A --> G[6. Integración: frontend y portadas]
 A --> H[7. Cierre: informe, presentación y fuentes]
```

## Clases

```mermaid
classDiagram
 class Account {
  UUID id
  String email
  String role
 }
 class Content {
  UUID id
  String title
  String type
  String genre
 }
 class SavedItem {
  UUID id
  UUID userId
  Content content
 }
 class WatchProgress {
  UUID id
  UUID userId
  Content content
  long seconds
 }
 SavedItem "0..*" --> "1" Content
 WatchProgress "0..*" --> "1" Content
```

userId es escalar en Java. Las FK hacia auth.users están en 01_schema.sql. No hay asociación JPA directa Account–SavedItem/WatchProgress.

Visitante: catálogo, detalle, registro y login. USER: lista, progreso y reproducción. ADMIN: operaciones USER más CRUD y portada. Modelos completos de arquitectura y relaciones: [ARQUITECTURA.md](../ARQUITECTURA.md).
