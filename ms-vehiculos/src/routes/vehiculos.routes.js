// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y decide qué rutas exigen token y quién puede usarlas.
const { Router } = require('express');
const controller = require('../controllers/vehiculos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

// Tabla de permisos del Taller 1
const PUEDEN_CONSULTAR = ['administrador', 'despacho', 'flota'];
const PUEDEN_MODIFICAR = ['administrador', 'flota'];

const router = Router();

router.use(verificarToken); // todas las rutas exigen token

router.get('/', requiereRol(...PUEDEN_CONSULTAR), controller.listar);          // listar todos los vehículos
router.get('/:id', requiereRol(...PUEDEN_CONSULTAR), controller.obtener);      // obtener un vehículo por id
router.post('/', requiereRol(...PUEDEN_MODIFICAR), controller.crear);          // crear un vehículo
router.put('/:id', requiereRol(...PUEDEN_MODIFICAR), controller.actualizar);   // actualizar un vehículo por id
router.delete('/:id', requiereRol(...PUEDEN_MODIFICAR), controller.eliminar);  // eliminar un vehículo por id

module.exports = router;