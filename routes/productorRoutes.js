const express = require('express');
const router = express.Router();
const productorController = require('../controllers/productorController');
const { verificarToken } = require("../middlewares/authMiddleware");

router.get('/', verificarToken, productorController.obtenerProductores);
router.get('/:idProductor', verificarToken, productorController.obtenerProductor);
router.post('/', verificarToken, productorController.crearProductor);
router.put('/:idProductor', verificarToken,  productorController.editarProductor);
router.delete('/:idProductor', verificarToken, productorController.eliminarProductor);

module.exports = router;
