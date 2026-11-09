# ms-vehiculos · LogiRed (Taller 1, Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **vehículos** de reparto de LogiRed,
con **Node.js + Express** organizado en capas. Versión del Taller 1: datos en memoria y tres operaciones.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev
```

Prueben en el navegador: http://localhost:3005/health y http://localhost:3005/vehiculos

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/vehiculos.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/vehiculos.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/vehiculos.service.js | Lógica de negocio | Validaciones y reglas (placa única); no conoce HTTP ni la base de datos |
| src/repositories/vehiculos.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/vehiculo.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Contrato de la API

Atributos de un vehículo:

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna el servicio) | Positivo y único |
| placa | texto | Sí | Formato ABC123 o ABC12D; se guarda en mayúsculas; única (409 si se repite) |
| tipo | texto | Sí | moto, furgon o camion |
| capacidad_kg | número | Sí | Mayor que 0 |
| estado | texto | No (por defecto disponible) | disponible, en_ruta o mantenimiento |
| conductor_id | entero | No | Entero positivo o null. Referencia a ms-conductores |

Ejemplo de respuesta de `GET /vehiculos/1`:

```json
{ "id": 1, "placa": "ABC123", "tipo": "furgon", "capacidad_kg": 1200, "estado": "disponible", "conductor_id": 1 }
```

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-vehiculos","estado":"ok"}` |
| GET | /vehiculos | 200 arreglo de vehículos |
| GET | /vehiculos/:id | 200 vehículo · 400 id inválido · 404 no existe |
| POST | /vehiculos | 201 vehículo creado · 400 datos inválidos · 409 placa repetida |

Ejemplo de cuerpo para POST:
`{"placa": "DEF456", "tipo": "furgon", "capacidad_kg": 900, "conductor_id": 2}`
