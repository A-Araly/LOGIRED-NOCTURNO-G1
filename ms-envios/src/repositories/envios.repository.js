// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.

const { validarEnvio } = require("../models/envio");

// =====================================================================
const envios = [
  { id: 1, numero_guia: 'LR-2026-567890', cliente_id: 1, peso_kg: 5 , ciudad_destino: 'Bogota', direccion_destino: 'calle 456', estado: "registrado", fecha_registro: "2024-06-01" },
  { id: 2, numero_guia: 'LR-2026-567891', cliente_id: 2, peso_kg: 2, ciudad_destino: 'Cali', direccion_destino: 'carrera 56', estado: "en_transito", fecha_registro: "2024-06-02" },
  { id: 3, numero_guia: 'LR-2026-567892', cliente_id: 3, peso_kg: 10, ciudad_destino: 'Medellin', direccion_destino: 'calle 123', estado: "entregado", fecha_registro: "2024-06-03" },
];
let siguienteId = 4;

async function findAll(filtros) {
  return envios.filter((e) => 
    (!filtros.estado || e.estado === filtros.estado) &&
    (!filtros.ids || filtros.ids.includes(e.id))
  );
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

async function update(id, envio) {
  const posicion = envios.findIndex((e) => e.id === id);
  if (posicion === -1) return null;    //no exixte; el repositorio solo avisa a la capa de servicio, que lanza el error 404
  envios[posicion] = { id, ...envio, fecha_registro: envios[posicion].fecha_registro };
  return envios[posicion];
}

async function remove(id) {
  const posicion = envios.findIndex((e) => e.id === id);
  if (posicion === -1) return false;

  envios.splice(posicion, 1);
  return true;
}

module.exports = { findAll, findById, findByNumeroGuia, create , update, remove };
