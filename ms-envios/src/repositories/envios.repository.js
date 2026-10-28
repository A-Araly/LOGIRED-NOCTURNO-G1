// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const envios = [
  { id: 1, numero_guia: 'LR-2026-567890', cliente_id: 1, peso_kg: 5 , ciudad_destino: 'Bogota', direccion_destino: 'calle 456', estado: "registrado", fecha_registro: "2024-06-01" },
  { id: 2, numero_guia: 'LR-2026-567891', cliente_id: 2, peso_kg: 2, ciudad_destino: 'Cali', direccion_destino: 'carrera 56', estado: "en_transito", fecha_registro: "2024-06-02" },
  { id: 3, numero_guia: 'LR-2026-567892', cliente_id: 3, peso_kg: 10, ciudad_destino: 'Medellin', direccion_destino: 'calle 123', estado: "entregado", fecha_registro: "2024-06-03" },
];
let siguienteId = 4;

async function findAll() {
  return envios;
}

async function findById(id) {
  return envios.find((e) => e.id === id) || null;
}

async function findByNumeroGuia(numero_guia) {
  return envios.find((e) => e.numero_guia === numero_guia) || null;
}

async function create(envio) {
  const nuevo = { id: siguienteId++, ...envio };
  envios.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByNumeroGuia, create };
