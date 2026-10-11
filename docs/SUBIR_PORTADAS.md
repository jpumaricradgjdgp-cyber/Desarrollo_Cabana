# Subir portadas desde la computadora

1. Inicia sesión con una cuenta ADMIN y abre **Panel de control**.
2. Pulsa **Nuevo contenido** o **Editar**.
3. En **Portada del contenido**, pulsa **Subir archivo** para abrir el explorador o arrastra una imagen.
4. Revisa la vista previa. **Quitar archivo** cancela esa selección; al editar conserva la portada anterior.
5. Completa el formulario y pulsa **Guardar contenido**. Primero se sube la portada y después se guarda el título.

Una portada por contenido, JPG/JPEG o PNG, hasta 5 MB. El servidor comprueba el archivo real, rechaza imágenes mayores de 6000 px por lado o 24 megapíxeles, reduce el lado mayor a 1920 px y recodifica sin metadatos. La portada es pública porque aparece en el catálogo público. No se modifican los permisos de videos.

Si falla la subida, el formulario conserva la selección para reintentar. Si la imagen subió pero falló el guardado del título, el reintento reutiliza su URL. Las imágenes no se eliminan automáticamente al sustituir o borrar un contenido, para evitar borrar portadas compartidas; las imágenes sin uso se pueden revisar desde Storage.

## Supabase

Ejecuta `supabase/05_portadas.sql` después del esquema. Crea el bucket `portadas`, sus límites y una política de inserción que exige ADMIN en `cabana.accounts`, carpeta del propio UUID y extensión JPG/PNG. La función de comprobación devuelve únicamente si el usuario actual es ADMIN. El backend utiliza la clave pública y el JWT verificado de quien está subiendo; no necesita `service_role` para esta función. No hay permiso para sobrescribir archivos: cada subida tiene un nombre aleatorio nuevo.

En esta laptop la migración ya se aplicó. Para otra instalación, sigue los pasos del README y configura su Supabase.

En demo las portadas viven en memoria y desaparecen al reiniciar, igual que los contenidos de prueba. En Supabase se conservan en Storage.

## Verificación

Pruebas del backend: subida ADMIN, lectura de imagen normalizada, nombres seguros, rechazo de usuarios sin permiso, formatos falsos, ausencia de archivo, tamaños y dimensiones inválidos. El contrato remoto comprueba que se envían la clave pública y el JWT del administrador. La política se comprobó en el PostgreSQL real con operaciones revertidas: acepta al ADMIN en su carpeta y rechaza otras carpetas, SVG y cuentas sin ADMIN. La subida desde una sesión real del usuario queda para su comprobación al iniciar sesión; no se ha utilizado su contraseña.

Referencia: [Control de acceso de Supabase Storage](https://supabase.com/docs/guides/storage/security/access-control).
