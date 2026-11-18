// =====================================================================
// PANTALLA DE CONDUCTORES (responsable: ms-conductores · Jacobo)
// Usa: GET /conductores, POST /conductores, PUT /conductores/:id, DELETE /conductores/:id
// ms-conductores es de los CONSULTADOS: ms-vehiculos le pide
// GET /conductores/:id y GET /conductores?ids=... para validar y componer.
// =====================================================================
const CATEGORIAS_LICENCIA = ['A', 'B', 'C'];
const CAMPOS_CONDUCTOR = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'cedula', etiqueta: 'Cédula' },
  { nombre: 'categoria', etiqueta: 'Categoría de licencia', tipo: 'select',
    opciones: CATEGORIAS_LICENCIA.map((c) => ({ valor: c, texto: c })) },
  { nombre: 'sede', etiqueta: 'Sede' },
];

PANTALLAS.conductores = async function (contenedor, { editar, titulo }) {
  contenedor.innerHTML = `
    <div class="cabecera-seccion">
      <div>
        <h1>${esc(titulo)}</h1>
        <p class="resumen" id="resumen-conductores">Cargando…</p>
      </div>
      <div class="herramientas">
        <input type="search" id="buscar-conductor" placeholder="Buscar por nombre o sede" aria-label="Buscar conductor">
        ${editar ? '<button class="boton" id="nuevo-conductor">Agregar conductor</button>' : ''}
      </div>
    </div>
    <div class="tabla-envoltura">
      <table class="tabla">
        <thead>
          <tr>
            <th scope="col">Conductor</th>
            <th scope="col">Cédula</th>
            <th scope="col">Licencia</th>
            <th scope="col">Sede</th>
            ${editar ? '<th scope="col"><span class="oculto">Acciones</span></th>' : ''}
          </tr>
        </thead>
        <tbody id="lista-conductores"></tbody>
      </table>
    </div>`;

  let conductores = [];

  const pintar = () => {
    const texto = document.getElementById('buscar-conductor').value.trim().toLowerCase();
    const visibles = conductores.filter((c) => `${c.nombre} ${c.sede}`.toLowerCase().includes(texto));
    document.getElementById('resumen-conductores').textContent = `${conductores.length} conductores registrados`;
    document.getElementById('lista-conductores').innerHTML = visibles.length
      ? visibles.map((c) => `
        <tr>
          <td><strong>${esc(c.nombre)}</strong></td>
          <td>${esc(c.cedula)}</td>
          <td><span class="etiqueta-rol">Categoría ${esc(c.categoria)}</span></td>
          <td>${esc(c.sede)}</td>
          ${editar ? `
          <td class="acciones">
            <button class="boton boton-suave" data-editar="${c.id}">Editar</button>
            <button class="boton boton-peligro" data-eliminar="${c.id}">Eliminar</button>
          </td>` : ''}
        </tr>`).join('')
      : `<tr><td class="vacio" colspan="5">No hay conductores que coincidan.</td></tr>`;
  };

  const cargar = async () => {
    try {
      conductores = await api('/conductores');
      pintar();
    } catch (error) {
      document.getElementById('resumen-conductores').textContent = 'No se pudieron cargar los conductores.';
      mostrarError(error);
    }
  };

  document.getElementById('buscar-conductor').oninput = pintar;

  if (editar) {
    document.getElementById('nuevo-conductor').onclick = async () => {
      const datos = await pedirDatos('Agregar conductor', CAMPOS_CONDUCTOR, { categoria: 'B' }, 'Agregar conductor');
      if (!datos) return;
      try {
        await api('/conductores', { method: 'POST', body: datos });
        mostrarMensaje(`Conductor agregado: ${datos.nombre}`);
        cargar();
      } catch (error) { mostrarError(error); }
    };

    document.getElementById('lista-conductores').onclick = async (evento) => {
      const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
      const conductor = conductores.find((c) => c.id === Number(idEditar || idEliminar));
      if (!conductor) return;
      try {
        if (idEditar) {
          const datos = await pedirDatos('Editar conductor', CAMPOS_CONDUCTOR, conductor);
          if (!datos) return;
          await api(`/conductores/${conductor.id}`, { method: 'PUT', body: datos });
          mostrarMensaje('Cambios guardados');
        } else {
          if (!(await confirmar(`¿Eliminar a ${conductor.nombre}?`, 'Eliminar conductor'))) return;
          await api(`/conductores/${conductor.id}`, { method: 'DELETE' });
          mostrarMensaje(`Conductor eliminado: ${conductor.nombre}`);
        }
        cargar();
      } catch (error) { mostrarError(error); }
    };
  }

  cargar();
};
