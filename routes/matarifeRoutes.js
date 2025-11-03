const express = require('express');
const router = express.Router();
const matarifeController = require('../controllers/matarifeController');
const { verificarToken } = require("../middlewares/authMiddleware");

router.get('/', verificarToken, matarifeController.obtenerMatarifes);
router.get('/:idMatarife', verificarToken, matarifeController.obtenerMatarife);
router.post('/', verificarToken, matarifeController.crearMatarife);
router.put('/:idMatarife', verificarToken, matarifeController.editarMatarife);
router.delete('/:idMatarife', verificarToken, matarifeController.eliminarMatarife);

module.exports = router;
