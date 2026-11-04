// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const pool = require('../db'); 
  
// MySQL guarda BOOLEAN como 0/1: el repositorio lo traduce al formato del contrato 
function aConductor(fila) { 
  return { ...fila, activo: Boolean(fila.activo) };
}

async function findAll(filtros) {
let sql = 'SELECT * FROM conductores'; 
  const condiciones = []; 
  const valores = []; 
  if (filtros.sede) { 
    condiciones.push('sede = ?'); 
    valores.push(filtros.sede); 
  } 
  if (filtros.ids) {                       // ?ids=1,2,3 → WHERE id IN (1, 2, 3) 
    condiciones.push('id IN (?)'); 
    valores.push(filtros.ids); 
  } 
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND '); 
  const [filas] = await pool.query(sql + ' ORDER BY id', valores); 
  return filas.map(aConductor);
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
  return filas.length > 0 ? aConductor(filas[0]) : null;
}

async function findByCedula(cedula) {
  const [filas] = await pool.query('SELECT * FROM conductores WHERE cedula = ?', [cedula]);
  return filas.length > 0 ? aConductor(filas[0]) : null;
}

async function create(conductor) {
  const [result] = await pool.query('INSERT INTO conductores (nombre, cedula, categoria, sede) VALUES (?, ?, ?, ?)', [conductor.nombre, conductor.cedula, conductor.categoria, conductor.sede]);
  return { id: result.insertId, ...conductor };
}

async function update(id, conductor) {
  const [result] = await pool.query('UPDATE conductores SET nombre = ?, cedula = ?, categoria = ?, sede = ? WHERE id = ?', [conductor.nombre, conductor.cedula, conductor.categoria, conductor.sede, id]);
  return result.affectedRows > 0 ? { id, ...conductor } : null;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM conductores WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByCedula, create, update, remove };
