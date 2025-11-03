const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken } = require("../middlewares/authMiddleware"); 

router.get('/', verificarToken, eventoController.obtenerEventos);
router.post('/', verificarToken, eventoController.guardarEvento);
router.delete('/:id', verificarToken,  eventoController.eliminarEvento);

module.exports = router;
