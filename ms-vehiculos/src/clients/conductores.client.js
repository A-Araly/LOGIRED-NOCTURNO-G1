const HttpError = require('../utils/http-error');

const BASE_URL = process.env.CONDUCTORES_URL;

async function existeConductor(id, token) {
  try {
    const respuesta = await fetch(`${BASE_URL}/conductores/${id}`, {
      headers: {
        Authorization: token
      }
    });

    if (respuesta.status === 404) {
      return false;
    }

    if (!respuesta.ok) {
      throw new HttpError(
        respuesta.status === 401 || respuesta.status === 403
          ? respuesta.status
          : 503,
        'No fue posible validar el conductor'
      );
    }

    return true;
  } catch (error) {
    if (error instanceof HttpError) throw error;

    throw new HttpError(503, 'Microservicio de conductores no disponible');
  }
}

// Consultar varios conductores en una sola petición
async function conductoresPorIds(ids, token) {
  if (ids.length === 0) return new Map();

  try {
    const respuesta = await fetch(
      `${BASE_URL}/conductores?ids=${ids.join(',')}`,
      {
        headers: {
          Authorization: token
        }
      }
    );

    if (!respuesta.ok) {
      return null;
    }

    const conductores = await respuesta.json();

    return new Map(
      conductores.map((c) => [
        c.id,
        {
          id: c.id,
          nombre: c.nombre
        }
      ])
    );

  } catch (error) {
    return null;
  }
}

module.exports = { existeConductor, conductoresPorIds };