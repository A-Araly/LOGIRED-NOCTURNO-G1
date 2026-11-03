// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const pool = require('../db');

function aClientes(fila) {
  return {...fila};
}

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM clientes';
  const condiciones = [];
  const valores = [];

  if(filtros.ciudad){
    condiciones.push('ciudad = ?');
    valores.push(filtros.ciudad);
  }
  if(filtros.ids){
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if(condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aClientes);
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM clientes WHERE id = ?',[id]);
  return filas.length > 0 ? aClientes(filas[0]) : null;
}

async function findByEmail(email) {
  const [filas] = await pool.query('SELECT * FROM clientes WHERE email = ?', [email]);
  return filas.length > 0 ? aClientes(filas[0]) : null;
}

async function create(cliente) {
  const [resultado] = await pool.query('INSERT INTO clientes (nombre, documento, telefono, email, ciudad) VALUES (?, ?, ?, ?, ?)',
  [cliente.nombre, cliente.documento, cliente.telefono, cliente.email, cliente.ciudad]);
  return findById(resultado.insertId);
}

async function update(id, cliente) {
  const [resultado] = await pool.query('UPDATE clientes SET nombre = ?, documento = ?, telefono = ?, email = ?, ciudad = ? WHERE id = ?',
  [cliente.nombre, cliente.documento, cliente.telefono, cliente.email, cliente.ciudad, id]);
  if(resultado.affectedRows === 0) return null;
  return findById(id)
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?',[id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, create, update, remove};
