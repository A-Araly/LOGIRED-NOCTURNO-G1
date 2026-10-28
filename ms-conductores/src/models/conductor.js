// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Usuario y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Versión del Taller 1: todavía sin contraseña. La contraseña cifrada
// y el inicio de sesión se agregan en la versión completa (Taller 3).
// =====================================================================

// Los roles válidos vienen del archivo .env (cada empresa tiene los suyos)
function rolesValidos() {
  return (process.env.ROLES || 'administrador')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '');
}

function sedesValidas() {
  return (process.env.SEDES || 'Medellin,Bogota,Cali')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarConductor(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del conductor'];
  }
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (typeof datos.cedula !== 'string' || datos.cedula.trim() === '') {
    errores.push('cedula es obligatoria');
  }
  
  if (!sedesValidas().includes(datos.sede)) {
    errores.push(`sede debe ser una de: ${sedesValidas().join(', ')}`);
  }
  
  
  return errores;
}

// Construye un conductor "limpio" solo con los campos permitidos
function construirConductor(datos) {
  return {
    nombre: datos.nombre.trim(),
    cedula: datos.cedula.trim(),
    categoria: datos.categoria.trim(),
    sede: datos.sede,

  };
}

module.exports = { validarConductor, construirConductor };
