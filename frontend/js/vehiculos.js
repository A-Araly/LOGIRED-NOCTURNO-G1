// =====================================================================
// PANTALLA DE VEHÍCULOS (responsable: ms-vehiculos · Valeria)
// Usa: GET /vehiculos?estado=, POST, PUT, DELETE /vehiculos/:id
// El nombre del conductor llega DENTRO de cada vehículo (composición que
// hace ms-vehiculos con ms-conductores). Solo el formulario pide
// GET /conductores, para llenar la lista de opciones.
// =====================================================================
const ESTADOS_VEHICULO = [
  { valor: 'disponible', texto: 'Disponible' },
  { valor: 'en_ruta', texto: 'En ruta' },
  { valor: 'mantenimiento', texto: 'Mantenimiento' },
];
const textoEstadoVehiculo = (e) => (ESTADOS_VEHICULO.find((x) => x.valor === e) || { texto: e }).texto;

PANTALLAS.vehiculos = async function (contenedor, { editar, titulo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-vehiculos">Cargando…</p>
      </div>
      <div class="herramientas">
        <div class="filtro" role="group" aria-label="Filtrar por estado">
          <button data-estado="" aria-pressed="true">Todos</button>
          ${ESTADOS_VEHICULO.map((e) => `<button data-estado="${e.valor}" aria-pressed="false">${e.texto}</button>`).join('')}
        </div>
        ${editar ? '<button class="boton" id="nuevo-vehiculo">Agregar vehículo</button>' : ''}
      </div>
    </div>
    <div id="aviso-vehiculos"></div>
    <div class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Placa</th>
            <th scope="col">Tipo</th>
            <th scope="col">Capacidad</th>
            <th scope="col">Conductor</th>
            <th scope="col">Estado</th>
            ${editar ? '<th scope="col"><span class="oculto">Acciones</span></th>' : ''}
          </tr>
        </thead>
        <tbody id="lista-vehiculos"></tbody>
      </table>
    </div>`;

  let vehiculos = [];
  let estado = '';

  const pintar = () => {
    const aviso = vehiculos.find((v) => v.aviso);
    document.getElementById('aviso-vehiculos').innerHTML = aviso
      ? `<p class="mensaje mensaje-alerta">No se pudieron cargar los conductores (${esc(aviso.aviso)}). Los vehículos se muestran sin ellos.</p>`
      : '';
    const disponibles = vehiculos.filter((v) => v.estado === 'disponible').length;
    document.getElementById('resumen-vehiculos').textContent = estado
      ? `${vehiculos.length} vehículos ${textoEstadoVehiculo(estado).toLowerCase()}`
      : `${vehiculos.length} vehículos, ${disponibles} disponibles`;

    document.getElementById('lista-vehiculos').innerHTML = vehiculos.length
      ? vehiculos.map((v) => `
        <tr>
          <td><strong>${esc(v.placa)}</strong></td>
          <td>${esc(v.tipo)}</td>
          <td>${esc(v.capacidad_kg)} kg</td>
          <td>
            ${v.conductor
              ? `${esc(v.conductor.nombre)}<span class="sub">Licencia ${esc(v.conductor.categoria)}</span>`
              : `<span class="sub">Conductor ${esc(v.conductor_id)} (sin datos)</span>`}
          </td>
          <td><span class="sello sello-${esc(v.estado)}">${esc(textoEstadoVehiculo(v.estado))}</span></td>
          ${editar ? `
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${v.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${v.id}">Eliminar</button>
          </td>` : ''}
        </tr>`).join('')
      : `<tr><td class="vacio" colspan="6">No hay vehículos ${estado ? 'con ese estado' : 'registrados'}.</td></tr>`;
  };

  const cargar = async () => {
    try {
      vehiculos = await api(estado ? `/vehiculos?estado=${estado}` : '/vehiculos');
      pintar();
    } catch (error) {
      document.getElementById('resumen-vehiculos').textContent = 'No se pudieron cargar los vehículos.';
      mostrarError(error);
    }
  };

  contenedor.querySelector('.filtro').onclick = (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;
    estado = boton.dataset.estado;
    contenedor.querySelectorAll('.filtro button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b === boton)));
    cargar();
  };

  const camposVehiculo = async () => {
    const conductores = await api('/conductores');
    return [
      { nombre: 'placa', etiqueta: 'Placa', ayuda: 'ABC123' },
      { nombre: 'tipo', etiqueta: 'Tipo', ayuda: 'furgon, camion…' },
      { nombre: 'capacidad_kg', etiqueta: 'Capacidad (kg)', tipo: 'number', min: 0 },
      { nombre: 'conductor_id', etiqueta: 'Conductor', tipo: 'select', numero: true,
        opciones: conductores.map((c) => ({ valor: c.id, texto: `${c.nombre} (licencia ${c.categoria})` })) },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ESTADOS_VEHICULO },
    ];
  };

  if (editar) {
    document.getElementById('nuevo-vehiculo').onclick = async () => {
      try {
        const datos = await pedirDatos('Agregar vehículo', await camposVehiculo(),
          { estado: 'disponible' }, 'Agregar vehículo');
        if (!datos) return;
        await api('/vehiculos', { method: 'POST', body: datos });
        mostrarMensaje(`Vehículo agregado: ${datos.placa}`);
        cargar();
      } catch (error) { mostrarError(error); }
    };

    document.getElementById('lista-vehiculos').onclick = async (evento) => {
      const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
      const vehiculo = vehiculos.find((v) => v.id === Number(idEditar || idEliminar));
      if (!vehiculo) return;
      try {
        if (idEditar) {
          const datos = await pedirDatos(`Editar vehículo ${vehiculo.placa}`, await camposVehiculo(), vehiculo);
          if (!datos) return;
          await api(`/vehiculos/${vehiculo.id}`, { method: 'PUT', body: datos });
          mostrarMensaje('Cambios guardados');
        } else {
          if (!(await confirmar(`¿Eliminar el vehículo ${vehiculo.placa}?`, 'Eliminar vehículo'))) return;
          await api(`/vehiculos/${vehiculo.id}`, { method: 'DELETE' });
          mostrarMensaje('Vehículo eliminado');
        }
        cargar();
      } catch (error) { mostrarError(error); }
    };
  }

  cargar();
};
