-- 1. Registrar tu cuenta desde Cabaña y confirmar su correo.
-- 2. Iniciar sesión una vez para crear el perfil cabana.accounts.
-- 3. Sustituir el correo de ejemplo y ejecutar desde SQL Editor.
update cabana.accounts set role = 'ADMIN' where email = 'tu-correo@ejemplo.com';
-- Los roles se consultan en la base de datos; no se aceptan roles de user_metadata.
