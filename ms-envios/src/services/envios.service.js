// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarenvio, construirenvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envio con id ${id}`);
  return envio;
}

async function crear(datos) {
  const errores = validarenvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirenvio(datos);

  // Regla de negocio: no puede haber dos envios con el mismo numero de guia
  // (el numero de guia es único para cada envio). 409 = Conflict.
  if (await repo.findByNumeroGuia(envio.numero_guia)) {
    throw new HttpError(409, `Ya existe un envio con el numero de guia ${envio.numero_guia}`);
  }

  return repo.create(envio);
}

module.exports = { listar, obtener, crear };
