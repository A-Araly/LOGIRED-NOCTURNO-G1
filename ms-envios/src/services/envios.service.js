// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');
const clientesClient = require('../clients/clientes.client');

// Relación: el cliente referenciado debe existir en ms-clientes
async function validarCliente(clienteId, token) {
  if (!(await clientesClient.existeCliente(clienteId, token))) {
    throw new HttpError(400, `No existe el cliente con id ${clienteId}`);
  }
}

// Composición: agrega a cada envío los datos del cliente.
// Hace UNA sola consulta a ms-clientes para todos los envíos.
async function componer(envios, token) {
  const lista = Array.isArray(envios) ? envios : [envios];
  const ids = [...new Set(lista.map((e) => e.cliente_id))];
  const clientes = await clientesClient.clientesPorIds(ids, token);

  const compuestos = lista.map((e) => {
    if (clientes === null) {
      return { ...e, cliente: null, aviso: 'ms-clientes no está disponible' };
    }
    return { ...e, cliente: clientes.get(e.cliente_id) || null };
  });

  return Array.isArray(envios) ? compuestos : compuestos[0];
}

async function listar(filtros, token) {
  const envios = await repo.findAll(filtros);
  return componer(envios, token);
}

async function obtener(id, token) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envio con id ${id}`);
  return componer(envio, token);
}

async function crear(datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);

  // Regla de negocio: no puede haber dos envios con el mismo numero de guia
  // (el numero de guia es único para cada envio). 409 = Conflict.
  if (await repo.findByNumeroGuia(envio.numero_guia)) {
    throw new HttpError(409, `Ya existe un envio con el numero de guia ${envio.numero_guia}`);
  }

  await validarCliente(envio.cliente_id, token);
  const creado = await repo.create(envio);
  return componer(creado, token);
}

async function actualizar(id, datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, `Datos inválidos `, errores);

  const envio = construirEnvio(datos);

  const duplicado = await repo.findByNumeroGuia(envio.numero_guia);
  if (duplicado && duplicado.id !== id) {
    throw new HttpError(409, `Ya existe un envio con el numero de guia ${envio.numero_guia}`);
  }

  await validarCliente(envio.cliente_id, token);
  const actualizado = await repo.update(id, envio);
  if (!actualizado) throw new HttpError(404, `No existe el envio con id ${id}`);
  return componer(actualizado, token);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el envio con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };