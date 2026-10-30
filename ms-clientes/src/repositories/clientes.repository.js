// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'cliente1', documento: '1111777999', telefono: '3115644230', email: 'cliente1@empresa.com', ciudad: 'cali'},
  { id: 2, nombre: 'cliente2', documento: '1111777888', telefono: '5778925985', email: 'cliente2@empresa.com', ciudad: 'medellin'},
  { id: 3, nombre: 'cliente2', documento: '1111777777', telefono: '6667742039', email: 'cliente3@empresa.com', ciudad: 'bogota'},
];
let siguienteId = 4;

async function findAll() {
  return clientes;
}

async function findById(id) {
  return clientes.find((c) => c.id === id) || null;
}

async function findByEmail(email) {
  return clientes.find((c) => c.email === email) || null;
}

async function create(cliente) {
  const nuevo = { id: siguienteId++, ...cliente };
  clientes.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByEmail, create };
