// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.

const repo = require('../repositories/vehiculos.repository');
const conductoresClient = require('../clients/conductores.client');
const { validarVehiculo, construirVehiculo } = require('../models/vehiculo');
const HttpError = require('../utils/http-error');

// Relación: el conductor referenciado debe existir en ms-conductores.
// El cliente lanza 503 si ms-conductores no responde.
async function validarConductor(conductorId, token) {
  if (conductorId === null || conductorId === undefined) return;

  if (!(await conductoresClient.existeConductor(conductorId, token))) {
    throw new HttpError(400, `No existe el conductor con id ${conductorId}`);
  }
}

// COMPOSICIÓN: agrega a cada vehículo su objeto conductor
// con UNA sola consulta a ms-conductores (?ids=)
async function componer(vehiculos, token) {
  const ids = [...new Set(
    vehiculos.map((v) => v.conductor_id).filter((id) => id !== null && id !== undefined)
  )];

  const conductores = await conductoresClient.conductoresPorIds(ids, token);

  // Degradación controlada: ms-conductores caído → se muestra el vehículo igual
  if (!conductores) {
    return vehiculos.map((v) =>
      v.conductor_id === null || v.conductor_id === undefined
        ? { ...v, conductor: null }
        : { ...v, conductor: null, aviso: 'ms-conductores no disponible' }
    );
  }

  return vehiculos.map((v) => ({ ...v, conductor: conductores.get(v.conductor_id) || null }));
}

async function listar(filtros, token) {
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const vehiculo = await repo.findById(id);
  if (!vehiculo) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  const [compuesto] = await componer([vehiculo], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const vehiculo = construirVehiculo(datos);

  // Validar que el conductor exista antes de guardar
  await validarConductor(vehiculo.conductor_id, token);

  // No puede haber dos vehículos con la misma placa
  if (await repo.findByPlaca(vehiculo.placa)) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }

  const nuevo = await repo.create(vehiculo);
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const vehiculo = construirVehiculo(datos);

  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el vehículo con id ${id}`);

  // Validar que el conductor exista antes de actualizar
  await validarConductor(vehiculo.conductor_id, token);

  // La placa no puede pertenecer a otro vehículo
  const otro = await repo.findByPlaca(vehiculo.placa);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }

  const actualizado = await repo.update(id, vehiculo);
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };