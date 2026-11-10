// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/cliente');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

async function crear(datos) {
  const clientesExistentes = await repo.findAll();
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);

  // Regla de negocio: no puede haber dos clientes con el mismo email
  // (el email es con lo que se inicia sesión). 409 = Conflict.
  if (await repo.findBydoc(cliente.documento)) {
    throw new HttpError(409, `Ya existe un cliente con el documento ${cliente.documento}`);
  }

  if (await repo.findByEmail(cliente.email)) {
    throw new HttpError(409, `Ya existe un cliente con el email ${cliente.email}`);
  }

  return repo.create(cliente);
}

async function actualizar(id, datos) {
  const clientesExistentes = await repo.findAll();
  const errores = await validarCliente(datos);
  if(errores.length > 0) throw new HttpError(400, "Datos inválidos", errores);

  const cliente = construirCliente(datos);

  const actualizado = await repo.update(id, cliente);
  if(!actualizado) throw new HttpError(404, `No existe el cliente con id ${id}`);

  const otro = await repo.findByEmail(cliente.email);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un cliente con el email ${cliente.email}`);
  }
  const otro1 = await repo.findBydoc(cliente.documento);
  if (otro1 && otro1.id !== id) {
    throw new HttpError(409, `Ya existe un cliente con el documento ${cliente.documento}`);
  }
  return actualizado;

  
}


async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if(!eliminado) throw new HttpError (404, `No existe el cliente con el id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
