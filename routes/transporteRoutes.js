const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const { verificarToken } = require("../middlewares/authMiddleware"); //es lo mismo si pongo const vt y dsp llamo a vt.verificarToken

router.get('/', verificarToken, transporteController.obtenerTransportes);
router.get('/:idTransporte', verificarToken, transporteController.obtenerTransporte);
router.post('/', verificarToken, transporteController.crearTransporte);
router.put('/:idTransporte', verificarToken, transporteController.editarTransporte);
router.delete('/:idTransporte', verificarToken, transporteController.eliminarTransporte);

module.exports = router;
