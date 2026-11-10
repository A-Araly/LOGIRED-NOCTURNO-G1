// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);

router.get('/me', controller.miPerfil);                       // cualquier rol: sus datos
router.get('/:id', propioOAdministrador, controller.obtener);  // propio o administrador

router.get('/', controller.listar);
router.post('/', requiereRol("administrador", "despacho"),controller.crear);
router.put('/:id', requiereRol("administrador", "despacho"), controller.actualizar);
router.delete('/:id', requiereRol("administrador", "despacho"), controller.eliminar);

module.exports = router;
