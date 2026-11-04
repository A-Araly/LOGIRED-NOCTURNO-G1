// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 2: MySQL. Las funciones siguen siendo async,
// así que la capa de servicio no necesita cambios.
const pool = require('../db');

//MySQL guarda BOOLEAN 
function aVehiculos(fila){
  return {...fila, activo: Boolean(fila.activo)};
}

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM vehiculos';
  const condiciones = [];
  const valores = [];

  if (filtros.estado) {
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }
  if (filtros.tipo) {
    condiciones.push('tipo = ?');
    valores.push(filtros.tipo);
  }
  if (filtros.ids && filtros.ids.length) {   // ?ids=1,2,3 -> WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);               // debe ser un arreglo de números
  }

  if (condiciones.length) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aVehiculos);
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
 return filas.length > 0 ? aVehiculos(filas[0]) : null;
}

async function findByPlaca(placa) {
  const [filas] = await pool.query('SELECT * FROM vehiculos WHERE placa = ?', [placa]);
  return filas.length > 0 ? aVehiculos(filas[0]) : null;
}

async function create(vehiculo) {
  const { placa, tipo, capacidad_kg, estado, conductor_id } = vehiculo;
  const [resultado] = await pool.query(
    `INSERT INTO vehiculos (placa, tipo, capacidad_kg, estado, conductor_id)
     VALUES (?, ?, ?, ?, ?)`,
    [placa, tipo, capacidad_kg, estado || 'disponible', conductor_id ?? null]
  );
  return findById(resultado.insertId);
}

async function update(id, vehiculo) {
  const actual = await findById(id);
  if (!actual) return null;                  // no existe en el repositorio
  const nuevo = { ...actual, ...vehiculo };  // igual que antes: actualiza solo lo enviado
  await pool.query(
    `UPDATE vehiculos
     SET placa = ?, tipo = ?, capacidad_kg = ?, estado = ?, conductor_id = ?
     WHERE id = ?`,
    [nuevo.placa, nuevo.tipo, nuevo.capacidad_kg, nuevo.estado, nuevo.conductor_id ?? null, id]
  );
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;         // false si no existía
}

module.exports = { findAll, findById, findByPlaca, create, update, remove };