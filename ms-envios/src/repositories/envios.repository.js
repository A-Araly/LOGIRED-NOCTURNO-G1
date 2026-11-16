// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
// src/repositories/envios.repository.js – versión MySQL
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM envios';
  const condiciones = [];
  const valores = [];
  if (filtros.estado) {
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM envios WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByNumeroGuia(numero_guia) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE numero_guia = ?', [numero_guia]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(envio) {
  const [resultado] = await pool.query(
    'INSERT INTO envios (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [envio.numero_guia, envio.cliente_id, envio.peso_kg, envio.ciudad_destino, envio.direccion_destino, envio.estado, envio.fecha_registro]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, envio) {
  // No se actualiza fecha_registro: se conserva la fecha original
  const [resultado] = await pool.query(
    'UPDATE envios SET numero_guia = ?, cliente_id = ?, peso_kg = ?, ciudad_destino = ?, direccion_destino = ?, estado = ? WHERE id = ?',
    [envio.numero_guia, envio.cliente_id, envio.peso_kg, envio.ciudad_destino, envio.direccion_destino, envio.estado, id]);
  if (resultado.affectedRows === 0) return null;   // no existe; el repositorio solo avisa a la capa de servicio, que lanza el error 404
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM envios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNumeroGuia, create, update, remove };