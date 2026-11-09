
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.

const repo = require('../repositories/vehiculos.repository');
const { validarVehiculo, construirVehiculo } = require('../models/vehiculo');
const HttpError = require('../utils/http-error');

// Validar que el conductor exista en ms-conductores
async function validarConductor(conductorId, token) {
  // Si no tiene conductor asignado, no necesita validación
  if (conductorId === null || conductorId === undefined) {
    return;
  }

  try {
    const conductoresUrl = process.env.CONDUCTORES_URL;

    const respuesta = await fetch(
      `${conductoresUrl}/conductores/${conductorId}`,
      {
        headers: {
          Authorization: token
        }
      }
    );

    if (respuesta.status === 404) {
      throw new HttpError(400, 'El conductor indicado no existe');
    }

    if (!respuesta.ok) {
      throw new HttpError(503, 'No fue posible validar el conductor');
    }

  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(503, 'El servicio de conductores no está disponible');
  }
}

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const vehiculo = await repo.findById(id);
  if (!vehiculo) throw new HttpError(404, `No existe el vehículo con id ${id}`);
  return vehiculo;
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

  return repo.create(vehiculo);
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

  return repo.update(id, vehiculo);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el vehículo con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
