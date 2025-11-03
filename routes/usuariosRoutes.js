const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const { verificarToken, verificarAdmin } = require('../middlewares/authMiddleware');

// Listar
router.get('/', verificarToken, verificarAdmin, usuariosController.listar);

// Crear
router.post('/', verificarToken, verificarAdmin, usuariosController.crear);

// Editar
router.put('/:id', verificarToken, verificarAdmin, usuariosController.editar);

// Borrar
router.delete('/:id', verificarToken, verificarAdmin, usuariosController.borrar);

module.exports = router;
