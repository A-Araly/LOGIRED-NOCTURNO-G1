// =====================================================================
// CONFIGURACIÓN DEL FRONTEND
// MODO 'ejemplo': datos simulados (js/datos-ejemplo.js), sin microservicios.
//                 Es el modo del Taller 2: se abre login.html con doble clic.
// MODO 'api':     llama a los microservicios a través del gateway (/api/...).
//                 Es el modo del Taller 3, con el frontend servido por Apache.
// =====================================================================
const MODO = 'ejemplo';

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: 'admin.html',
  despacho: 'despacho.html',
  flota: 'flota.html',
};

// Qué secciones ve cada rol y si puede modificarlas.
// Es solo para la interfaz: quien decide de verdad es el microservicio (403).
// Cada responsable agrega aquí la fila de su entidad.
// Cada responsable agrega aquí la fila de su pestaña cuando sube su pantalla
// (y su <script src="js/<entidad>.js"> en admin.html, despacho.html y flota.html).
const SECCIONES_POR_ROL = {
  administrador: [
    { id: 'envios', nombre: 'Envíos', editar: true },
    { id: 'usuarios', nombre: 'Usuarios', editar: true },
    { id: 'conductores', nombre: 'Conductores', editar: true },
  ],
  despacho: [
    { id: 'envios', nombre: 'Envíos', editar: true },
    { id: 'conductores', nombre: 'Conductores', editar: false },
  ],
  flota: [
    { id: 'envios', nombre: 'Envíos', editar: false },
    { id: 'conductores', nombre: 'Conductores', editar: true },
  ],
};

const ROLES = ['administrador', 'despacho', 'flota'];
