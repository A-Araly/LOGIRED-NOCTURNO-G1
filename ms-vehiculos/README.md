# ms-vehiculos

## Descripción
Microservicio que gestiona los **vehículos** de la flota de LogiRed (altas, consultas, cambios y bajas).
- Responsable: Valeria García Pérez
- Puerto: 3005
- Depende de: ms-conductores (puerto 3004)

## Cómo ejecutarlo
Requisitos: Node.js, MySQL, y ms-conductores corriendo (para validar y componer).

1. Crear la base de datos (como root en MySQL):
   ```sql
   CREATE DATABASE vehiculos_db;
   CREATE USER 'vehiculos_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
   GRANT ALL PRIVILEGES ON vehiculos_db.* TO 'vehiculos_user'@'localhost';
   ```
2. Ejecutar `db/schema.sql` conectada con `vehiculos_user`.
3. Copiar `.env.example` como `.env` y ajustar los valores (la `JWT_SECRET` debe ser la del grupo).
4. `npm install`
5. `npm run dev`

### Variables del .env
| Variable | Descripción |
|---|---|
| PORT, HOST | Puerto y dirección donde escucha |
| ROLES | Roles válidos: administrador, despacho, flota |
| DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD | Conexión a MySQL |
| CONDUCTORES_URL | Dirección de ms-conductores |
| JWT_SECRET | Clave compartida del grupo para verificar tokens |

## Representación y atributos
```json
{
  "id": 1,
  "placa": "ABC123",
  "tipo": "furgon",
  "capacidad_kg": 1000,
  "estado": "disponible",
  "conductor_id": 2,
  "conductor": { "id": 2, "nombre": "[...]" }
}
```

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---|---|
| id | entero | generado | lo asigna la base de datos |
| placa | texto (máx. 10) | sí | única (409 si se repite) |
| tipo | texto | sí | [lista de valores] |
| capacidad_kg | entero | sí | mayor que 0 |
| estado | texto | sí | [lista de valores]; por defecto "disponible" |
| conductor_id | entero | [sí / no] | debe existir en ms-conductores |

`conductor` es de solo lectura: lo agrega el servicio al responder.

## Endpoints
(Todos exigen el encabezado `Authorization: Bearer <token>`.)

| Operación | Método | URI | Éxito | Errores |
|---|---|---|---|---|
| Listar | GET | /vehiculos | 200 | 401, 403 |
| Filtrar | GET | /vehiculos?estado=… o ?tipo=… | 200 | 401, 403 |
| Consultar por lotes | GET | /vehiculos?ids=1,3,8 | 200 | 400, 401, 403 |
| Obtener | GET | /vehiculos/:id | 200 | 400, 401, 403, 404 |
| Crear | POST | /vehiculos | 201 | 400, 401, 403, 409, 503 |
| Actualizar | PUT | /vehiculos/:id | 200 | 400, 401, 403, 404, 409, 503 |
| Eliminar | DELETE | /vehiculos/:id | 204 | 400, 401, 403, 404 |

Permisos: consultan administrador, despacho y flota; crean, modifican y eliminan administrador y flota.

[Aquí agrega un ejemplo de petición y de respuesta para crear (POST) y para listar (GET).]

## Relaciones

**Yo consulto a:**

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| conductor_id | ms-conductores | GET /conductores/:id | GET /conductores?ids=… | id, [nombre, …] |

**Me consultan:**

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| [ningún microservicio por ahora] | | |