// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/envios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}
// GET /envios
// GET/envios, GET/envios?estado=registrado, GET/envios?estado=en_transito, GET/envios?estado=entregado
async function listar(req, res) {
  const filtros = { estado: req.query.estado };  // { estado: 'registrado' } o { estado: 'en_transito' } o { estado: 'entregado' }
  const envios = await service.listar(filtros, req.headers.authorization);
  res.status(200).json(envios);
}
// GET /envios/:id
async function obtener(req, res) {
  const envio = await service.obtener(leerId(req), req.headers.authorization);
  res.status(200).json(envio);
}

// POST /envios
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

//PUT actualizar /envios/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body, req.headers.authorization);
  res.status(200).json(actualizado);
}

//DELETE eliminar /envios/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();         // 204 = No Content: exito pero no hay contenido que devolver
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
