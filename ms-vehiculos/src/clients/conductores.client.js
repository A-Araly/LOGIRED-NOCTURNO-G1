const HttpError = require('../utils/http-error');

// Consulta a ms-conductores. Reenvía el token del usuario.
async function pedir(ruta, token) {
  try {
    return await fetch(`${process.env.CONDUCTORES_URL}${ruta}`, {
      headers: { Authorization: token },
    });
  } catch (error) {
    return null; // ms-conductores caído
  }
}

// Validación al escribir: true si existe, false si no, 503 si no se pudo verificar
async function existeConductor(id, token) {
  const respuesta = await pedir(`/conductores/${id}`, token);
  if (!respuesta) throw new HttpError(503, 'Microservicio de conductores no disponible');
  if (respuesta.status === 404) return false;
  if (!respuesta.ok) {
    throw new HttpError(
      respuesta.status === 401 || respuesta.status === 403 ? respuesta.status : 503,
      'No fue posible validar el conductor'
    );
  }
  return true;
}

// Composición al leer: varios conductores en UNA petición → Map id → conductor
// Devuelve null si ms-conductores no responde (degradación controlada)
async function conductoresPorIds(ids, token) {
  if (ids.length === 0) return new Map();
  const respuesta = await pedir(`/conductores?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const conductores = await respuesta.json();
  return new Map(conductores.map((c) => [
    c.id,
    { id: c.id, nombre: c.nombre, cedula: c.cedula, categoria: c.categoria, sede: c.sede },
  ]));
}

module.exports = { existeConductor, conductoresPorIds };