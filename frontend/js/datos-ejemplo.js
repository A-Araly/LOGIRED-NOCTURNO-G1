// =====================================================================
// DATOS DE EJEMPLO (solo para MODO = 'ejemplo')
// Son las mismas filas iniciales de los schema.sql de cada microservicio.
// El simulador de js/api.js responde con la MISMA forma que la API real:
// cada envío sale con su objeto cliente, como lo compone ms-envios.
// =====================================================================
const DATOS_EJEMPLO = {
  usuarios: [
    { id: 1, nombre: 'Administrador General', email: 'admin@empresa.com',
      rol: 'administrador', activo: true, password: 'Admin2026*' },
    { id: 2, nombre: 'Usuario Flota', email: 'flota@empresa.com',
      rol: 'flota', activo: true, password: 'Flota2026*' },
    { id: 3, nombre: 'Usuario Despacho', email: 'despacho@empresa.com',
      rol: 'despacho', activo: true, password: 'Despacho2026*' },
  ],
  clientes: [
    { id: 1, nombre: 'cliente1', documento: '1111777999', telefono: '3115644230', email: 'cliente1@empresa.com', ciudad: 'cali' },
    { id: 2, nombre: 'cliente2', documento: '1111777888', telefono: '5778925985', email: 'cliente2@empresa.com', ciudad: 'medellin' },
    { id: 3, nombre: 'cliente3', documento: '1111777666', telefono: '3004567890', email: 'cliente3@empresa.com', ciudad: 'bogota' },
  ],
  envios: [
    { id: 1, numero_guia: 'LR-2026-567890', cliente_id: 1, peso_kg: 5, ciudad_destino: 'Bogota',
      direccion_destino: 'calle 456', estado: 'registrado', fecha_registro: '2024-06-01' },
    { id: 2, numero_guia: 'LR-2026-567891', cliente_id: 2, peso_kg: 2, ciudad_destino: 'Cali',
      direccion_destino: 'carrera 56', estado: 'en_transito', fecha_registro: '2024-06-02' },
    { id: 3, numero_guia: 'LR-2026-567892', cliente_id: 3, peso_kg: 10, ciudad_destino: 'Medellin',
      direccion_destino: 'calle 123', estado: 'entregado', fecha_registro: '2024-06-03' },
  ],
  conductores: [
    { id: 1, nombre: 'Juan Pérez', cedula: '123456789', categoria: 'A', sede: 'Cali' },
    { id: 2, nombre: 'Laura Gómez', cedula: '987654321', categoria: 'B', sede: 'Medellin' },
    { id: 3, nombre: 'Andrés Castillo', cedula: '456789123', categoria: 'C', sede: 'Bogota' },
  ],
  vehiculos: [
    { id: 1, placa: 'ABC123', tipo: 'furgon', capacidad_kg: 1200, estado: 'disponible', conductor_id: 1 },
    { id: 2, placa: 'DEF456', tipo: 'camion', capacidad_kg: 5000, estado: 'en_ruta', conductor_id: 2 },
    { id: 3, placa: 'GHI789', tipo: 'moto', capacidad_kg: 50, estado: 'mantenimiento', conductor_id: 3 },
  ],
};
