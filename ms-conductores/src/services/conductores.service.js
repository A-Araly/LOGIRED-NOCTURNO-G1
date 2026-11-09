// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/conductores.repository');
const { validarConductor, construirConductor } = require('../models/conductor');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const conductor = await repo.findById(id);
  if (!conductor) throw new HttpError(404, `No existe el conductor con id ${id}`);
  return conductor;
}

async function crear(datos) {
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const conductor = construirConductor(datos);

  // Regla de negocio: no puede haber dos conductores con la misma cédula
  // (la cedula es con lo que se inicia sesión). 409 = Conflict.
  if (await repo.findByCedula(conductor.cedula)) {
    throw new HttpError(409, `Ya existe un conductor con la cédula ${conductor.cedula}`);
  }
 

  return repo.create(conductor);
}

module.exports = { listar, obtener, crear };
