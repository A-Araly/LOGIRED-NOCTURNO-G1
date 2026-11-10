// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/envios.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los envios
router.get('/:id', controller.obtener);  // obtener un envio por id
router.post('/', controller.crear);      // crear un envio
// Taller 2: agregar PUT /:id (actualizar) y DELETE /:id (eliminar)



module.exports = router;
