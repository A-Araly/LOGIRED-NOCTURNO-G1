// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async para que el cambio a una base de datos
// real no obligue a modificar la capa de servicio.
const vehiculos = [
  { id: 1, placa: 'ABC123', tipo: 'furgon', capacidad_kg: 1200, estado: 'disponible', conductor_id: 1 },
  { id: 2, placa: 'XYZ789', tipo: 'camion', capacidad_kg: 5000, estado: 'en_ruta', conductor_id: 2 },
  { id: 3, placa: 'KLM45B', tipo: 'moto', capacidad_kg: 40, estado: 'mantenimiento', conductor_id: null },
];
let siguienteId = 4;

async function findAll() {
  return vehiculos;
}

async function findById(id) {
  return vehiculos.find((v) => v.id === id) || null;
}

async function findByPlaca(placa) {
  return vehiculos.find((v) => v.placa === placa) || null;
}

async function create(vehiculo) {
  const nuevo = { id: siguienteId++, ...vehiculo };
  vehiculos.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByPlaca, create };