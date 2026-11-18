# Frontend · LogiRed

HTML, CSS y JavaScript, sin framework ni instalación. Basado en el frontend de ejemplo de la docente.

## Cómo abrirlo

**Modo ejemplo (Taller 2):** doble clic en `login.html` y elegir una cuenta de prueba (Administrador, Despacho o Flota). Los datos son simulados (`js/datos-ejemplo.js`) y los cambios duran hasta cerrar la pestaña.

**Modo api (Taller 3):** en `js/config.js` cambiar `const MODO = 'ejemplo';` por `'api'` y copiar la carpeta a `/var/www/app` de servidor2. Las pantallas llaman a `/api/<recurso>` a través del gateway de Apache, con el token del usuario.

## Estructura

| Archivo | Qué hace | Responsable |
|---|---|---|
| `login.html` | Inicio de sesión; lleva a cada usuario a la página de su rol | Grupo |
| `admin.html`, `despacho.html`, `flota.html` | Página de inicio de cada rol | Grupo |
| `js/config.js` | Modo, página de cada rol y secciones que ve cada rol | Arquitecto |
| `js/api.js` | Todas las llamadas a la API (y el simulador del modo ejemplo) | Arquitecto |
| `js/sesion.js`, `js/app.js` | Sesión y estructura común (menú, mensajes, formularios) | Grupo |
| `js/clientes.js` | Pantalla de clientes (ms-clientes) | Araly (pendiente) |
| `js/envios.js` | Pantalla de envíos (ms-envios), con el cliente compuesto | Vanessa |
| `js/conductores.js` | Pantalla de conductores (ms-conductores) | Jacobo (pendiente) |
| `js/vehiculos.js` | Pantalla de vehículos (ms-vehiculos), con el conductor compuesto | Valeria (pendiente) |
| `js/usuarios.js` | Pantalla de usuarios (ms-usuarios, solo administrador) | Docente / integrador |
| `js/datos-ejemplo.js` | Datos simulados, con las filas iniciales de cada `schema.sql` | Cada responsable |

## Permisos por rol (solo interfaz; quien decide es el microservicio)

| Sección | administrador | despacho | flota |
|---|---|---|---|
| Envíos | ver y editar | ver y editar | ver |
| Clientes | ver y editar | ver y editar | ver |
| Vehículos | ver y editar | ver | ver y editar |
| Conductores | ver y editar | ver | ver y editar |
| Usuarios | ver y editar | no | no |

## Cómo agregar su pestaña

1. Crear `js/<entidad>.js` con `PANTALLAS.<entidad> = async function (contenedor, { editar, titulo }) { ... }` (ver `js/envios.js` como modelo).
2. En `js/config.js`, agregar la fila `{ id: '<entidad>', nombre: '...', editar: true/false }` en cada rol que la vea.
3. En `admin.html`, `despacho.html` y `flota.html`, agregar `<script src="js/<entidad>.js"></script>` antes de `js/usuarios.js`.
4. En `js/datos-ejemplo.js`, agregar las filas iniciales de su `schema.sql` (ya están las de clientes, conductores y vehículos).
