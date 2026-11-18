# ms-conductores

Redes y Servicios Multimedia · UAO · Grupo LOGIRED-NOCTURNO-G1

## Descripción

Microservicio que gestiona los **conductores** de la flota de LogiRed (altas, consultas, cambios y bajas), con **Node.js + Express** organizado en capas y datos en **MySQL**.

- Responsable: Jacobo Díaz Bueno (rol Integrador)
- Puerto: 3004
- Base de datos propia: `conductores_db` (usuario `conductores_user`)
- Es un microservicio **consultado**: ms-vehiculos (puerto 3005) le pregunta por los conductores. No consulta a ningún otro microservicio.
- Seguridad: verifica tokens JWT firmados por ms-usuarios (puerto 3001) con la clave compartida `JWT_SECRET`; no le hace peticiones a ms-usuarios.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`) y MySQL/MariaDB corriendo en el puerto 3306.

**1. Crear la base de datos y el usuario** (como root, en phpMyAdmin o en la consola `mysql`):

```sql
CREATE DATABASE conductores_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'conductores_user'@'localhost' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'localhost';
```

**2. Crear la tabla y los datos de ejemplo** (desde la carpeta `ms-conductores`):

```
mysql -u conductores_user -p conductores_db
mysql> SOURCE db/schema.sql;
```

También sirve la pestaña Importar de phpMyAdmin con la base seleccionada.

**3. Instalar, configurar y arrancar:**

```
npm install                 # descarga las dependencias en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Edite el `.env` con su contraseña de MySQL y la `JWT_SECRET` del grupo. El `.env` real nunca se sube a Git; solo el `.env.example`.

Prueben en el navegador: http://localhost:3004/health (público). El resto de rutas exige token.

### Variables de entorno

| Variable | Valor de ejemplo | Uso |
|---|---|---|
| PORT | 3004 | Puerto donde escucha ms-conductores (el API) |
| HOST | 127.0.0.1 | Solo acepta conexiones desde el mismo equipo |
| DB_HOST | localhost | Equipo donde corre MySQL |
| DB_PORT | 3306 | Puerto de MySQL (distinto del puerto del API) |
| DB_NAME | conductores_db | Base de datos de este microservicio |
| DB_USER | conductores_user | Usuario con permisos solo sobre conductores_db |
| DB_PASSWORD | una_clave_segura | Contraseña del usuario; solo en el .env |
| JWT_SECRET | frase larga del grupo | Debe ser la misma en todos los microservicios del grupo |

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, registro de peticiones en la terminal, /health, montaje de rutas, manejo de errores |
| src/routes/conductores.routes.js | Presentación | Método HTTP + URI → función del controlador, y permisos por rol |
| src/controllers/conductores.controller.js | Presentación | Lee la petición (params, query, body), llama al servicio, arma la respuesta |
| src/services/conductores.service.js | Lógica de negocio | Validaciones y reglas (cédula única); no conoce HTTP ni la base de datos |
| src/repositories/conductores.repository.js | Acceso a datos | Consultas SQL con parámetros (`?`) sobre MySQL |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con las variables `DB_*` |
| src/models/conductor.js | Modelo | Atributos de la entidad y su validación |
| src/middlewares/auth.js | Seguridad | `verificarToken` (401) y `requiereRol` (403); igual en todos los microservicios |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Representación y atributos

```json
{
  "id": 4,
  "nombre": "Andres Gutierrez",
  "cedula": "129389012",
  "categoria": "A",
  "sede": "Medellin"
}
```

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna la base) | Positivo; el cliente nunca lo envía |
| nombre | texto | Sí | No vacío |
| cedula | texto | Sí | Única: 409 si ya la tiene otro conductor |
| categoria | texto | Sí | Categoría de la licencia |
| sede | texto | Sí | Cali, Medellin o Bogota: 400 si es otra |

## Endpoints

Todas las rutas, salvo `/health`, exigen la cabecera `Authorization: Bearer <token>`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Salud | GET | /health | No | 200 `{"servicio":"ms-conductores","estado":"ok"}` | — |
| Listar | GET | /conductores | No | 200 + arreglo de conductores | 401 |
| Filtrar por sede | GET | /conductores?sede=Medellin | No | 200 + arreglo filtrado (puede ser vacío) | 401 |
| Consultar por lotes | GET | /conductores?ids=1,2,3 | No | 200 + arreglo con esos conductores | 400 ids inválidos, 401 |
| Obtener | GET | /conductores/:id | No | 200 + conductor | 400 id no numérico, 401, 404 |
| Crear | POST | /conductores | JSON sin id | 201 + conductor creado | 400, 401, 403, 409 cédula repetida |
| Actualizar | PUT | /conductores/:id | JSON completo sin id | 200 + conductor actualizado | 400, 401, 403, 404, 409 |
| Eliminar | DELETE | /conductores/:id | No | 204 sin cuerpo | 400, 401, 403, 404 |

`ids` es una lista de enteros positivos separados por coma. Es la parte del contrato que usa ms-vehiculos para traer varios conductores en una sola petición.

**Ejemplo: crear**

```
POST http://localhost:3004/conductores
Authorization: Bearer <token>
Content-Type: application/json

{ "nombre": "Andres Gutierrez", "cedula": "129389012", "categoria": "A", "sede": "Medellin" }
```

```
201 Created
{ "id": 4, "nombre": "Andres Gutierrez", "cedula": "129389012", "categoria": "A", "sede": "Medellin" }
```

**Ejemplo: listar**

```
GET http://localhost:3004/conductores
Authorization: Bearer <token>
```

```
200 OK
[
  { "id": 1, "nombre": "Juan Pérez", "cedula": "123456789", "categoria": "A", "sede": "Cali" },
  { "id": 2, "nombre": "Laura Gómez", "cedula": "987654321", "categoria": "B", "sede": "Medellin" }
]
```

## Reglas de negocio

| Regla | Dónde se aplica | Respuesta |
|---|---|---|
| La cédula es única (al actualizar, un conductor puede conservar la suya) | Servicio y restricción UNIQUE en la tabla | 409 |
| La sede debe ser Cali, Medellin o Bogota | Modelo (validación) | 400 |
| Los datos obligatorios deben venir completos | Modelo (validación) | 400 |
| El conductor debe existir para obtenerlo, actualizarlo o eliminarlo | Servicio | 404 |

## Seguridad y permisos por rol

ms-usuarios firma los tokens (`POST /usuarios/login`, con `{ id, nombre, rol }`). Este microservicio verifica la firma con `JWT_SECRET`. Token ausente, modificado o vencido: **401**. Rol sin permiso para la operación: **403**.

| Entidad | Roles que consultan (GET) | Roles que crean, modifican y eliminan |
|---|---|---|
| Conductores | administrador, despacho, flota | administrador, flota |

## Relaciones

ms-conductores no guarda referencias a otros microservicios, así que solo documenta quién lo consulta y qué se compromete a mantener.

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-vehiculos | GET /conductores/:id (validar al crear y actualizar vehículos) · GET /conductores?ids=… (componer al consultar vehículos) | id, nombre |

ms-vehiculos guarda `conductor_id` como un entero sin llave foránea (cada microservicio tiene su propia base de datos) y reenvía el token que recibe. Si cambia el nombre o el tipo de `id` o `nombre` sin avisar, ms-vehiculos dejará de mostrar al conductor en sus respuestas. Las peticiones que llegan de otros microservicios se ven en la terminal donde corre este servicio.
