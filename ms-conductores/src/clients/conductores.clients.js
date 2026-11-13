async function existeconductor(id, token) {​

  const respuesta = await pedir(`/conductores/${id}`, token);​

  if (!respuesta) return null;​

  if (respuesta.status === 404) return false;​

  if (!respuesta.ok) return null;}

// COMPOSICIÓN: varios conductores en UNA petición → Map id → conductor (null si no responde)​

async function conductoresPorIds(ids, token) {​

  if (ids.length === 0) return new Map();​

  const respuesta = await pedir(`/conductores?ids=${ids.join(',')}`, token);​

  if (!respuesta || !respuesta.ok) return null;​

  const conductores = await respuesta.json();​

  return new Map(conductores.map((c) =>​

    [c.id, { id: c.id, nombre: c.nombre, cedula: c.cedula }]));​

}​

module.exports = { existeconductor, conductoresPorIds };​