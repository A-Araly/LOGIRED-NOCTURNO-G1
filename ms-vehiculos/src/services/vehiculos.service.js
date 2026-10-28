// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
const repo = require('../repositories/vehiculos.repository');
const { validarVehiculo, construirVehiculo } = require('../models/vehiculo');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const vehiculo = await repo.findById(id);
  if (!vehiculo) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  return vehiculo;
}

async function crear(datos) {
  const errores = validarVehiculo(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const vehiculo = construirVehiculo(datos);

  // Regla de negocio: no puede haber dos vehículos con la misma placa. 409 = Conflict.
  if (await repo.findByPlaca(vehiculo.placa)) {
    throw new HttpError(409, `Ya existe un vehículo con la placa ${vehiculo.placa}`);
  }

  // Taller 3: aquí se validará que conductor_id exista en ms-conductores

  return repo.create(vehiculo);
}

module.exports = { listar, obtener, crear };