// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador
// y decide qué rutas exigen token y quién puede usarlas.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/envios.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                      // todas las rutas exigen token

router.get('/', controller.listar);              // listar todos los envios (cualquier rol autenticado)
router.get('/:id', controller.obtener);          // obtener un envio por id (cualquier rol autenticado)
router.post('/', requiereRol('administrador', 'despacho'), controller.crear);              // crear un envio
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);       // actualizar un envio
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);      // eliminar un envio

module.exports = router;
