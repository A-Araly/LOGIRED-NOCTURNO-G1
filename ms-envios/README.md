# ms-envios - Contrato de la API

Microservicio de envíos de LogiRed S.A.S. Responsable: Vanessa. Puerto: **3003**.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior y MySQL (en XAMPP corre MariaDB).

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE envios_db;
CREATE USER 'envios_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'localhost';
```

2. Crear la tabla: en la consola `mysql -u root` ejecutar `USE envios_db;` y luego `SOURCE db/schema.sql;`
3. `npm install`
4. Copiar `.env.example` como `.env` y ajustar la contraseña de la base de datos. `JWT_SECRET` debe ser la misma clave que usa ms-usuarios.
5. `npm run dev`

Para probar la seguridad y las relaciones también deben estar corriendo ms-usuarios (3001) y ms-clientes (3002).

### Variables de entorno

| Variable | Ejemplo | Uso |
|---|---|---|
| PORT | 3003 | puerto del microservicio |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | localhost, 3306, envios_db... | conexión a MySQL |
| JWT_SECRET | logired-nocturno-2026-1 | misma clave en todos los microservicios |
| CLIENTES_URL | http://127.0.0.1:3002 | dirección de ms-clientes |

## Recurso: envío

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| id | entero | No (lo asigna el servidor) | Único |
| numero_guia | texto | Sí | Formato LR-AAAA-NNNNNN, único |
| cliente_id | entero | Sí | Entero positivo, debe existir en ms-clientes |
| peso_kg | número | Sí | Mayor que 0 |
| ciudad_destino | texto | Sí | No vacío |
| direccion_destino | texto | Sí | No vacío |
| estado | texto | Sí | registrado, en_transito o entregado |
| fecha_registro | fecha | No (la pone el servidor) | AAAA-MM-DD, no cambia al actualizar |

## Endpoints

Todos los endpoints de `/envios` exigen la cabecera `Authorization: Bearer <token>`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /envios | N/A | 200 + arreglo (con `cliente`) | 401 |
| Filtrar | GET | /envios?estado=en_transito | N/A | 200 + arreglo filtrado | 401 |
| Obtener | GET | /envios/:id | N/A | 200 + objeto (con `cliente`) | 400 id inválido, 401, 404 |
| Crear | POST | /envios | JSON sin id ni fecha | 201 + objeto + cabecera Location | 400, 401, 403, 409, 503 |
| Actualizar | PUT | /envios/:id | JSON completo sin id | 200 + objeto actualizado | 400, 401, 403, 404, 409, 503 |
| Eliminar | DELETE | /envios/:id | N/A | 204 sin cuerpo | 400, 401, 403, 404 |

Ejemplo para crear un envío:

```json
{ "numero_guia": "LR-2026-567893", "cliente_id": 1, "peso_kg": 6, "ciudad_destino": "Cali", "direccion_destino": "calle 143", "estado": "registrado" }
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

Reglas de negocio:
- El número de guía es único: crear o actualizar con una guía de otro envío responde 409.
- El peso debe ser mayor que 0.
- La fecha de registro la asigna el servidor al crear y no cambia al actualizar.
- El cliente debe existir en ms-clientes: si no existe responde 400, y si ms-clientes no responde, 503.

## Seguridad (JWT)

El token se obtiene en ms-usuarios (`POST /usuarios/login`). ms-envios lo verifica con la misma clave `JWT_SECRET`, sin consultar a ms-usuarios.

| Endpoint | administrador | despacho | flota |
|---|---|---|---|
| GET /envios, GET /envios/:id | sí | sí | sí |
| POST /envios | sí | sí | no (403) |
| PUT /envios/:id | sí | sí | no (403) |
| DELETE /envios/:id | sí | sí | no (403) |

Sin token o con token inválido o vencido: 401. `GET /health` es público.

Estos permisos siguen la tabla de permisos por entidad acordada por el grupo: despacho gestiona clientes y envíos, y flota gestiona conductores y vehículos.

## Relaciones

**Consulto a:** ms-clientes, por el campo `cliente_id`.

**Me consultan:** ninguno.

| Momento | Petición a ms-clientes | Si el cliente no existe | Si ms-clientes está caído |
|---|---|---|---|
| Validación (POST y PUT) | `GET /clientes/:id` | 400, no se guarda | 503, no se guarda |
| Composición (GET) | `GET /clientes?ids=1,2,3` (una sola petición por listado) | `cliente: null` | 200 con `cliente: null` y `aviso` |

Datos del cliente que uso: `id`, `nombre`, `telefono`. El token del usuario se reenvía a ms-clientes en la cabecera `Authorization`. No hay llave foránea entre bases de datos: cada microservicio tiene la suya.

Ejemplo de un envío compuesto:

```json
{ "id": 1, "numero_guia": "LR-2026-567890", "cliente_id": 1, "peso_kg": 5, "ciudad_destino": "Bogota", "direccion_destino": "calle 456", "estado": "registrado", "fecha_registro": "2024-06-01", "cliente": { "id": 1, "nombre": "cliente1", "telefono": "3115644230" } }
```

## Pruebas

Colección de Postman en `docs/ms_envios.postman_collection.json`. Incluye:

- **CRUD:** listar, filtrar, obtener, crear, actualizar y eliminar, con sus errores (400, 404, 409).
- **Seguridad:** 401 sin token, 401 con token alterado, y un caso por rol: administrador y despacho crean (201), despacho y flota consultan (200), flota no puede crear (403).
- **Relaciones:** 201 con cliente existente, 400 con cliente inexistente, obtener, listar y actualizar con los datos del cliente, y con ms-clientes detenido: listar responde 200 con `aviso` y crear responde 503.

Los tokens se obtienen con el login de ms-usuarios (administrador, despacho y flota) y se pegan en la autorización de cada petición.