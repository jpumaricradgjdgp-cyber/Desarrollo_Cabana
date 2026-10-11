# Carga de Cabaña y acceso de administrador

Las nueve páginas muestran un estado de carga común mientras se inicia la aplicación. En Azul noche y Claro aparece la fogata con un punto que gira; en Halloween aparece una ilustración SVG de Jason con máscara y cuchillo, corriendo en el lugar. No hay sangre ni contenido gráfico. Se respeta la preferencia del navegador para reducir el movimiento.

La interfaz indica qué está preparando: apertura, catálogo o sesión. Después de seis segundos cambia el aviso para explicar que está tardando. Las solicitudes tienen un límite de doce segundos, incluyendo el cuerpo de la respuesta. Si falla la API o el módulo JavaScript, aparece un mensaje y «Reintentar». Un límite general de treinta segundos evita que el inicio quede indefinidamente sin explicación. No se añade una espera artificial para mostrar la animación: desaparece cuando termina la carga real.

El estado se anuncia con `role=status` y el contenedor utiliza `aria-busy` durante la carga. Las animaciones son decorativas y no se anuncian al lector de pantalla. El tema guardado se aplica antes de mostrar los iconos.

## Cuenta administradora en Supabase

El acceso utiliza una cuenta existente y confirmada de Supabase Auth. El rol `ADMIN` se guarda en `cabana.accounts`, asociado al mismo UUID de `auth.users`. El correo del administrador y su contraseña no se incluyen en el repositorio. Inicia sesión con tu correo y tu contraseña actual: el menú mostrará «Panel de control». Si ya estabas dentro cuando cambió tu rol, cierra sesión y vuelve a entrar.

La clave pública, la contraseña de PostgreSQL y la clave de Storage no son contraseñas para el formulario de acceso. Las credenciales `admin@cabana.demo` solo corresponden al perfil demo. No se crea una contraseña adicional al conceder el rol.
