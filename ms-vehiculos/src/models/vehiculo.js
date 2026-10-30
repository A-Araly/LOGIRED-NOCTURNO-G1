// CAPA DE MODELO (entidad)
// Define qué campos tiene un Vehículo y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.

const TIPOS_VALIDOS = ['moto', 'furgon', 'camion'];
const ESTADOS_VALIDOS = ['disponible', 'en_ruta', 'mantenimiento'];

// Placa colombiana: 3 letras + 2 dígitos + 1 dígito o letra (ABC123 carros, ABC12D motos)
const PLACA_VALIDA = /^[A-Z]{3}\d{2}[A-Z\d]$/;

function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor > 0;
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarVehiculo(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del vehículo'];
  }
  if (typeof datos.placa !== 'string' || !PLACA_VALIDA.test(datos.placa.trim().toUpperCase())) {
    errores.push('placa es obligatoria y debe tener un formato válido (ej. ABC123 o ABC12D)');
  }
  if (!TIPOS_VALIDOS.includes(datos.tipo)) {
    errores.push(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
  }
  if (typeof datos.capacidad_kg !== 'number' || !Number.isFinite(datos.capacidad_kg) || datos.capacidad_kg <= 0) {
    errores.push('capacidad_kg es obligatoria y debe ser un número mayor que 0');
  }
  if (datos.estado !== undefined && !ESTADOS_VALIDOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  if (datos.conductor_id !== undefined && datos.conductor_id !== null && !esEnteroPositivo(datos.conductor_id)) {
    errores.push('conductor_id debe ser un entero positivo o null');
  }
  return errores;
}

// Construye un vehículo "limpio" solo con los campos permitidos
function construirVehiculo(datos) {
  return {
    placa: datos.placa.trim().toUpperCase(),
    tipo: datos.tipo,
    capacidad_kg: datos.capacidad_kg,
    estado: datos.estado === undefined ? 'disponible' : datos.estado,
    conductor_id: datos.conductor_id === undefined ? null : datos.conductor_id,
  };
}

module.exports = { validarVehiculo, construirVehiculo };