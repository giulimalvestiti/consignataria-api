const express = require('express');
const router = express.Router();
const gordosController = require('../controllers/gordosController');
const { verificarToken } = require("../middlewares/authMiddleware"); // funciona igual con const vt = require..., después vt.verificarToken

// Importás el controlador del Excel
const { generarExcelProductor } = require('../controllers/reporteGordosController');

// Obtener todas las cargas gordo
router.get("/", verificarToken, gordosController.obtenerCargasGordo);

// Obtener una carga gordo por ID
router.get("/:idCargaGordo", verificarToken, gordosController.obtenerCargaGordo);

// Crear una nueva carga gordo
router.post("/", verificarToken, gordosController.crearCargaGordo);

// Editar una carga gordo
router.put("/:idCargaGordo", verificarToken, gordosController.editarCargaGordo);

// Eliminar una carga gordo
router.delete("/:idCargaGordo", verificarToken, gordosController.eliminarCargaGordo);


// Nueva ruta para generar el Excel
router.post('/reporte-productor', generarExcelProductor);


module.exports = router;
