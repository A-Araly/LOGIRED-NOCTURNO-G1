// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/conductores.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');​

const router = Router();
router.use(verificarToken);    

// Taller 2: agregar PUT /:id (actualizar) y DELETE /:id (eliminar)
router.get('/', controller.listar);      // listar todos los conductores
router.get('/:id', controller.obtener);  // obtener un conductor por id
router.post('/',requiereRol('administrador'),controller.crear);      // crear un conductor
router.put('/:id', requiereRol('administrador'), controller.actualizar); // actualizar un conductor
router.delete('/:id', requiereRol('administrador'), controller.eliminar); // eliminar un conductor


module.exports = router;
