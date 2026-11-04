// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const conductores = [
  { id: 1, nombre: 'Administrador General', cedula: '123456789', categoria: 'A', sede: 'Cali' },
  { id: 2, nombre: 'Laura Gómez', cedula: '987654321', categoria: 'B', sede: 'Medellin' },
  { id: 3, nombre: 'Andrés Castillo', cedula: '456789123', categoria: 'C', sede: 'Bogota' },
];
let siguienteId = 4;

async function findAll(filtros) {
  return conductores.filter((c) => 
(!filtros.sede || c.sede === filtros.sede) &&
(!filtros.ids || filtros.ids.includes(c.id))
  )
}

async function findById(id) {
  return conductores.find((c) => c.id === id) || null;
}

async function findByCedula(cedula) {
  return conductores.find((c) => c.cedula === cedula) || null;
}

async function create(conductor) {
  const nuevo = { id: siguienteId++, ...conductor };
  conductores.push(nuevo);
  return nuevo;
}

async function update(id, conductor) {
  const posicion = conductores.findIndex((c) => c.id === id);
  if (posicion === -1) {
    return null;
  }
  conductores[posicion] = { ...conductor, id };
  return conductores[posicion];
}

async function remove(id) {
  const posicion = conductores.findIndex((c) => c.id === id);
  if (posicion === -1) {
    return false;
  }
  conductores.splice(posicion, 1);
  return true;
}

module.exports = { findAll, findById, findByCedula, create, update, remove };
