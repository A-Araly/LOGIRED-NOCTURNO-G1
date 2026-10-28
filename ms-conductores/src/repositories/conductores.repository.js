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

async function findAll() {
  return conductores;
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

module.exports = { findAll, findById, findByCedula, create };
