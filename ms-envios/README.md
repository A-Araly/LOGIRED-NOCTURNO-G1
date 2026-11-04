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
4. Copiar `.env.example` como `.env` y ajustar la contraseña de la base de datos.
5. `npm run dev`

## Recurso: envío

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| id | entero | No (lo asigna el servidor) | Único |
| numero_guia | texto | Sí | Formato LR-AAAA-NNNNNN, único |
| cliente_id | entero | Sí | Entero positivo |
| peso_kg | número | Sí | Mayor que 0 |
| ciudad_destino | texto | Sí | No vacío |
| direccion_destino | texto | Sí | No vacío |
| estado | texto | Sí | registrado, en_transito o entregado |
| fecha_registro | fecha | No (la pone el servidor) | AAAA-MM-DD, no cambia al actualizar |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /envios | N/A | 200 + arreglo | N/A |
| Filtrar | GET | /envios?estado=en_transito | N/A | 200 + arreglo filtrado | N/A |
| Obtener | GET | /envios/:id | N/A | 200 + objeto | 400 id inválido, 404 |
| Crear | POST | /envios | JSON sin id ni fecha | 201 + objeto + cabecera Location | 400, 409 |
| Actualizar | PUT | /envios/:id | JSON completo sin id | 200 + objeto actualizado | 400, 404, 409 |
| Eliminar | DELETE | /envios/:id | N/A | 204 sin cuerpo | 400, 404 |

Ejemplo para crear un envio :

```json
{ "numero_guia": "LR-2026-567893", "cliente_id": 4, "peso_kg": 6, "ciudad_destino": "Cali", "direccion_destino": "calle 143", "estado": "registrado" }
```

Errores: `{ "error": "mensaje", "detalles": ["..."] }` (detalles solo en errores de validación).

Reglas de negocio:
- El número de guía es único: crear o actualizar con una guía de otro envío responde 409.
- El peso debe ser mayor que 0.
- La fecha de registro la asigna el servidor al crear y no cambia al actualizar.

## Relaciones

**Consulto a:** pendiente (semana 2: ms-clientes, para validar que `cliente_id` exista).

**Me consultan:** pendiente (semana 2).

## Pruebas

Colección de Postman en `docs/ms-envios.postman_collection.json`.