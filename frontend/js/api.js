// =====================================================================
// API: TODAS las llamadas del frontend pasan por aquí.
//   api('/envios')                                  → GET
//   api('/libros', { method: 'POST', body: {...} }) → POST
// Devuelve los datos de la respuesta, o lanza un ErrorApi con el código
// y el mensaje del microservicio (400, 403, 404, 409, 503…).
// =====================================================================
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles || [];
  }
}

async function api(ruta, opciones = {}) {
  const metodo = opciones.method || 'GET';
  const respuesta = MODO === 'api'
    ? await llamarApiReal(ruta, metodo, opciones.body)
    : await simularApi(ruta, metodo, opciones.body);

  if (respuesta.status === 401 && ruta !== '/usuarios/login') {
    cerrarSesion();                    // sin sesión o token vencido: volver a entrar
    return null;
  }
  if (respuesta.status >= 400) {
    const datos = respuesta.datos || {};
    throw new ErrorApi(respuesta.status, datos.error || 'Error inesperado', datos.detalles);
  }
  return respuesta.datos;
}

// --- MODO 'api': petición real al gateway, con el token ------------------
async function llamarApiReal(ruta, metodo, cuerpo) {
  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  try {
    const r = await fetch(`/api${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const datos = r.status === 204 ? null : await r.json().catch(() => null);
    return { status: r.status, datos };
  } catch (error) {
    return { status: 503, datos: { error: 'No hay conexión con el servidor' } };
  }
}

// --- MODO 'ejemplo': simula los microservicios en el navegador ----------
// Reproduce las mismas reglas de la API (permisos, 400, 404, 409) para que
// las pantallas se comporten igual que con los microservicios reales.
function cargarBase() {
  try {
    const guardada = sessionStorage.getItem('base-ejemplo');
    if (guardada) return JSON.parse(guardada);
  } catch (error) { /* sin almacenamiento: se usan los datos iniciales */ }
  return JSON.parse(JSON.stringify(DATOS_EJEMPLO));
}

function guardarBase(base) {
  try { sessionStorage.setItem('base-ejemplo', JSON.stringify(base)); } catch (e) { /* nada */ }
}

const r = (status, datos) => ({ status, datos });

// Quién puede crear, modificar y eliminar en cada entidad (tabla de permisos del grupo)
const ESCRIBEN = {
  clientes: ['administrador', 'despacho'],
  envios: ['administrador', 'despacho'],
  conductores: ['administrador', 'flota'],
  vehiculos: ['administrador', 'flota'],
};
const sinPassword = ({ password, ...u }) => u;

async function simularApi(ruta, metodo, cuerpo) {
  await new Promise((listo) => setTimeout(listo, 120));   // como si fuera la red
  const base = cargarBase();
  const [camino, consulta] = ruta.split('?');
  const [, recurso, parte] = camino.split('/');
  const params = new URLSearchParams(consulta || '');
  const usuario = usuarioActual();

  // POST /usuarios/login (público)
  if (recurso === 'usuarios' && parte === 'login') {
    const u = base.usuarios.find((x) => x.email === (cuerpo.email || '').trim().toLowerCase());
    if (!u || !u.activo || u.password !== cuerpo.password) {
      return r(401, { error: 'Email o contraseña incorrectos' });
    }
    return r(200, { token: `ejemplo-${u.id}`, usuario: sinPassword(u) });
  }

  if (!usuario) return r(401, { error: 'Falta el token de acceso' });
  const escribe = metodo !== 'GET';
  const id = parte && parte !== 'me' ? Number(parte) : null;

  // Permisos: los mismos de las rutas de cada microservicio
  if (recurso === 'usuarios') {
    const propio = metodo === 'GET' && (parte === 'me' || id === usuario.id);
    if (usuario.rol !== 'administrador' && !propio) {
      return r(403, { error: `El rol ${usuario.rol} no tiene permiso para esta operación` });
    }
  } else if (escribe && !(ESCRIBEN[recurso] || []).includes(usuario.rol)) {
    return r(403, { error: `El rol ${usuario.rol} no tiene permiso para esta operación` });
  }

  const tabla = base[recurso];
  if (!tabla) return r(404, { error: `No existe el recurso ${recurso}` });
  const nombre = { usuarios: 'usuario', clientes: 'cliente', envios: 'envio', conductores: 'conductor', vehiculos: 'vehiculo' }[recurso] || recurso;
  const salida = (fila) => {
    if (recurso === 'usuarios') return sinPassword(fila);
    if (recurso === 'envios') {                                            // composición ms-envios
      const c = base.clientes.find((x) => x.id === fila.cliente_id);
      return { ...fila, cliente: c ? { id: c.id, nombre: c.nombre, telefono: c.telefono } : null };
    }
    if (recurso === 'vehiculos') {                                         // composición ms-vehiculos
      const c = base.conductores.find((x) => x.id === fila.conductor_id);
      return { ...fila, conductor: c ? { id: c.id, nombre: c.nombre, categoria: c.categoria } : null };
    }
    return fila;
  };

  if (metodo === 'GET' && parte === 'me') return r(200, salida(base.usuarios.find((u) => u.id === usuario.id)));
  if (metodo === 'GET' && !id) {
    const estado = params.get('estado');
    return r(200, tabla.filter((f) => !estado || f.estado === estado).map(salida));
  }

  const posicion = id ? tabla.findIndex((f) => f.id === id) : -1;
  if (id && posicion === -1) return r(404, { error: `No existe el ${nombre} con id ${id}` });
  if (metodo === 'GET') return r(200, salida(tabla[posicion]));
  if (metodo === 'DELETE') {
    tabla.splice(posicion, 1);
    guardarBase(base);
    return r(204, null);
  }

  // POST y PUT: validaciones básicas y reglas de negocio
  const errores = validarEjemplo(recurso, cuerpo, metodo === 'POST');
  if (errores.length) return r(400, { error: 'Datos inválidos', detalles: errores });
  const repetido = (campo) => tabla.find((f) => f[campo] === cuerpo[campo] && f.id !== id);
  if (recurso === 'usuarios' && repetido('email')) return r(409, { error: `Ya existe un usuario con el email ${cuerpo.email}` });
  if (recurso === 'clientes' && repetido('documento')) return r(409, { error: `Ya existe un cliente con el documento ${cuerpo.documento}` });
  if (recurso === 'conductores' && repetido('cedula')) return r(409, { error: `Ya existe un conductor con la cedula ${cuerpo.cedula}` });
  if (recurso === 'vehiculos') {
    if (repetido('placa')) return r(409, { error: `Ya existe un vehiculo con la placa ${cuerpo.placa}` });
    if (!base.conductores.some((c) => c.id === cuerpo.conductor_id)) {
      return r(400, { error: `No existe el conductor con id ${cuerpo.conductor_id}` });
    }
  }
  if (recurso === 'envios') {
    if (repetido('numero_guia')) return r(409, { error: `Ya existe un envio con el numero de guia ${cuerpo.numero_guia}` });
    if (!base.clientes.some((c) => c.id === cuerpo.cliente_id)) {
      return r(400, { error: `No existe el cliente con id ${cuerpo.cliente_id}` });
    }
  }

  if (metodo === 'POST') {
    const nuevo = { ...cuerpo, id: Math.max(0, ...tabla.map((f) => f.id)) + 1 };
    if (recurso === 'usuarios' && nuevo.activo === undefined) nuevo.activo = true;
    if (recurso === 'envios') nuevo.fecha_registro = new Date().toISOString().slice(0, 10);
    tabla.push(nuevo);
    guardarBase(base);
    return r(201, salida(nuevo));
  }
  const anterior = tabla[posicion];
  tabla[posicion] = { ...cuerpo, id, password: cuerpo.password || anterior.password };
  if (recurso === 'envios') tabla[posicion].fecha_registro = anterior.fecha_registro;   // no cambia
  if (recurso !== 'usuarios') delete tabla[posicion].password;
  guardarBase(base);
  return r(200, salida(tabla[posicion]));
}

function validarEjemplo(recurso, d, creando) {
  const falta = (campos) => campos.filter((c) => d[c] === undefined || d[c] === '' || d[c] === null)
    .map((c) => `${c} es obligatorio`);
  if (recurso === 'envios') {
    const errores = falta(['numero_guia', 'cliente_id', 'peso_kg', 'ciudad_destino', 'direccion_destino', 'estado']);
    if (d.numero_guia && !/^LR-\d{4}-\d{6}$/.test(d.numero_guia)) errores.push('numero_guia debe tener el formato LR-AAAA-NNNNNN');
    if (d.peso_kg !== undefined && !(Number(d.peso_kg) > 0)) errores.push('peso_kg debe ser mayor que 0');
    return errores;
  }
  if (recurso === 'clientes') return falta(['nombre', 'documento', 'telefono', 'email', 'ciudad']);
  if (recurso === 'conductores') return falta(['nombre', 'cedula', 'categoria', 'sede']);
  if (recurso === 'vehiculos') return falta(['placa', 'tipo', 'capacidad_kg', 'conductor_id', 'estado']);
  if (recurso !== 'usuarios') return [];
  const errores = falta(['nombre', 'email', 'rol']);
  if ((creando || d.password) && (!d.password || d.password.length < 8)) {
    errores.push('password es obligatoria y debe tener al menos 8 caracteres');
  }
  return errores;
}
