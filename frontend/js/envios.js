// =====================================================================
// PANTALLA DE ENVÍOS (responsable: ms-envios · Vanessa)
// Usa: GET /envios?estado=, POST /envios, PUT /envios/:id, DELETE /envios/:id
// El nombre y el teléfono del cliente llegan DENTRO de cada envío
// (composición que hace ms-envios): esta pantalla no le pregunta nada a
// ms-clientes para listar. Solo el formulario pide GET /clientes, para
// llenar la lista de opciones.
// =====================================================================
const ESTADOS_ENVIO = [
  { valor: 'registrado', texto: 'Registrado' },
  { valor: 'en_transito', texto: 'En tránsito' },
  { valor: 'entregado', texto: 'Entregado' },
];
const textoEstadoEnvio = (e) => (ESTADOS_ENVIO.find((x) => x.valor === e) || { texto: e }).texto;

PANTALLAS.envios = async function (contenedor, { editar, titulo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-envios">Cargando…</p>
      </div>
      <div class="herramientas">
        <div class="filtro" role="group" aria-label="Filtrar por estado">
          <button data-estado="" aria-pressed="true">Todos</button>
          ${ESTADOS_ENVIO.map((e) => `<button data-estado="${e.valor}" aria-pressed="false">${e.texto}</button>`).join('')}
        </div>
        ${editar ? '<button class="boton" id="nuevo-envio">Registrar envío</button>' : ''}
      </div>
    </div>
    <div id="aviso-envios"></div>
    <div class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Guía</th>
            <th scope="col">Cliente</th>
            <th scope="col">Destino</th>
            <th scope="col">Peso</th>
            <th scope="col">Estado</th>
            ${editar ? '<th scope="col"><span class="oculto">Acciones</span></th>' : ''}
          </tr>
        </thead>
        <tbody id="lista-envios"></tbody>
      </table>
    </div>`;

  let envios = [];
  let estado = '';

  const pintar = () => {
    // Si ms-clientes no respondió, ms-envios manda cliente: null y un aviso
    const aviso = envios.find((e) => e.aviso);
    document.getElementById('aviso-envios').innerHTML = aviso
      ? `<p class="mensaje mensaje-alerta">No se pudieron cargar los datos de los clientes (${esc(aviso.aviso)}). Los envíos se muestran sin ellos.</p>`
      : '';
    const enTransito = envios.filter((e) => e.estado === 'en_transito').length;
    document.getElementById('resumen-envios').textContent = estado
      ? `${envios.length} envíos ${textoEstadoEnvio(estado).toLowerCase()}`
      : `${envios.length} envíos, ${enTransito} en tránsito`;

    document.getElementById('lista-envios').innerHTML = envios.length
      ? envios.map((e) => `
        <tr>
          <td><strong>${esc(e.numero_guia)}</strong>
              <span class="sub">Registrado el ${formatoFecha(e.fecha_registro)}</span></td>
          <td>
            ${e.cliente
              ? `${esc(e.cliente.nombre)}<span class="sub">${esc(e.cliente.telefono)}</span>`
              : `<span class="sub">Cliente ${esc(e.cliente_id)} (sin datos)</span>`}
          </td>
          <td>${esc(e.ciudad_destino)}<span class="sub">${esc(e.direccion_destino)}</span></td>
          <td>${esc(e.peso_kg)} kg</td>
          <td><span class="sello sello-${esc(e.estado)}">${esc(textoEstadoEnvio(e.estado))}</span></td>
          ${editar ? `
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${e.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${e.id}">Eliminar</button>
          </td>` : ''}
        </tr>`).join('')
      : `<tr><td class="vacio" colspan="6">No hay envíos ${estado ? 'con ese estado' : 'registrados'}.</td></tr>`;
  };

  const cargar = async () => {
    try {
      envios = await api(estado ? `/envios?estado=${estado}` : '/envios');
      pintar();
    } catch (error) {
      document.getElementById('resumen-envios').textContent = 'No se pudieron cargar los envíos.';
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

  // Campos del formulario: la lista de clientes se pide a ms-clientes
  const camposEnvio = async () => {
    const clientes = await api('/clientes');
    return [
      { nombre: 'numero_guia', etiqueta: 'Número de guía', ayuda: 'LR-2026-000123' },
      { nombre: 'cliente_id', etiqueta: 'Cliente', tipo: 'select', numero: true,
        opciones: clientes.map((c) => ({ valor: c.id, texto: `${c.nombre} (${c.telefono})` })) },
      { nombre: 'peso_kg', etiqueta: 'Peso (kg)', tipo: 'number', min: 0 },
      { nombre: 'ciudad_destino', etiqueta: 'Ciudad de destino' },
      { nombre: 'direccion_destino', etiqueta: 'Dirección de destino' },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ESTADOS_ENVIO },
    ];
  };

  if (editar) {
    document.getElementById('nuevo-envio').onclick = async () => {
      try {
        const datos = await pedirDatos('Registrar envío', await camposEnvio(),
          { estado: 'registrado' }, 'Registrar envío');
        if (!datos) return;
        const nuevo = await api('/envios', { method: 'POST', body: datos });
        mostrarMensaje(`Envío registrado: ${nuevo.numero_guia}`);
        cargar();
      } catch (error) { mostrarError(error); }
    };

    document.getElementById('lista-envios').onclick = async (evento) => {
      const idEditar = evento.target.dataset.editar;
      const idEliminar = evento.target.dataset.eliminar;
      const envio = envios.find((e) => e.id === Number(idEditar || idEliminar));
      if (!envio) return;
      try {
        if (idEditar) {
          const datos = await pedirDatos(`Editar envío ${envio.numero_guia}`, await camposEnvio(), envio);
          if (!datos) return;
          await api(`/envios/${envio.id}`, { method: 'PUT', body: datos });
          mostrarMensaje('Cambios guardados');
        } else {
          if (!(await confirmar(`¿Eliminar el envío ${envio.numero_guia}?`, 'Eliminar envío'))) return;
          await api(`/envios/${envio.id}`, { method: 'DELETE' });
          mostrarMensaje('Envío eliminado');
        }
        cargar();
      } catch (error) { mostrarError(error); }
    };
  }

  cargar();
};
