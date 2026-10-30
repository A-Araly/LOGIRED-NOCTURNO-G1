// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un envio y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Versión del Taller 1: todavía sin contraseña. La contraseña cifrada
// y el inicio de sesión se agregan en la versión completa (Taller 3).
// =====================================================================

const ESTADOS = ['registrado', 'en_transito', 'entregado'];
const NUMERO_GUIA_VALIDO = /^LR-\d{4}-\d{6}$/;

// 1. Constantes
// Los estados válidos vienen del archivo .env (cada empresa tiene los suyos)
function estadosValidos() {
  return (process.env.ESTADOS || 'registrado,en_transito,entregado')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r !== '');
}

//const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarenvio(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos de envío'];
  }
  if (!datos.numero_guia|| typeof datos.numero_guia !== 'string' || !NUMERO_GUIA_VALIDO.test(datos.numero_guia.trim())) {
    errores.push('número de guía es obligatorio y debe tener un formato válido');
  }
  if (typeof datos.cliente_id !== 'number' || datos.cliente_id <= 0) {
    errores.push('ID del cliente es obligatorio y debe ser un número positivo');
  }
  // peso_kg: número mayor que 0 (puede tener decimales, como 2.5)
  if (!datos.peso_kg|| typeof datos.peso_kg !== 'number' || datos.peso_kg <= 0) {
  errores.push('peso_kg es obligatorio y debe ser un número mayor que 0');
  }
  if (!datos.ciudad_destino || typeof datos.ciudad_destino !== 'string') {
    errores.push('ciudad de destino es obligatoria y debe ser una cadena de texto');
  }
  if (!datos.direccion_destino || typeof datos.direccion_destino !== 'string') {
    errores.push('dirección de destino es obligatoria y debe ser una cadena de texto');
  }

  const estados= estadosValidos();
  if (!estados.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${estados.join(', ')}`);
  }
  return errores;
}

// Construye un envío "limpio" solo con los campos permitidos
function construirenvio(datos) {
  return {
    numero_guia: datos.numero_guia.trim().toLowerCase(),
    cliente_id: datos.cliente_id,
    peso_kg: datos.peso_kg,
    ciudad_destino: datos.ciudad_destino.trim().toLowerCase(),
    direccion_destino: datos.direccion_destino.trim().toLowerCase(),
    estado: datos.estado,
    fecha_registro: new Date().toLocaleDateString('en-CA'), // AAAA-MM-DD en hora local
  };
}

module.exports = { validarenvio, construirenvio };
