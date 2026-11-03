// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envio con id ${id}`);
  return envio;
}

async function crear(datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);

  // Regla de negocio: no puede haber dos envios con el mismo numero de guia
  // (el numero de guia es único para cada envio). 409 = Conflict.
  if (await repo.findByNumeroGuia(envio.numero_guia)) {
    throw new HttpError(409, `Ya existe un envio con el numero de guia ${envio.numero_guia}`);
  }

  return repo.create(envio);
}

async function actualizar(id, datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, `Datos inválidos `, errores);

  const envio = construirEnvio(datos);

  const duplicado = await repo.findByNumeroGuia(envio.numero_guia);
  if (duplicado && duplicado.id !== id) {
    throw new HttpError(409, `Ya existe un envio con el numero de guia ${envio.numero_guia}`);
  }
  const actualizado= await repo.update(id, envio);
  if (!actualizado) throw new HttpError(404,`No existe el envio con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el envio con id ${id}`);

}

module.exports = { listar, obtener, crear, actualizar, eliminar };
